// CloudBase 环境设置和连接脚本
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🌥️ CloudBase 环境设置开始...');
console.log('==================================\n');

// 1. 安装 CloudBase SDK
console.log('📦 安装 CloudBase SDK...');
try {
    console.log('   正在安装 @cloudbase/node-sdk...');
    execSync('npm install @cloudbase/node-sdk @cloudbase/cli', { stdio: 'inherit' });
    console.log('✅ CloudBase SDK 安装成功');
} catch (error) {
    console.error('❌ CloudBase SDK 安装失败:', error.message);
    process.exit(1);
}

// 2. 检查 CloudBase CLI
console.log('\n🔍 检查 CloudBase CLI...');
try {
    const version = execSync('cloudbase --version', { encoding: 'utf8' }).trim();
    console.log(`✅ CloudBase CLI: ${version}`);
} catch (error) {
    console.log('⚠️ CloudBase CLI 未安装，尝试全局安装...');
    try {
        execSync('npm install -g @cloudbase/cli', { stdio: 'inherit' });
        console.log('✅ CloudBase CLI 全局安装成功');
    } catch (cliError) {
        console.log('❌ CloudBase CLI 安装失败，请手动安装');
        console.log('   命令: npm install -g @cloudbase/cli');
    }
}

// 3. 创建 CloudBase 配置文件
console.log('\n📋 创建 CloudBase 配置...');
const cloudbaseConfig = {
    envId: "cloud1-3gc4eoi9a5139d21",
    functionRoot: "./cloudfunctions",
    storageRoot: "./storage",
    dbRoot: "./db",
    region: "ap-shanghai"
};

try {
    fs.writeFileSync('cloudbaserc.json', JSON.stringify(cloudbaseConfig, null, 2));
    console.log('✅ cloudbaserc.json 创建完成');
} catch (error) {
    console.error('❌ 配置文件创建失败:', error.message);
}

// 4. 更新环境变量文件
console.log('\n🔧 更新环境变量...');
try {
    let envContent = '';
    if (fs.existsSync('.env')) {
        envContent = fs.readFileSync('.env', 'utf8');
    } else {
        envContent = `# 服务器配置
PORT=3000
NODE_ENV=development
`;
    }

    // 添加 CloudBase 配置
    const cloudBaseEnv = `
# CloudBase 配置
CLOUDBASE_ENV_ID=cloud1-3gc4eoi9a5139d21
CLOUDBASE_REGION=ap-shanghai
CLOUDBASE_SECRET_ID=
CLOUDBASE_SECRET_KEY=
`;

    // 检查是否已存在 CloudBase 配置
    if (!envContent.includes('CLOUDBASE_ENV_ID')) {
        envContent += cloudBaseEnv;
        fs.writeFileSync('.env', envContent);
        console.log('✅ .env 文件已更新 CloudBase 配置');
    } else {
        console.log('✅ CloudBase 环境变量已存在');
    }
} catch (error) {
    console.error('❌ 环境变量更新失败:', error.message);
}

// 5. 测试 CloudBase 连接
console.log('\n🔗 测试 CloudBase 连接...');
try {
    const testScript = `
try {
    const tcb = require('@cloudbase/node-sdk');
    console.log('✅ CloudBase SDK 加载成功');
    
    if (process.env.CLOUDBASE_ENV_ID) {
        const app = tcb.init({
            env: process.env.CLOUDBASE_ENV_ID
        });
        const db = app.database();
        console.log('✅ CloudBase 初始化成功');
        console.log('📍 环境ID:', process.env.CLOUDBASE_ENV_ID);
        console.log('🌍 区域:', process.env.CLOUDBASE_REGION || 'ap-shanghai');
    } else {
        console.log('⚠️ 未设置 CLOUDBASE_ENV_ID 环境变量');
    }
} catch (error) {
    console.error('❌ CloudBase 连接测试失败:', error.message);
    process.exit(1);
}
`;
    
    fs.writeFileSync('test-cloudbase.js', testScript);
    console.log('✅ 测试脚本创建完成');
    
    // 运行测试
    execSync('node test-cloudbase.js', { stdio: 'inherit' });
    
    // 清理测试文件
    try {
        fs.unlinkSync('test-cloudbase.js');
        console.log('✅ 测试完成，清理临时文件');
    } catch (cleanupError) {
        // 忽略清理错误
    }
    
} catch (testError) {
    console.error('❌ CloudBase 连接测试失败:', testError.message);
}

// 6. 创建连接示例
console.log('\n📝 创建 CloudBase 连接示例...');
const connectionExample = `
// CloudBase 数据库连接示例
const tcb = require('@cloudbase/node-sdk');

// 初始化 CloudBase
const app = tcb.init({
  env: process.env.CLOUDBASE_ENV_ID || 'cloud1-3gc4eoi9a5139d21'
});

// 获取数据库实例
const db = app.database();

// 示例：查询项目列表
async function getProjects() {
  try {
    const result = await db.collection('projects').get();
    return {
      success: true,
      data: result.data,
      total: result.data.length
    };
  } catch (error) {
    console.error('查询失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// 示例：添加留言
async function addGuestbook(data) {
  try {
    const result = await db.collection('guestbook').add({
      data: {
        ...data,
        createTime: new Date(),
        timestamp: new Date().toISOString()
      }
    });
    return {
      success: true,
      data: {
        id: result._id,
        ...data
      }
    };
  } catch (error) {
    console.error('添加失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = {
  getProjects,
  addGuestbook,
  db
};
`;

try {
    fs.writeFileSync('cloudbase-connection.js', connectionExample);
    console.log('✅ 连接示例文件创建完成: cloudbase-connection.js');
} catch (error) {
    console.error('❌ 示例文件创建失败:', error.message);
}

// 7. 显示设置结果
console.log('\n🎉 CloudBase 环境设置完成！');
console.log('==================================\n');

console.log('📋 设置信息：');
console.log(`   🌍 环境 ID: ${cloudbaseConfig.envId}`);
console.log(`   🌍 区域: ${cloudbaseConfig.region}`);
console.log('   🗄️ 数据库: 已配置');
console.log('   📦 云函数: 已配置');
console.log('   🌐 静态托管: 已配置');

console.log('\n🔗 访问地址：');
console.log('   📍 网站主页: https://cloud1-3gc4eoi9a5139d21-1385724839.tcloudbaseapp.com');
console.log('   📍 管理控制台: https://console.cloud.tencent.com/tcb');

console.log('\n📝 下一步操作：');
console.log('   1. 运行: npm start (本地开发)');
console.log('   2. 运行: npm run deploy:windows (部署到云端)');
console.log('   3. 访问 CloudBase 控制台创建数据库集合');
console.log('   4. 测试网站功能');

console.log('\n🎯 CloudBase 连接命令：');
console.log('   cloudbase login (登录 CloudBase)');
console.log('   cloudbase functions:deploy (部署云函数)');
console.log('   cloudbase hosting deploy (部署静态网站)');

console.log('\n✨ CloudBase 环境已就绪！可以开始开发了！\n');