const JavaScriptObfuscator = require('javascript-obfuscator');
const fs = require('fs');
const path = require('path');

// 确保目标目录存在
if (!fs.existsSync('./dist')) {
    fs.mkdirSync('./dist');
}

// 混淆配置
const obfuscatorConfig = {
    compact: true,                    // 压缩代码
    controlFlowFlattening: true,      // 控制流扁平化
    controlFlowFlatteningThreshold: 0.7,
    deadCodeInjection: true,          // 添加死代码
    deadCodeInjectionThreshold: 0.4,
    debugProtection: true,            // 调试保护
    debugProtectionInterval: 4000,    // 修改为具体的数值（毫秒）
    disableConsoleOutput: false,      // 保留 console
    identifierNamesGenerator: 'hexadecimal',  // 标识符生成方式
    log: false,
    numbersToExpressions: true,       // 数字转表达式
    renameGlobals: false,             // 不重命名全局变量
    rotateStringArray: true,
    selfDefending: true,              // 自我保护
    shuffleStringArray: true,
    splitStrings: true,
    stringArray: true,
    stringArrayEncoding: ['base64'],
    stringArrayThreshold: 0.75,
    transformObjectKeys: true,
    unicodeEscapeSequence: false      // 不使用 Unicode 转义
};

// 读取源文件
const sourceCode = fs.readFileSync('./src/index.js', 'utf8');

// 执行混淆
const obfuscationResult = JavaScriptObfuscator.obfuscate(sourceCode, obfuscatorConfig);

// 写入混淆后的代码
fs.writeFileSync('./dist/index.js', obfuscationResult.getObfuscatedCode());

console.log('代码混淆完成！输出文件位置: ./dist/index.js');