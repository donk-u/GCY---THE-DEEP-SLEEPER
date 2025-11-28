const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// CloudBase SDK 导入
let tcb, cloudDB = null;
try {
  tcb = require('@cloudbase/node-sdk');
  
  // 初始化 CloudBase
  if (process.env.CLOUDBASE_ENV_ID) {
    const app = tcb.init({
      env: process.env.CLOUDBASE_ENV_ID,
      region: process.env.CLOUDBASE_REGION || 'ap-shanghai'
    });
    cloudDB = app.database();
    console.log('✅ CloudBase 数据库连接成功');
    console.log('📍 环境ID:', process.env.CLOUDBASE_ENV_ID);
    console.log('🌍 区域:', process.env.CLOUDBASE_REGION || 'ap-shanghai');
  } else {
    console.log('⚠️ 未配置 CloudBase 环境变量，使用本地模式');
  }
} catch (error) {
  console.log('⚠️ CloudBase SDK 未安装或连接失败，使用本地模式:', error.message);
}

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// 安全中间件
app.use(helmet({
    contentSecurityPolicy: false // 允许内联样式和脚本
}));

// 压缩响应
app.use(compression());

// 日志中间件
if (NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// 速率限制
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15分钟
    max: 100, // 限制每个IP 15分钟内最多100个请求
    message: {
        error: '请求过于频繁，请稍后再试'
    }
});
app.use('/api/', limiter);

// CORS配置
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
}));

// 解析JSON和URL编码的请求体
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 静态文件服务
app.use(express.static(path.join(__dirname)));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 创建上传目录（如果不存在）
const fs = require('fs');
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// API路由
const API_PREFIX = process.env.API_PREFIX || '/api';

// 获取站点信息
app.get(`${API_PREFIX}/site-info`, (req, res) => {
    res.json({
        name: process.env.SITE_NAME || 'Kobe Portfolio',
        description: process.env.SITE_DESCRIPTION || 'Deep Sleeper | 睡眠工程师',
        version: process.env.API_VERSION || 'v1',
        contact: {
            email: process.env.CONTACT_EMAIL || '1762079094@qq.com'
        }
    });
});

// 获取项目列表
app.get(`${API_PREFIX}/projects`, (req, res) => {
    const projects = [
        {
            id: 1,
            title: '智能睡眠舱系统',
            description: 'AI驱动的个性化睡眠环境调节',
            image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=600&fit=crop',
            tags: ['💤 深度睡眠', '🌙 梦境重构', '⏰ REM优化'],
            tech: ['Node.js', 'AI', 'IoT'],
            link: '#',
            github: '#'
        },
        {
            id: 2,
            title: '梦境可视化平台',
            description: '将脑波数据转化为沉浸式视觉体验',
            image: 'https://images.unsplash.com/photo-1531353826977-0941b4779a1c?w=800&h=600&fit=crop',
            tags: ['💤 深度睡眠', '🌙 梦境重构', '⏰ REM优化'],
            tech: ['React', 'WebGL', 'WebRTC'],
            link: '#',
            github: '#'
        },
        {
            id: 3,
            title: '云端睡眠档案馆',
            description: '基于区块链的睡眠数据确权与交易',
            image: 'https://images.unsplash.com/photo-1511295742362-92c96b1cf484?w=800&h=600&fit=crop',
            tags: ['💤 深度睡眠', '🌙 梦境重构', '⏰ REM优化'],
            tech: ['Blockchain', 'IPFS', 'Web3'],
            link: '#',
            github: '#'
        }
    ];
    
    res.json({
        success: true,
        data: projects,
        total: projects.length
    });
});

// 获取服务列表
app.get(`${API_PREFIX}/services`, (req, res) => {
    const services = [
        {
            id: 1,
            number: '01',
            title: '硬床 · 软床 · 枕头被子优化',
            description: '构建可安睡床铺，从底层架构保障睡眠质量',
            features: ['床垫选择', '枕头适配', '被褥配置', '环境调节']
        },
        {
            id: 2,
            number: '02',
            title: '纳米级精准实现',
            description: '流畅入睡体验，无障碍梦游设计，让每个睡姿都优雅',
            features: ['睡姿分析', '体位优化', '睡眠监测', '智能调节']
        },
        {
            id: 3,
            number: '03',
            title: '全线解决方案',
            description: 'Node.js、数据库SQL设计、API开发、云部署（梦里也会）',
            features: ['前端开发', '后端架构', '数据库设计', '云服务部署']
        }
    ];
    
    res.json({
        success: true,
        data: services,
        total: services.length
    });
});

// 获取统计数据
app.get(`${API_PREFIX}/stats`, (req, res) => {
    const stats = {
        completedSleeps: 7300,
        experience: 20,
        satisfaction: 100,
        clients: 150,
        projects: 50
    };
    
    res.json({
        success: true,
        data: stats
    });
});

// 留言板 API
app.get(`${API_PREFIX}/guestbook`, async (req, res) => {
    try {
        let messages;
        
        if (cloudDB) {
            // 从 CloudBase 获取留言
            const result = await cloudDB.collection('guestbook')
                .where({
                    status: 'approved'
                })
                .orderBy('createTime', 'desc')
                .limit(20)
                .get();
            messages = result.data;
        } else {
            // 本地模式，返回模拟数据
            messages = [
                {
                    id: 1,
                    name: "访客1",
                    message: "很棒的睡眠工程师作品集！",
                    timestamp: new Date().toISOString(),
                    status: 'approved'
                },
                {
                    id: 2,
                    name: "访客2", 
                    message: "睡眠质量真的提升了！",
                    timestamp: new Date().toISOString(),
                    status: 'approved'
                }
            ];
        }
        
        res.json({
            success: true,
            data: messages,
            total: messages.length
        });
    } catch (error) {
        console.error('获取留言失败:', error);
        res.status(500).json({
            success: false,
            error: '服务器内部错误'
        });
    }
});

app.post(`${API_PREFIX}/guestbook`, async (req, res) => {
    const { name, message, email } = req.body;
    
    if (!name || !message) {
        return res.status(400).json({
            success: false,
            error: '姓名和留言内容不能为空'
        });
    }
    
    const guestbookData = {
        name,
        message,
        email: email || '',
        timestamp: new Date().toISOString(),
        status: 'pending', // 需要审核
        createTime: new Date()
    };
    
    try {
        if (cloudDB) {
            // 保存到 CloudBase
            await cloudDB.collection('guestbook').add({
                data: guestbookData
            });
            console.log('留言已保存到 CloudBase');
        } else {
            console.log('新留言:', guestbookData);
        }
        
        res.json({
            success: true,
            message: '留言提交成功！审核通过后会显示。'
        });
    } catch (error) {
        console.error('提交留言失败:', error);
        res.status(500).json({
            success: false,
            error: '服务器内部错误'
        });
    }
});

// 睡眠数据 API
app.post(`${API_PREFIX}/sleep-data`, async (req, res) => {
    const { duration, quality, notes, userId } = req.body;
    
    if (!duration || !quality) {
        return res.status(400).json({
            success: false,
            error: '睡眠时长和质量评级为必填项'
        });
    }
    
    if (duration < 0 || duration > 24) {
        return res.status(400).json({
            success: false,
            error: '睡眠时长必须在0-24小时之间'
        });
    }
    
    if (quality < 1 || quality > 10) {
        return res.status(400).json({
            success: false,
            error: '质量评级必须在1-10之间'
        });
    }
    
    const sleepData = {
        userId: userId || 'anonymous',
        duration: parseFloat(duration),
        quality: parseInt(quality),
        notes: notes || '',
        date: new Date().toISOString().split('T')[0],
        timestamp: new Date().toISOString(),
        createTime: new Date()
    };
    
    try {
        if (cloudDB) {
            // 保存到 CloudBase
            await cloudDB.collection('sleep_data').add({
                data: sleepData
            });
            console.log('睡眠数据已保存到 CloudBase');
        } else {
            console.log('新睡眠记录:', sleepData);
        }
        
        res.json({
            success: true,
            message: '睡眠数据记录成功',
            data: sleepData
        });
    } catch (error) {
        console.error('保存睡眠数据失败:', error);
        res.status(500).json({
            success: false,
            error: '服务器内部错误'
        });
    }
});

app.get(`${API_PREFIX}/sleep-data`, async (req, res) => {
    try {
        let sleepRecords;
        
        if (cloudDB) {
            // 从 CloudBase 获取睡眠数据
            const result = await cloudDB.collection('sleep_data')
                .orderBy('createTime', 'desc')
                .limit(30)
                .get();
            sleepRecords = result.data;
        } else {
            // 本地模式，返回模拟数据
            sleepRecords = [
                {
                    id: 1,
                    duration: 7.5,
                    quality: 8,
                    date: new Date().toISOString().split('T')[0],
                    notes: "睡眠质量不错"
                }
            ];
        }
        
        // 计算统计数据
        const stats = {
            totalSleeps: sleepRecords.length,
            averageDuration: sleepRecords.length > 0 
                ? (sleepRecords.reduce((sum, record) => sum + record.duration, 0) / sleepRecords.length).toFixed(1)
                : 0,
            averageQuality: sleepRecords.length > 0
                ? (sleepRecords.reduce((sum, record) => sum + record.quality, 0) / sleepRecords.length).toFixed(1)
                : 0
        };
        
        res.json({
            success: true,
            data: {
                records: sleepRecords,
                stats
            }
        });
    } catch (error) {
        console.error('获取睡眠数据失败:', error);
        res.status(500).json({
            success: false,
            error: '服务器内部错误'
        });
    }
});

// 睡眠咨询系统 API 路由

// 提交睡眠日志 (submit-sleep-log-v2)
app.post(`${API_PREFIX}/submit-sleep-log-v2`, async (req, res) => {
    const { userId, date, bedtime, wakeup, quality, caffeine, notes } = req.body;
    
    // 验证必填字段
    if (!userId || !date || !bedtime || !wakeup || !quality) {
        return res.status(400).json({
            success: false,
            error: '用户ID、日期、入睡时间、起床时间和睡眠质量为必填项'
        });
    }
    
    if (quality < 1 || quality > 10) {
        return res.status(400).json({
            success: false,
            error: '睡眠质量评分必须在1-10之间'
        });
    }
    
    const sleepLogData = {
        userId,
        date,
        bedtime,
        wakeup,
        quality: parseInt(quality),
        caffeine: parseInt(caffeine) || 0,
        notes: notes || '',
        timestamp: new Date().toISOString(),
        createTime: new Date()
    };
    
    try {
        if (cloudDB) {
            // 保存到 CloudBase
            await cloudDB.collection('sleep_logs').add({
                data: sleepLogData
            });
            console.log('睡眠日志已保存到 CloudBase');
        } else {
            console.log('新睡眠日志:', sleepLogData);
        }
        
        res.json({
            success: true,
            message: '睡眠日志提交成功',
            data: sleepLogData
        });
    } catch (error) {
        console.error('保存睡眠日志失败:', error);
        res.status(500).json({
            success: false,
            error: '服务器内部错误'
        });
    }
});

// 睡眠测试计算 (sleep-test)
app.post(`${API_PREFIX}/sleep-test`, async (req, res) => {
    const { bedtime, wakeup, quality, caffeine } = req.body;
    
    // 验证必填字段
    if (!bedtime || !wakeup || !quality) {
        return res.status(400).json({
            success: false,
            error: '入睡时间、起床时间和睡眠质量为必填项'
        });
    }
    
    if (quality < 1 || quality > 10) {
        return res.status(400).json({
            success: false,
            error: '睡眠质量评分必须在1-10之间'
        });
    }
    
    try {
        // 计算睡眠时长
        const [bedHour, bedMinute] = bedtime.split(':').map(Number);
        const [wakeHour, wakeMinute] = wakeup.split(':').map(Number);
        
        let sleepHours = wakeHour - bedHour;
        let sleepMinutes = wakeMinute - bedMinute;
        
        if (sleepMinutes < 0) {
            sleepHours -= 1;
            sleepMinutes += 60;
        }
        
        if (sleepHours < 0) {
            sleepHours += 24; // 跨夜睡眠
        }
        
        const totalSleepMinutes = sleepHours * 60 + sleepMinutes;
        
        // 计算睡眠分数
        let score = parseInt(quality) * 10; // 基础分数
        
        // 根据睡眠时长调整分数
        if (totalSleepMinutes >= 480) { // 8小时
            score += 20;
        } else if (totalSleepMinutes >= 360) { // 6小时
            score += 10;
        } else if (totalSleepMinutes < 300) { // 少于5小时
            score -= 20;
        }
        
        // 根据咖啡因调整分数
        const caffeineIntake = parseInt(caffeine) || 0;
        if (caffeineIntake > 0) {
            score -= caffeineIntake * 2;
        }
        
        // 确保分数在合理范围内
        score = Math.max(30, Math.min(100, score));
        
        // 生成建议
        const suggestions = [];
        if (score >= 80) {
            suggestions.push('睡眠质量优秀，继续保持！');
        } else if (score >= 60) {
            suggestions.push('睡眠质量良好，可以尝试优化入睡环境');
        } else {
            suggestions.push('睡眠质量有待改善，建议咨询专业睡眠顾问');
        }
        
        if (totalSleepMinutes < 360) {
            suggestions.push('建议增加睡眠时间至6小时以上');
        }
        
        if (caffeineIntake > 2) {
            suggestions.push('咖啡因摄入较多，建议减少摄入量');
        }
        
        const testResult = {
            score,
            sleepDuration: {
                hours: sleepHours,
                minutes: sleepMinutes,
                totalMinutes: totalSleepMinutes
            },
            quality: parseInt(quality),
            caffeine: caffeineIntake,
            suggestions,
            timestamp: new Date().toISOString()
        };
        
        res.json({
            success: true,
            message: '睡眠测试完成',
            data: testResult
        });
    } catch (error) {
        console.error('睡眠测试计算失败:', error);
        res.status(500).json({
            success: false,
            error: '服务器内部错误'
        });
    }
});

// 联系表单提交
app.post(`${API_PREFIX}/contact`, async (req, res) => {
    const { name, email, message } = req.body;
    
    // 简单的验证
    if (!name || !email || !message) {
        return res.status(400).json({
            success: false,
            error: '请填写所有必填字段'
        });
    }
    
    // 邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            success: false,
            error: '邮箱格式不正确'
        });
    }
    
    const contactData = {
        name,
        email,
        message,
        timestamp: new Date().toISOString(),
        status: 'pending'
    };
    
    try {
        // 如果 CloudBase 可用，保存到数据库
        if (cloudDB) {
            await cloudDB.collection('guestbook').add({
                data: contactData
            });
            console.log('联系信息已保存到 CloudBase');
        } else {
            // 本地模式，仅打印日志
            console.log('新的联系请求:', contactData);
        }
        
        // 返回成功响应
        res.json({
            success: true,
            message: '联系信息已收到，我们会尽快回复您！'
        });
    } catch (error) {
        console.error('保存联系信息失败:', error);
        res.status(500).json({
            success: false,
            error: '服务器内部错误'
        });
    }
});

// 健康检查
app.get(`${API_PREFIX}/health`, (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: NODE_ENV
    });
});

// 主页路由 - 服务HTML文件
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 处理SPA路由（如果没有找到对应的静态文件，返回index.html）
app.get('*', (req, res) => {
    // 如果是API请求，返回404
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({
            success: false,
            error: 'API endpoint not found'
        });
    }
    
    // 其他请求返回index.html（SPA支持）
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        success: false,
        error: NODE_ENV === 'development' ? err.message : '服务器内部错误'
    });
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`
🚀 服务器启动成功！
📍 地址: http://localhost:${PORT}
🌍 环境: ${NODE_ENV}
⏰ 启动时间: ${new Date().toLocaleString()}
📝 API文档: http://localhost:${PORT}${API_PREFIX}/health
    `);
});

// 优雅关闭
process.on('SIGTERM', () => {
    console.log('收到 SIGTERM 信号，正在关闭服务器...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('\n收到 SIGINT 信号，正在关闭服务器...');
    process.exit(0);
});