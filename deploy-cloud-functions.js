const tcbIntegration = require('./tcb-integration');

/**
 * 部署云函数 - 支持 CORS
 */

async function deployAllCloudFunctions() {
  console.log('=== 开始部署云函数（CORS 版本） ===');
  
  const functions = [
    'addGuestbook',
    'getProjects', 
    'saveSleepData'
  ];
  
  const cloudfunctionsPath = __dirname;
  
  for (const funcName of functions) {
    try {
      console.log(`\n📤 部署云函数: ${funcName}`);
      
      // 调用 createFunction 更新云函数
      const result = await tcbIntegration.callTool('updateFunctionCode', {
        name: funcName,
        functionRootPath: cloudfunctionsPath
      });
      
      if (result.success) {
        console.log(`✅ ${funcName} 部署成功`);
      } else {
        console.log(`⚠️ ${funcName} 部署失败:`, result.error);
      }
      
    } catch (error) {
      console.log(`❌ ${funcName} 部署错误:`, error.message);
    }
  }
  
  console.log('\n🎉 云函数部署完成！');
  console.log('📋 已部署的云函数:');
  functions.forEach(name => {
    console.log(`   - ${name} (支持 CORS)`);
  });
}

// 执行部署
deployAllCloudFunctions().catch(console.error);