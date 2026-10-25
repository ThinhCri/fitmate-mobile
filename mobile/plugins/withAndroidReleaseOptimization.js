const { withAppBuildGradle, withGradleProperties } = require('expo/config-plugins');

const releaseProperties = {
  'android.enableMinifyInReleaseBuilds': 'true',
  'android.enableShrinkResourcesInReleaseBuilds': 'true',
};

function optimizeGradleProperties(properties) {
  return [
    ...properties.filter((item) => item.type !== 'property' || !Object.hasOwn(releaseProperties, item.key)),
    ...Object.entries(releaseProperties).map(([key, value]) => ({ type: 'property', key, value })),
  ];
}

function optimizeAppBuildGradle(contents) {
  const updated = contents.replace(/getDefaultProguardFile\((['"])proguard-android\.txt\1\)/g,
    'getDefaultProguardFile("proguard-android-optimize.txt")');
  if (!/getDefaultProguardFile\((['"])proguard-android-optimize\.txt\1\)/.test(updated)) {
    throw new Error('Android release optimization: unrecognized app/build.gradle. Review the ProGuard release configuration instead of silently skipping it.');
  }
  return updated;
}

function withAndroidReleaseOptimization(config) {
  config = withGradleProperties(config, (mod) => {
    mod.modResults = optimizeGradleProperties(mod.modResults);
    return mod;
  });
  return withAppBuildGradle(config, (mod) => {
    if (mod.modResults.language !== 'groovy') {
      throw new Error('Android release optimization currently requires the reviewed Groovy Gradle template.');
    }
    mod.modResults.contents = optimizeAppBuildGradle(mod.modResults.contents);
    return mod;
  });
}

module.exports = withAndroidReleaseOptimization;
module.exports.optimizeGradleProperties = optimizeGradleProperties;
module.exports.optimizeAppBuildGradle = optimizeAppBuildGradle;
