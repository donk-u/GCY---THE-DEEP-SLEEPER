const dotenv = require('dotenv');
const path = require('path');

// 强制加载环境变量
dotenv.config({ path: path.join(__dirname, '.env') });

console.log('=== CloudBase 连接测试 ===');
console.log('环境变量检查:');
console.log('CLOUDBASE_ENV_ID:', process.env.CLOUDBASE_ENV_ID);
console.log('CLOUDBASE_REGION:', process.env.CLOUDBASE_REGION);

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
    
    console.log('\n✅ CloudBase 初始化成功！');
    console.log('📍 环境ID:', process.env.CLOUDBASE_ENV_ID);
    console.log('🌍 区域:', process.env.CLOUDBASE_REGION || 'ap-shanghai');
  } else {
    console.log('\n❌ 未找到 CloudBase 环境变量');
    process.exit(1);
  }
} catch (error) {
  console.log('\n❌ CloudBase SDK 初始化失败:', error.message);
  process.exit(1);
}

// 测试数据库操作
async function testDatabase() {
  try {
    console.log('\n=== 数据库操作测试 ===');
    
    // 1. 测试写入留言数据
    console.log('📝 测试写入留言数据...');
    const testGuestbook = {
      name: '测试用户',
      message: '这是一条测试留言',
      email: 'test@example.com',
      timestamp: new Date().toISOString(),
      status: 'approved',
      createTime: new Date()
    };
    
    const addResult = await cloudDB.collection('guestbook').add({
      data: testGuestbook
    });
    console.log('✅ 留言数据写入成功, ID:', addResult.id);
    
    // 2. 测试读取留言数据
    console.log('\n📖 测试读取留言数据...');
    const queryResult = await cloudDB.collection('guestbook')
      .where({ status: 'approved' })
      .orderBy('createTime', 'desc')
      .limit(5)
      .get();
    
    console.log('✅ 留言数据读取成功，共', queryResult.data.length, '条记录');
    queryResult.data.forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.name}: ${item.message.substring(0, 20)}...`);
    });
    
    // 3. 测试写入睡眠数据
    console.log('\n😴 测试写入睡眠数据...');
    const testSleepData = {
      userId: 'test_user',
      duration: 7.5,
      quality: 8,
      notes: '测试睡眠记录',
      date: new Date().toISOString().split('T')[0],
      timestamp: new Date().toISOString(),
      createTime: new Date()
    };
    
    const sleepResult = await cloudDB.collection('sleep_data').add({
      data: testSleepData
    });
    console.log('✅ 睡眠数据写入成功, ID:', sleepResult.id);
    
    // 4. 测试读取睡眠数据
    console.log('\n📊 测试读取睡眠数据...');
    const sleepQueryResult = await cloudDB.collection('sleep_data')
      .orderBy('createTime', 'desc')
      .limit(5)
      .get();
    
    console.log('✅ 睡眠数据读取成功，共', sleepQueryResult.data.length, '条记录');
    sleepQueryResult.data.forEach((item, index) => {
      console.log(`  ${index + 1}. 时长: ${item.duration}小时, 质量: ${item.quality}/10`);
    });
    
    console.log('\n🎉 所有测试完成！CloudBase 连接正常！');
    
  } catch (error) {
    console.error('❌ 数据库操作测试失败:', error);
    process.exit(1);
  }
}

// 运行测试
testDatabase().then(() => {
  console.log('\n=== 测试结束 ===');
  process.exit(0);
}).catch(error => {
  console.error('\n测试过程出现错误:', error);
  process.exit(1);
});