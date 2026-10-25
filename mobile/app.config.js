const fs = require('node:fs');
const path = require('node:path');
const base = require('./app.json').expo;

// Direct Gradle builds also evaluate this config. Do not silently disable the
// JS analytics gate when the standard, gitignored native config already exists.
const androidConfig = process.env.FITMATE_FIREBASE_ANDROID_FILE ||
  (fs.existsSync(path.join(__dirname, 'google-services.json')) ? './google-services.json' : undefined);
if (androidConfig) {
  const resolved = path.resolve(__dirname, androidConfig);
  if (!fs.existsSync(resolved)) {
    throw new Error(`FITMATE_FIREBASE_ANDROID_FILE does not exist: ${resolved}`);
  }
}

module.exports = {
  ...base,
  android: androidConfig
    ? { ...base.android, googleServicesFile: path.resolve(__dirname, androidConfig) }
    : base.android,
  plugins: androidConfig
    ? [...base.plugins, '@react-native-firebase/app', '@react-native-firebase/analytics']
    : base.plugins,
  extra: {
    ...base.extra,
    firebaseAnalyticsEnabled: Boolean(androidConfig),
  },
};
