# Build a locally signed Android App Bundle without putting passwords in shell history.
# Run from PowerShell: .\build-release-secure.ps1
$ErrorActionPreference = 'Stop'

$mobileDir = $PSScriptRoot
$keystore = Join-Path $env:USERPROFILE '.android\fitmate-upload.jks'
$envFile = Join-Path $mobileDir '.env'
$gradleFile = Join-Path $mobileDir 'android\app\build.gradle'
$javaHome = 'C:\Program Files\Android\Android Studio\jbr'
$androidHome = Join-Path $env:LOCALAPPDATA 'Android\Sdk'
$firebaseConfig = if ($env:FITMATE_FIREBASE_ANDROID_FILE) {
    if ([IO.Path]::IsPathRooted($env:FITMATE_FIREBASE_ANDROID_FILE)) { $env:FITMATE_FIREBASE_ANDROID_FILE }
    else { Join-Path $mobileDir $env:FITMATE_FIREBASE_ANDROID_FILE }
} else { Join-Path $mobileDir 'google-services.json' }

if (-not (Test-Path -LiteralPath $keystore -PathType Leaf)) { throw "Upload keystore not found: $keystore" }
if (-not (Test-Path -LiteralPath $gradleFile -PathType Leaf)) { throw 'Android project not found. Do not run expo prebuild --clean; inspect the release signing configuration first.' }
if (-not (Test-Path -LiteralPath (Join-Path $javaHome 'bin\java.exe') -PathType Leaf)) { throw 'Android Studio JDK not found.' }
if (-not (Test-Path -LiteralPath $androidHome -PathType Container)) { throw 'Android SDK not found.' }
if (-not (Test-Path -LiteralPath $envFile -PathType Leaf)) { throw 'Mobile .env not found.' }
if (-not (Test-Path -LiteralPath $firebaseConfig -PathType Leaf)) {
    throw 'Firebase Android config is missing. Supply google-services.json or FITMATE_FIREBASE_ANDROID_FILE before a release build. Do not commit the config.'
}

$gradleSource = Get-Content -LiteralPath $gradleFile -Raw
$releaseConfig = (Get-Content -LiteralPath (Join-Path $mobileDir 'app.json') -Raw | ConvertFrom-Json).expo
$releaseVersion = [string]$releaseConfig.version
$releaseCode = $releaseConfig.android.versionCode
if (-not $releaseCode -or [int]$releaseCode -lt 1 -or [string]::IsNullOrWhiteSpace($releaseVersion)) {
    throw 'Set expo.version and expo.android.versionCode in app.json before building an update.'
}
if ($gradleSource -notmatch ('(?m)^\s*versionCode\s+' + [regex]::Escape([string]$releaseCode) + '\s*$') -or
    $gradleSource -notmatch ('(?m)^\s*versionName\s+"' + [regex]::Escape($releaseVersion) + '"\s*$')) {
    throw 'app.json and android/app/build.gradle versions differ. Update the native versionCode/versionName explicitly; do not use prebuild --clean.'
}
$manifestPath = Join-Path $mobileDir 'android\app\src\main\AndroidManifest.xml'
$manifestSource = Get-Content -LiteralPath $manifestPath -Raw
if ($releaseConfig.orientation -ne 'default' -or $manifestSource -match 'android:screenOrientation="(portrait|landscape|sensorPortrait|sensorLandscape|locked|nosensor)"') {
    throw 'Orientation restriction remains. Apply the adaptive-window configuration before building.'
}
Write-Host "Preparing Fitmate $releaseVersion (versionCode $releaseCode). Ensure this code exceeds every code already uploaded to Play."
if ($gradleSource -notmatch 'getDefaultProguardFile\(["'']proguard-android-optimize\.txt["'']\)') {
    throw 'Release R8 optimization is missing from android/app/build.gradle. Apply the reviewed release optimization plugin/config before building; do not run prebuild --clean.'
}
$proguardRules = Join-Path $mobileDir 'android\app\proguard-rules.pro'
if (Select-String -LiteralPath $proguardRules -Pattern '^\s*-(dontshrink|dontoptimize|dontobfuscate)\b' -Quiet) {
    throw 'App ProGuard rules disable release optimization. Review the disabling rule before building.'
}

$apiLines = @(Get-Content -LiteralPath $envFile | Where-Object { $_ -match '^EXPO_PUBLIC_API_BASE_URL=' })
if ($apiLines.Count -ne 1 -or $apiLines[0].Trim() -ne 'EXPO_PUBLIC_API_BASE_URL=https://api.fitmate.site/api/v1') {
    throw 'The release API URL must be exactly https://api.fitmate.site/api/v1.'
}

$securePassword = Read-Host 'Enter the upload keystore password (not shown)' -AsSecureString
$passwordPointer = [IntPtr]::Zero
$plainPassword = $null
$previousJavaHome = $env:JAVA_HOME
$previousAndroidHome = $env:ANDROID_HOME

try {
    $passwordPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
    $plainPassword = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($passwordPointer)
    if ([string]::IsNullOrWhiteSpace($plainPassword)) { throw 'The keystore password is required.' }

    # Gradle reads these process-scoped variables. Never print or save their values.
    $env:JAVA_HOME = $javaHome
    $env:ANDROID_HOME = $androidHome
    $env:FITMATE_UPLOAD_STORE_FILE = $keystore
    $env:FITMATE_UPLOAD_STORE_PASSWORD = $plainPassword
    $env:FITMATE_UPLOAD_KEY_ALIAS = 'fitmate-upload'
    $env:FITMATE_UPLOAD_KEY_PASSWORD = $plainPassword
    $plainPassword = $null

    Push-Location (Join-Path $mobileDir 'android')
    try {
        & .\gradlew.bat bundleRelease --no-daemon '-Pandroid.enableMinifyInReleaseBuilds=true' '-Pandroid.enableShrinkResourcesInReleaseBuilds=true'
        if ($LASTEXITCODE -ne 0) { throw "Gradle bundleRelease failed (exit $LASTEXITCODE)." }
    } finally {
        Pop-Location
    }

    $bundle = Join-Path $mobileDir 'android\app\build\outputs\bundle\release\app-release.aab'
    if (-not (Test-Path -LiteralPath $bundle -PathType Leaf)) { throw 'Gradle finished but the AAB was not found.' }
    $mapping = Join-Path $mobileDir 'android\app\build\outputs\mapping\release\mapping.txt'
    if (-not (Test-Path -LiteralPath $mapping -PathType Leaf) -or (Get-Item -LiteralPath $mapping).Length -eq 0) {
        throw 'R8 mapping.txt is missing/empty. Do not upload this bundle until release optimization is verified.'
    }
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    $archive = [IO.Compression.ZipFile]::OpenRead($bundle)
    try {
        if (-not $archive.GetEntry('BUNDLE-METADATA/com.android.tools.build.obfuscation/proguard.map')) {
            throw 'AAB is missing its R8 mapping metadata. Inspect the bundle before uploading.'
        }
        if (-not $archive.GetEntry('BUNDLE-METADATA/com.android.tools/r8.json')) {
            Write-Warning 'r8.json was not included. Review the AGP/R8 version and Play optimization report; mapping alone does not prove the 25% threshold.'
        }
    } finally { $archive.Dispose() }
    Write-Host "R8 mapping: $mapping (retain with this exact release for crash deobfuscation)"
    $item = Get-Item -LiteralPath $bundle
    Write-Host "AAB created: $($item.FullName) ($([math]::Round($item.Length / 1MB, 1)) MB)"
    Write-Host "Release: $releaseVersion (versionCode $releaseCode). Upload only after backend rollout and signed-device checks."
} finally {
    if ($passwordPointer -ne [IntPtr]::Zero) { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($passwordPointer) }
    if ($securePassword) { $securePassword.Clear() }
    $plainPassword = $null
    Remove-Item Env:FITMATE_UPLOAD_STORE_FILE, Env:FITMATE_UPLOAD_STORE_PASSWORD, Env:FITMATE_UPLOAD_KEY_ALIAS, Env:FITMATE_UPLOAD_KEY_PASSWORD -ErrorAction SilentlyContinue
    $env:JAVA_HOME = $previousJavaHome
    $env:ANDROID_HOME = $previousAndroidHome
}
