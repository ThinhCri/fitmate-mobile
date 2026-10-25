# Closed testing update: 0.1.1 (versionCode 2)

Prepared locally, not a built/signed/released artifact. Version 2 is valid only if Play's highest uploaded versionCode is still 1. If any track already used 2 or higher, pick a higher unused code and update both `mobile/app.json` (`expo.android.versionCode`) and ignored `mobile/android/app/build.gradle` (`versionCode`). Keep `expo.version` / native `versionName` aligned. Do not recreate signing keys, change package `vn.fitmate.app`, or run prebuild --clean.

## Before releasing

- Backend OTP is implemented locally but the deployed API returned 404 on 2026-10-25. Operator-approved backend rollout and isolated PostgreSQL tests must precede email OTP UAT. Do not declare the app deletion flow operational merely because a bundle builds.
- Run from `D:\Ky8\exe201\FitmateAI_FE\mobile`: `npm run type-check`, `npm test`, `npm run lint`. New permission tests were written but not run in the latest follow-ups.
- Verify on Android: notification/camera status updates on return from system settings; full Vietnamese labels; comment composer above keyboard/system bars; workout timer/media; OTP send/receive/incorrect/expired/success; success signs out, failure does not. An AAB cannot simply be installed like an APK; use a Play test track/internal app sharing or an appropriately signed APK generated for device verification. Do not upload the unsigned verification AAB.

## Build in PowerShell

```powershell
Set-Location D:\Ky8\exe201\FitmateAI_FE\mobile
.\build-release-secure.ps1
```

If script policy blocks this trusted local script, use `powershell -ExecutionPolicy Bypass -File .\build-release-secure.ps1` for this invocation only. The script privately prompts for the existing upload-keystore password; do not send it in chat or put it in command arguments. Requires the existing `%USERPROFILE%\.android\fitmate-upload.jks`, Android Studio JDK/SDK, local `.env` with production API URL, and gitignored Firebase `google-services.json` or `FITMATE_FIREBASE_ANDROID_FILE`. Missing prerequisites fail closed. It checks native/config version alignment and R8 optimization metadata. Keep the generated matching `mapping.txt` for crash deobfuscation.

Bundle: `D:\Ky8\exe201\FitmateAI_FE\mobile\android\app\build\outputs\bundle\release\app-release.aab`.

## Play Console

Use the existing Fitmate app → Testing → Closed testing → Alpha → Create new release. Upload the new signed AAB, review versionCode/versionName and release notes, then review and submit changes for Google review (including Publishing overview when requested). Do not create a second app or replace the tester group.

Existing eligible testers use the same listing/testing link. Once the release is approved and available, they can update in Google Play; automatic update depends on their Play/device settings. Do not ask them to uninstall: uninstalling can discard local data.

Suggested notes (only after those paths are verified):

```xml
<vi>
Cải thiện cài đặt quyền thông báo và máy ảnh.
Bổ sung xác thực email trước khi gửi yêu cầu xóa tài khoản.
Sửa hiển thị tiếng Việt, biểu tượng ứng dụng và giao diện bình luận.
Khắc phục bộ đếm thời gian tập luyện và tối ưu bản Android.
</vi>
```

References: [Google Play release workflow](https://support.google.com/googleplay/android-developer/answer/9859348), [Android versioning](https://developer.android.com/studio/publish/versioning).
