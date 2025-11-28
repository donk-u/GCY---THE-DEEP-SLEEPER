const dotenv = require('dotenv');
const path = require('path');

// 强制加载环境变量
dotenv.config({ path: path.join(__dirname, '.env') });

console.log('=== CloudBase 快速验证 ===');

// CloudBase SDK 导入和初始化
let tcb, cloudDB = null;
try {
  tcb = require('@cloudbase/node-sdk');
  
  if (process.env.CLOUDBASE_ENV_ID) {
    const app = tcb.init({
      env: process.env.CLOUDBASE_ENV_ID,
      region: process.env.CLOUDBASE_REGION || 'ap-shanghai'
    });
    cloudDB = app.database();
    
    console.log('✅ CloudBase 初始化成功！');
    console.log('📍 环境ID:', process.env.CLOUDBASE_ENV_ID);
    console.log('🌍 区域:', process.env.CLOUDBASE_REGION || 'ap-shanghai');
    console.log('🔗 数据库已连接');
    
    // 验证集合是否存在
    const collections = ['guestbook', 'sleep_data', 'projects'];
    console.log('\n📋 验证数据库集合:');
    
    Promise.all(collections.map(async (collectionName) => {
      try {
        const result = await cloudDB.collection(collectionName).limit(1).get();
        console.log(`✅ ${collectionName}: 可用 (共${result.data.length}条数据)`);
      } catch (error) {
        console.log(`⚠️ ${collectionName}: ${error.message}`);
      }
    })).then(() => {
      console.log('\n🎉 CloudBase 连接验证完成！');
      console.log('📝 现在可以启动服务器: npm start');
      console.log('🌐 访问地址: http://localhost:3000');
      process.exit(0);
    });
    
  } else {
    console.log('❌ 未找到 CloudBase 环境变量');
    process.exit(1);
  }
} catch (error) {
  console.log('❌ CloudBase SDK 初始化失败:', error.message);
  console.log('💡 请确保已安装 @cloudbase/node-sdk');
  console.log('💡 运行: npm install @cloudbase/node-sdk');
  process.exit(1);
}