const fs = require('node:fs');
const path = require('node:path');

(function fix() {
  try {
    const buildGradlePath = path.join(__dirname, '../android/build.gradle')
    const text = fs.readFileSync(buildGradlePath, 'utf-8')
    if (!/excludeAppGlideModule = true/gi.test(text)) {
      const newText = text.replace('ext {', `ext { excludeAppGlideModule = true`);
      fs.writeFileSync(buildGradlePath, newText, 'utf-8');
    }
  } catch (error) {
    console.error(error);
  }
})();
