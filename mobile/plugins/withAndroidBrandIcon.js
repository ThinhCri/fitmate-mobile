const fs = require('node:fs/promises');
const path = require('node:path');
const { withDangerousMod } = require('expo/config-plugins');

// Keep the original F geometry. Uniform scale + optical centering places every
// vertex inside Android's 66dp circular safe zone on the 108dp icon canvas.
const foreground = `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp" android:height="108dp"
    android:viewportWidth="108" android:viewportHeight="108">
  <group android:pivotX="54" android:pivotY="54"
      android:scaleX="0.8" android:scaleY="0.8"
      android:translateX="-1.2" android:translateY="-1.6">
    <path android:fillColor="#FFFFFF"
        android:pathData="M30,26 L68,26 81,38 68,50 45,50 45,59 62,59 71,68 62,77 45,77 45,86 30,86 Z" />
  </group>
</vector>
`;
const background = `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp" android:height="108dp"
    android:viewportWidth="108" android:viewportHeight="108">
  <path android:fillColor="#0F766E" android:pathData="M0,0 H108 V108 H0 Z" />
</vector>
`;
const adaptive = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
  <background android:drawable="@drawable/fitmate_adaptive_background" />
  <foreground android:drawable="@drawable/fitmate_adaptive_foreground" />
  <monochrome android:drawable="@drawable/fitmate_adaptive_foreground" />
</adaptive-icon>
`;
const resources = {
  'drawable/fitmate_adaptive_foreground.xml': foreground,
  'drawable/fitmate_adaptive_background.xml': background,
  'mipmap-anydpi-v26/ic_launcher.xml': adaptive,
  'mipmap-anydpi-v26/ic_launcher_round.xml': adaptive,
};

module.exports = (config) => withDangerousMod(config, ['android', async (mod) => {
  const res = path.join(mod.modRequest.platformProjectRoot, 'app/src/main/res');
  for (const [relative, xml] of Object.entries(resources)) {
    const target = path.join(res, relative);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, xml, 'utf8');
  }
  return mod;
}]);
module.exports.resources = resources;
