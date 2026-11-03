import {createRequire} from 'node:module';
import {describe,it,expect} from 'vitest';
const {adaptManifest,adaptStyles}=createRequire(import.meta.url)('../../../plugins/withAndroidAdaptiveWindow.js');
describe('Android adaptive window configuration',()=>{
 it('removes orientation/aspect constraints while preserving keyboard and activity setup',()=>{
  const manifest={manifest:{application:[{$:{},activity:[{$:{'android:name':'.MainActivity','android:screenOrientation':'portrait','android:maxAspectRatio':'2.1','android:windowSoftInputMode':'adjustResize'}}]}]}};
  adaptManifest(manifest); const attrs=manifest.manifest.application[0].activity[0].$ as Record<string,string>;
  expect(attrs['android:screenOrientation']).toBeUndefined();expect(attrs['android:maxAspectRatio']).toBeUndefined();expect(attrs['android:resizeableActivity']).toBe('true');expect(attrs['android:windowSoftInputMode']).toBe('adjustResize');expect(adaptManifest(manifest)).toEqual(manifest);
 });
 it('removes obsolete system bar overrides without removing the splash theme',()=>{
  const styles={resources:{style:[{$:{name:'AppTheme'},item:[{$:{name:'android:statusBarColor'},_:'transparent'},{$:{name:'android:windowOptOutEdgeToEdgeEnforcement'},_:'true'},{$:{name:'android:windowBackground'},_:'@drawable/splashscreen_logo'}]}]}};
  adaptStyles(styles);expect(styles.resources.style[0].item).toEqual([{$:{name:'android:windowBackground'},_:'@drawable/splashscreen_logo'}]);expect(adaptStyles(styles)).toEqual(styles);
 });
});
