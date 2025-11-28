const fs = require('fs');
const path = require('path');

// 创建云函数部署脚本
async function deployCloudFunctions() {
    console.log('=== 部署睡眠咨询全栈云函数 ===');
    
    const functions = [
        'submit-contact',
        'submit-sleep-log', 
        'calculate-sleep'
    ];
    
    for (const funcName of functions) {
        try {
            console.log(`\n📤 部署云函数: ${funcName}`);
            
            // 检查文件结构
            const funcPath = path.join(__dirname, 'cloudfunctions', funcName);
            const indexPath = path.join(funcPath, 'index.js');
            const packagePath = path.join(funcPath, 'package.json');
            
            if (!fs.existsSync(indexPath)) {
                console.error(`❌ 缺少 index.js: ${indexPath}`);
                continue;
            }
            
            if (!fs.existsSync(packagePath)) {
                console.error(`❌ 缺少 package.json: ${packagePath}`);
                continue;
            }
            
            console.log(`✅ 文件结构检查通过: ${funcName}`);
            
        } catch (error) {
            console.error(`❌ ${funcName} 部署准备失败:`, error.message);
        }
    }
    
    console.log('\n🎯 准备手动部署命令:');
    console.log('请在命令行中依次执行:');
    console.log('');
    
    functions.forEach(funcName => {
        console.log(`cd cloudfunctions/${funcName} && npm install && cd ../..`);
    });
    
    console.log('');
    console.log('# 使用 CloudBase CLI 部署:');
    functions.forEach(funcName => {
        console.log(`tcb fn deploy ${funcName}`);
    });
    
    console.log('');
    console.log('# 配置 HTTP 路径:');
    console.log('tcb service create -f submit-contact -p /api/contact');
    console.log('tcb service create -f submit-sleep-log -p /api/sleep-log');  
    console.log('tcb service create -f calculate-sleep -p /api/sleep-test');
}

// 运行部署准备
deployCloudFunctions().catch(console.error);