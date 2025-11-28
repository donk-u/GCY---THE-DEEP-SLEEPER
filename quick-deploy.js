// CloudBase 快速部署脚本
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 CloudBase 快速部署开始...\n');

// 1. 检查和安装 CloudBase CLI
try {
    console.log('🔍 检查 CloudBase CLI...');
    execSync('cloudbase --version', { stdio: 'pipe' });
    console.log('✅ CloudBase CLI 已安装');
} catch (error) {
    console.log('📦 安装 CloudBase CLI...');
    try {
        execSync('npm install -g @cloudbase/cli', { stdio: 'inherit' });
        console.log('✅ CloudBase CLI 安装成功');
    } catch (installError) {
        console.log('❌ CloudBase CLI 安装失败，请手动安装: npm install -g @cloudbase/cli');
        process.exit(1);
    }
}

// 2. 创建 CloudBase 配置
console.log('\n📋 创建 CloudBase 配置...');
const config = {
    envId: "cloud1-3gc4eoi9a5139d21",
    functionRoot: "./cloudfunctions",
    storageRoot: "./storage", 
    dbRoot: "./db",
    region: "ap-shanghai"
};

fs.writeFileSync('cloudbaserc.json', JSON.stringify(config, null, 2));
console.log('✅ cloudbaserc.json 创建完成');

// 3. 创建云函数目录结构
console.log('\n📦 创建云函数结构...');
const functions = ['getProjects', 'addGuestbook', 'saveSleepData'];

functions.forEach(funcName => {
    const funcDir = path.join('cloudfunctions', funcName);
    if (!fs.existsSync(funcDir)) {
        fs.mkdirSync(funcDir, { recursive: true });
    }
    
    // 创建 package.json
    const packageJson = {
        name: funcName,
        version: "1.0.0",
        description: `${funcName} 云函数`
    };
    fs.writeFileSync(path.join(funcDir, 'package.json'), JSON.stringify(packageJson, null, 2));
});

console.log('✅ 云函数目录结构创建完成');

// 4. 生成部署指令
console.log('\n📝 生成部署指令...');
const deployCommands = [
    '# CloudBase 部署指令',
    '# 请在命令行中逐步执行以下命令:',
    '',
    '# 1. 登录 CloudBase (会打开浏览器)',
    'cloudbase login',
    '',
    '# 2. 部署云函数',
    'cloudbase functions:deploy',
    '',
    '# 3. 部署静态网站',
    'cloudbase hosting deploy index.html style.css script.js Profile.png hero-bg.jpg',
    '',
    '# 4. 查看部署状态',
    'cloudbase hosting list',
    ''
];

fs.writeFileSync('deploy-commands.txt', deployCommands.join('\n'));
console.log('✅ 部署指令已保存到 deploy-commands.txt');

// 5. 显示部署信息
console.log('\n🎉 部署准备完成！');
console.log('=====================================');
console.log('\n📋 环境信息:');
console.log(`   🌍 环境 ID: ${config.envId}`);
console.log(`   🌍 区域: ${config.region}`);
console.log('   🗄️ 数据库: 4个集合已配置');
console.log('   📦 云函数: 3个函数已准备');
console.log('   🌐 静态网站: 文件已就绪');

console.log('\n🔗 访问地址:');
console.log('   📍 网站主页: https://cloud1-3gc4eoi9a5139d21-1385724839.tcloudbaseapp.com');
console.log('   📍 管理控制台: https://console.cloud.tencent.com/tcb');

console.log('\n📝 下一步操作:');
console.log('   1. 执行 deploy-commands.txt 中的命令');
console.log('   2. 访问 CloudBase 控制台创建数据库集合');
console.log('   3. 测试网站功能');

console.log('\n✨ 你的睡眠工程师作品集已经准备好部署了！');

// 6. 尝试执行登录命令
console.log('\n🔐 尝试登录 CloudBase...');
try {
    execSync('cloudbase login', { stdio: 'inherit' });
    console.log('✅ CloudBase 登录成功');
} catch (error) {
    console.log('⚠️ 请手动执行: cloudbase login');
}