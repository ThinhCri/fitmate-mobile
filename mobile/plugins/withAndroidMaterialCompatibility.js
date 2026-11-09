const { withAppBuildGradle } = require('expo/config-plugins');
const marker = '// Fitmate: Android 15 Material window compatibility';
const dependency = `
${marker}
dependencies {
    implementation('com.google.android.material:material') {
        version { strictly('1.14.0') }
        because('Use the stable Android 15 window/insets fixes for pickers and sheets')
    }
}
`;
function configureMaterial(contents) {
  if (contents.includes(marker)) {
    if (!contents.includes("strictly('1.14.0')")) throw new Error('Review the existing Fitmate Material override before changing it.');
    return contents;
  }
  if (!contents.includes('com.android.application')) throw new Error('Expected Android app Gradle configuration.');
  return contents.trimEnd() + '\n' + dependency;
}
module.exports = config => withAppBuildGradle(config, mod => {
  mod.modResults.contents = configureMaterial(mod.modResults.contents);
  return mod;
});
module.exports.configureMaterial = configureMaterial;
