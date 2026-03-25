const { execSync } = require('child_process');
const fs = require('fs');
try {
    const out = execSync('npx tsc -b', { encoding: 'utf8' });
    fs.writeFileSync('tsc.log', out);
} catch (e) {
    fs.writeFileSync('tsc.log', e.stdout + '\n' + e.stderr);
}
