const fs = require('fs');
const config = require('./tailwind.config.js');

let themeCss = '@theme {\n';
for (const [key, value] of Object.entries(config.theme.extend.colors)) {
    themeCss += `  --color-${key}: ${value};\n`;
}
for (const [key, value] of Object.entries(config.theme.extend.borderRadius)) {
    const k = key === 'DEFAULT' ? 'radius' : `radius-${key}`;
    themeCss += `  --${k}: ${value};\n`;
}
for (const [key, value] of Object.entries(config.theme.extend.spacing)) {
    themeCss += `  --spacing-${key}: ${value};\n`;
}
for (const [key, value] of Object.entries(config.theme.extend.fontFamily)) {
    themeCss += `  --font-${key}: ${value.map(v => '"' + v + '"').join(', ')};\n`;
}
for (const [key, value] of Object.entries(config.theme.extend.fontSize)) {
    themeCss += `  --text-${key}: ${value[0]};\n`;
    themeCss += `  --text-${key}--line-height: ${value[1].lineHeight};\n`;
    themeCss += `  --text-${key}--letter-spacing: ${value[1].letterSpacing};\n`;
    themeCss += `  --text-${key}--font-weight: ${value[1].fontWeight};\n`;
}
themeCss += '}\n';

let indexCss = fs.readFileSync('src/index.css', 'utf8');
indexCss = indexCss.replace('@config "../tailwind.config.js";', themeCss);
fs.writeFileSync('src/index.css', indexCss);
console.log('Migration successful!');
