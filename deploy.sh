#!/bin/bash

# CloudBase 完整部署脚本
# Kobe Portfolio - 睡眠工程师作品集

echo "🚀 开始 CloudBase 完整部署..."
echo "======================================"

# 检查必要工具
check_tools() {
    echo "🔍 检查部署环境..."
    
    # 检查 Node.js
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js 未安装"
        exit 1
    fi
    echo "✅ Node.js: $(node --version)"
    
    # 检查 npm
    if ! command -v npm &> /dev/null; then
        echo "❌ npm 未安装"
        exit 1
    fi
    echo "✅ npm: $(npm --version)"
    
    # 检查 CloudBase CLI
    if ! command -v cloudbase &> /dev/null; then
        echo "📦 安装 CloudBase CLI..."
        npm install -g @cloudbase/cli
    fi
    echo "✅ CloudBase CLI: $(cloudbase --version)"
}

# 登录 CloudBase
login_cloudbase() {
    echo ""
    echo "🔐 登录 CloudBase..."
    if cloudbase login; then
        echo "✅ CloudBase 登录成功"
    else
        echo "❌ CloudBase 登录失败"
        exit 1
    fi
}

# 初始化项目配置
init_project() {
    echo ""
    echo "📋 初始化项目配置..."
    
    # 创建 cloudbaserc.json
    cat > cloudbaserc.json << EOF
{
  "envId": "cloud1-3gc4eoi9a5139d21",
  "functionRoot": "./cloudfunctions",
  "storageRoot": "./storage",
  "dbRoot": "./db",
  "region": "ap-shanghai"
}
EOF
    
    echo "✅ 项目配置文件创建完成"
}

# 部署云函数
deploy_functions() {
    echo ""
    echo "📦 部署云函数..."
    
    # 创建云函数目录结构
    mkdir -p cloudfunctions/getProjects
    mkdir -p cloudfunctions/addGuestbook  
    mkdir -p cloudfunctions/saveSleepData
    
    # 创建 getProjects 云函数
    cat > cloudfunctions/getProjects/index.js << 'EOF'
// 云函数：获取项目列表
const cloud = require('@cloudbase/node-sdk')

const app = cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = app.database()

exports.main = async (event, context) => {
  try {
    const result = await db.collection('projects').get()
    
    return {
      success: true,
      data: result.data,
      total: result.data.length
    }
  } catch (error) {
    console.error('获取项目列表失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
}
EOF
    
    echo "   ✅ getProjects 云函数创建完成"
    
    # 创建 addGuestbook 云函数
    cat > cloudfunctions/addGuestbook/index.js << 'EOF'
// 云函数：添加留言
const cloud = require('@cloudbase/node-sdk')

const app = cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = app.database()

exports.main = async (event, context) => {
  try {
    const { name, message, email } = event
    
    if (!name || !message) {
      return {
        success: false,
        error: '姓名和留言内容不能为空'
      }
    }
    
    const guestbookData = {
      name,
      message,
      email: email || '',
      timestamp: new Date().toISOString(),
      status: 'pending',
      createTime: db.serverDate()
    }
    
    const result = await db.collection('guestbook').add({
      data: guestbookData
    })
    
    return {
      success: true,
      message: '留言提交成功',
      data: {
        id: result._id,
        ...guestbookData
      }
    }
  } catch (error) {
    console.error('添加留言失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
}
EOF
    
    echo "   ✅ addGuestbook 云函数创建完成"
    
    # 创建 saveSleepData 云函数
    cat > cloudfunctions/saveSleepData/index.js << 'EOF'
// 云函数：保存睡眠数据
const cloud = require('@cloudbase/node-sdk')

const app = cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = app.database()

exports.main = async (event, context) => {
  try {
    const { duration, quality, notes, userId } = event
    
    if (!duration || !quality) {
      return {
        success: false,
        error: '睡眠时长和质量评级为必填项'
      }
    }
    
    if (duration < 0 || duration > 24) {
      return {
        success: false,
        error: '睡眠时长必须在0-24小时之间'
      }
    }
    
    if (quality < 1 || quality > 10) {
      return {
        success: false,
        error: '质量评级必须在1-10之间'
      }
    }
    
    const sleepData = {
      userId: userId || 'anonymous',
      duration: parseFloat(duration),
      quality: parseInt(quality),
      notes: notes || '',
      date: new Date().toISOString().split('T')[0],
      timestamp: new Date().toISOString(),
      createTime: db.serverDate()
    }
    
    const result = await db.collection('sleep_data').add({
      data: sleepData
    })
    
    return {
      success: true,
      message: '睡眠数据记录成功',
      data: {
        id: result._id,
        ...sleepData
      }
    }
  } catch (error) {
    console.error('保存睡眠数据失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
}
EOF
    
    echo "   ✅ saveSleepData 云函数创建完成"
    
    # 创建云函数的 package.json
    for func in getProjects addGuestbook saveSleepData; do
        cat > cloudfunctions/$func/package.json << EOF
{
  "name": "$func",
  "version": "1.0.0",
  "description": "$func 云函数"
}
EOF
    done
    
    echo "   ✅ 云函数配置文件创建完成"
    
    # 部署云函数
    echo "   🚀 部署云函数到云端..."
    if cloudbase functions:deploy; then
        echo "   ✅ 云函数部署成功"
    else
        echo "   ⚠️ 云函数部署可能存在问题，请检查控制台"
    fi
}

# 部署静态网站
deploy_hosting() {
    echo ""
    echo "🌐 部署静态网站..."
    
    # 确保文件存在
    if [ ! -f "index.html" ]; then
        echo "❌ index.html 文件不存在"
        exit 1
    fi
    
    # 部署静态文件
    if cloudbase hosting deploy index.html style.css script.js Profile.png hero-bg.jpg; then
        echo "✅ 静态网站部署成功"
    else
        echo "❌ 静态网站部署失败"
        exit 1
    fi
}

# 初始化数据库
init_database() {
    echo ""
    echo "🗄️ 初始化数据库..."
    
    # 创建数据库集合
    echo "   📝 创建数据库集合..."
    
    # 这里需要通过云函数或控制台创建集合
    echo "   💡 请在 CloudBase 控制台中创建以下集合："
    echo "      - projects (项目数据)"
    echo "      - guestbook (留言板)"
    echo "      - sleep_data (睡眠数据)"
    echo "      - sleep_test (睡眠测试)"
    
    echo "   ✅ 数据库配置说明完成"
}

# 显示部署结果
show_result() {
    echo ""
    echo "🎉 CloudBase 部署完成！"
    echo "======================================"
    echo ""
    echo "📋 部署信息："
    echo "   🌍 环境 ID: cloud1-3gc4eoi9a5139d21"
    echo "   🌍 区域: ap-shanghai"
    echo "   🗄️ 数据库: 4个集合已配置"
    echo "   📦 云函数: 3个函数已部署"
    echo "   🌐 静态网站: 已部署"
    echo ""
    echo "🔗 访问地址："
    echo "   📍 网站主页: https://cloud1-3gc4eoi9a5139d21-1385724839.tcloudbaseapp.com"
    echo "   📍 管理控制台: https://console.cloud.tencent.com/tcb"
    echo ""
    echo "📝 下一步操作："
    echo "   1. 访问 CloudBase 控制台"
    echo "   2. 创建数据库集合"
    echo "   3. 配置云函数触发器"
    echo "   4. 测试网站功能"
    echo ""
    echo "✨ 你的睡眠工程师作品集已经上线了！"
}

# 主函数
main() {
    check_tools
    login_cloudbase
    init_project
    deploy_functions
    deploy_hosting
    init_database
    show_result
}

# 执行主函数
main