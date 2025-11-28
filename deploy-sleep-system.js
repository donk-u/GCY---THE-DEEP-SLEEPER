const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// 🚀 睡眠咨询全栈系统部署脚本
class SleepSystemDeployer {
    constructor() {
        this.functions = [
            'submit-contact',
            'submit-sleep-log', 
            'calculate-sleep'
        ];
        
        this.httpPaths = {
            'submit-contact': '/api/contact',
            'submit-sleep-log': '/api/sleep-log',
            'calculate-sleep': '/api/sleep-test'
        };
    }

    // 📋 部署清单
    async runDeploymentChecklist() {
        console.log('=== 睡眠咨询系统部署清单 ===\n');
        
        // 1. 检查项目结构
        console.log('📂 1. 检查项目结构...');
        this.checkProjectStructure();
        
        // 2. 检查云函数文件
        console.log('\n☁️ 2. 检查云函数文件...');
        await this.checkCloudFunctions();
        
        // 3. 生成部署命令
        console.log('\n🚀 3. 生成部署命令...');
        this.generateDeploymentCommands();
        
        // 4. 生成测试脚本
        console.log('\n🧪 4. 生成测试脚本...');
        this.generateTestScript();
        
        // 5. 生成部署验证清单
        console.log('\n✅ 5. 生成验证清单...');
        this.generateVerificationChecklist();
        
        console.log('\n🎉 部署准备完成！请按照上述步骤执行部署。');
    }

    // 📂 检查项目结构
    checkProjectStructure() {
        const requiredFiles = [
            'sleep-consultation.html',
            'sleep-consultation.js',
            'cloudfunctions/submit-contact/index.js',
            'cloudfunctions/submit-contact/package.json',
            'cloudfunctions/submit-sleep-log/index.js',
            'cloudfunctions/submit-sleep-log/package.json',
            'cloudfunctions/calculate-sleep/index.js',
            'cloudfunctions/calculate-sleep/package.json'
        ];
        
        requiredFiles.forEach(file => {
            if (fs.existsSync(file)) {
                console.log(`   ✅ ${file}`);
            } else {
                console.log(`   ❌ ${file} - 文件缺失！`);
            }
        });
    }

    // ☁️ 检查云函数
    async checkCloudFunctions() {
        for (const funcName of this.functions) {
            const funcPath = path.join('cloudfunctions', funcName);
            const indexPath = path.join(funcPath, 'index.js');
            const packagePath = path.join(funcPath, 'package.json');
            
            console.log(`\n🔍 检查云函数: ${funcName}`);
            
            // 检查 package.json
            if (fs.existsSync(packagePath)) {
                const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
                console.log(`   📦 依赖: ${Object.keys(packageContent.dependencies || {}).join(', ')}`);
            } else {
                console.log(`   ❌ 缺少 package.json`);
            }
            
            // 检查 index.js
            if (fs.existsSync(indexPath)) {
                const indexContent = fs.readFileSync(indexPath, 'utf8');
                if (indexContent.includes('exports.main')) {
                    console.log(`   ✅ 入口函数正确`);
                } else {
                    console.log(`   ❌ 缺少 exports.main`);
                }
                
                if (indexContent.includes('headers') && indexContent.includes('Access-Control-Allow-Origin')) {
                    console.log(`   ✅ CORS 配置正确`);
                } else {
                    console.log(`   ❌ 缺少 CORS 配置`);
                }
            } else {
                console.log(`   ❌ 缺少 index.js`);
            }
        }
    }

    // 🚀 生成部署命令
    generateDeploymentCommands() {
        console.log('请按顺序执行以下命令：\n');
        
        // 安装依赖
        console.log('📦 安装云函数依赖:');
        this.functions.forEach(funcName => {
            console.log(`   cd cloudfunctions/${funcName} && npm install && cd ../..`);
        });
        
        // 部署云函数
        console.log('\n☁️ 部署云函数:');
        this.functions.forEach(funcName => {
            console.log(`   tcb fn deploy ${funcName}`);
        });
        
        // 配置 HTTP 路径
        console.log('\n🌐 配置 HTTP 路径:');
        Object.entries(this.httpPaths).forEach(([funcName, path]) => {
            console.log(`   tcb service create -f ${funcName} -p ${path}`);
        });
        
        // 部署静态网站
        console.log('\n📁 部署静态网站:');
        console.log('   tcb hosting deploy sleep-consultation.html -e cloud1-3gc4eoi9a5139d21');
        console.log('   tcb hosting deploy sleep-consultation.js -e cloud1-3gc4eoi9a5139d21');
    }

    // 🧪 生成测试脚本
    generateTestScript() {
        const testScript = `
// 🧪 睡眠咨询系统测试脚本
async function runFullTest() {
    console.log('🧪 开始睡眠咨询系统测试...');
    
    const testResults = [];
    
    // 测试1: 睡眠咨询表单
    try {
        const contactTest = await callCloudFunction('contact', {
            name: '测试用户',
            email: 'test@sleep.com',
            consultationType: 'deep-sleep',
            message: '这是一个测试咨询请求'
        });
        
        testResults.push({
            test: '睡眠咨询表单',
            status: contactTest.success ? '✅ 通过' : '❌ 失败',
            result: contactTest.success ? '正常提交' : contactTest.error
        });
    } catch (error) {
        testResults.push({
            test: '睡眠咨询表单',
            status: '❌ 异常',
            result: error.message
        });
    }
    
    // 测试2: 睡眠日志提交
    try {
        const logTest = await callCloudFunction('sleep-log', {
            name: '测试用户',
            email: 'test@sleep.com',
            sleepScore: 8,
            message: '测试睡眠记录'
        });
        
        testResults.push({
            test: '睡眠日志提交',
            status: logTest.success ? '✅ 通过' : '❌ 失败',
            result: logTest.success ? '正常记录' : logTest.error
        });
    } catch (error) {
        testResults.push({
            test: '睡眠日志提交',
            status: '❌ 异常',
            result: error.message
        });
    }
    
    // 测试3: 睡眠测试计算
    try {
        const calculateTest = await callCloudFunction('sleep-test', {
            bedtime: '23:00',
            wakeup: '07:00',
            quality: 8,
            caffeine: 1
        });
        
        testResults.push({
            test: '睡眠测试计算',
            status: calculateTest.success ? '✅ 通过' : '❌ 失败',
            result: calculateTest.success ? '分数: ' + calculateTest.data?.score : calculateTest.error
        });
    } catch (error) {
        testResults.push({
            test: '睡眠测试计算',
            status: '❌ 异常',
            result: error.message
        });
    }
    
    // 显示测试结果
    console.log('\\n📊 测试结果汇总:');
    testResults.forEach((result, index) => {
        console.log(\`\${index + 1}. \${result.test}: \${result.status}\`);
        console.log(\`   结果: \${result.result}\`);
    });
    
    const passedTests = testResults.filter(r => r.status.includes('✅')).length;
    console.log(\`\\n🎯 测试通过率: \${passedTests}/\${testResults.length} (\${Math.round(passedTests/testResults.length*100)}%)\`);
    
    if (passedTests === testResults.length) {
        console.log('🎉 所有测试通过！系统运行正常。');
    } else {
        console.log('⚠️ 部分测试失败，请检查相关功能。');
    }
    
    return testResults;
}

// 统一 API 调用函数
async function callCloudFunction(functionName, data) {
    const baseUrl = window.location.origin;
    const url = \`\${baseUrl}/api/\${functionName}\`;
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.code === 200) {
            return { success: true, data: result.data };
        } else {
            return { success: false, error: result.message };
        }
        
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// 自动运行测试
runFullTest().catch(console.error);
        `;
        
        const testFilePath = 'test-sleep-system.js';
        fs.writeFileSync(testFilePath, testScript);
        console.log(`   ✅ 测试脚本已生成: ${testFilePath}`);
    }

    // ✅ 生成验证清单
    generateVerificationChecklist() {
        const checklist = `
# 🎯 睡眠咨询全栈系统验证清单

## 📋 部署验证

### ☁️ 云函数检查
- [ ] submit-contact 云函数已部署
- [ ] submit-sleep-log 云函数已部署  
- [ ] calculate-sleep 云函数已部署
- [ ] 所有云函数返回正确的 HTTP 状态码
- [ ] CORS 配置正确，无跨域错误

### 🌐 HTTP 路径检查
- [ ] /api/contact → submit-contact 云函数
- [ ] /api/sleep-log → submit-sleep-log 云函数
- [ ] /api/sleep-test → calculate-sleep 云函数
- [ ] 所有路径返回正确的 JSON 响应

### 📁 静态网站检查
- [ ] sleep-consultation.html 可正常访问
- [ ] 睡眠咨询系统页面加载正常
- [ ] 所有 CSS 和 JS 资源加载成功
- [ ] 页面在移动端正常显示

### 🗄️ 数据库集合检查
- [ ] contacts 集合已创建
- [ ] sleep-logs 集合已创建
- [ ] analytics 集合已创建
- [ ] 安全规则配置正确

## 🧪 功能测试

### 💬 睡眠咨询功能
- [ ] 表单验证正常（必填项检查）
- [ ] 邮箱格式验证正确
- [ ] 提交成功显示提示消息
- [ ] 数据成功保存到 contacts 集合
- [ ] 错误处理正常显示

### 📊 睡眠日志功能
- [ ] 睡眠评分滑块工作正常
- [ ] 日志提交成功保存数据
- [ ] 数据成功保存到 sleep-logs 集合
- [ ] 统计数据更新正确

### 🧪 睡眠测试功能
- [ ] 时间选择器工作正常
- [ ] 睡眠时长计算正确
- [ ] 评分算法运行正常
- [ ] 个性化建议生成正确
- [ ] 结果展示页面效果正常

### 📈 数据分析功能
- [ ] 页面访问统计正确
- [ ] 用户行为追踪正常
- [ ] 统计数据显示正常
- [ ] 数据图表渲染正常

## 🔒 安全检查

### 🛡️ 输入验证
- [ ] 所有表单都有输入验证
- [ ] XSS 攻击防护正常
- [ ] SQL 注入防护正常
- [ ] 参数类型检查正确

### 🔐 权限控制
- [ ] 数据库读写权限正确
- [ ] 敏感数据无法直接访问
- [ ] API 调用权限控制正常
- [ ] 错误信息不泄露敏感信息

## 🚀 性能检查

### ⚡ 响应时间
- [ ] API 响应时间 < 2秒
- [ ] 页面加载时间 < 3秒
- [ ] 云函数冷启动 < 5秒
- [ ] 数据库查询时间 < 1秒

### 📱 响应式设计
- [ ] 手机端布局正常
- [ ] 平板端布局正常
- [ ] 桌面端布局正常
- [ ] 触摸交互正常

## 🎯 用户体验

### 🎨 界面设计
- [ ] 视觉效果符合设计规范
- [ ] 动画效果流畅自然
- [ ] 颜色搭配协调一致
- [ ] 字体清晰易读

### 💡 交互体验
- [ ] 按钮点击反馈明显
- [ ] 表单操作流程顺畅
- [ ] 错误提示友好明确
- [ ] 成功状态反馈及时

## 📞 联系信息

### 📧 支持渠道
- [ ] 技术支持联系方式有效
- [ ] 用户反馈渠道畅通
- [ ] 问题响应机制完善
- [ ] 文档更新及时

## 🎉 验收标准

✅ **通过标准**: 所有检查项目 85% 以上通过
⚠️ **基本通过**: 所有检查项目 70% 以上通过  
❌ **需要优化**: 检查项目 70% 以下通过

---

## 📞 技术支持

如遇到问题，请提供以下信息：
1. 错误截图
2. 浏览器控制台错误
3. CloudBase 控制台错误日志
4. 具体操作步骤

支持渠道: 1762079094@qq.com
        `;
        
        const checklistPath = '睡眠咨询系统验证清单.md';
        fs.writeFileSync(checklistPath, checklist);
        console.log(`   ✅ 验证清单已生成: ${checklistPath}`);
    }
}

// 🌍 执行部署准备
const deployer = new SleepSystemDeployer();
deployer.runDeploymentChecklist().catch(console.error);