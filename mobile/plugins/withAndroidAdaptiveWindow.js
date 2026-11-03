const { withAndroidManifest, withAndroidStyles, withGradleProperties } = require('expo/config-plugins');
const obsoleteStyleItems = new Set(['android:statusBarColor','android:navigationBarColor','android:windowOptOutEdgeToEdgeEnforcement','android:windowTranslucentStatus','android:windowTranslucentNavigation']);
function adaptManifest(manifest) {
 const app = manifest.manifest.application?.[0];
 if (!app) throw new Error('Android application manifest missing');
 const activity = app.activity?.find(item => item.$?.['android:name'] === '.MainActivity');
 if (!activity) throw new Error('Android MainActivity missing');
 for(const key of ['android:screenOrientation','android:minAspectRatio','android:maxAspectRatio']) delete activity.$[key];
 activity.$['android:resizeableActivity']='true';
 delete app.$?.['android:screenOrientation'];
 return manifest;
}
function adaptStyles(resources) {
 for(const style of resources.resources.style || []) style.item=(style.item || []).filter(item=>!obsoleteStyleItems.has(item.$?.name));
 return resources;
}
function withAndroidAdaptiveWindow(config) {
 config=withAndroidManifest(config, mod=>{mod.modResults=adaptManifest(mod.modResults);return mod;});
 config=withAndroidStyles(config, mod=>{mod.modResults=adaptStyles(mod.modResults);return mod;});
 return withGradleProperties(config,mod=>{mod.modResults=mod.modResults.filter(item=>item.key!=='edgeToEdgeEnabled');mod.modResults.push({type:'property',key:'edgeToEdgeEnabled',value:'true'});return mod;});
}
module.exports=withAndroidAdaptiveWindow;
module.exports.adaptManifest=adaptManifest;
module.exports.adaptStyles=adaptStyles;
