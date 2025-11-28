#!/usr/bin/env node
/**
 * 网页转微信小程序转换脚本
 * 使用方法: node convert-to-wechat.js
 */

const fs = require('fs');
const path = require('path');

// 配置
const CONFIG = {
    miniprogramDir: 'miniprogram',
    pagesDir: 'miniprogram/pages/index',
    imagesDir: 'miniprogram/images',
    utilsDir: 'miniprogram/utils'
};

// 颜色输出
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    red: '\x1b[31m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

// 创建目录结构
function createDirectories() {
    log('📁 创建目录结构...', 'blue');
    const dirs = [
        CONFIG.miniprogramDir,
        CONFIG.pagesDir,
        CONFIG.imagesDir,
        CONFIG.utilsDir
    ];
    
    dirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            log(`  ✓ 创建目录: ${dir}`, 'green');
        }
    });
}

// 复制图片资源
function copyImages() {
    log('🖼️  复制图片资源...', 'blue');
    const images = ['hero-bg.jpg', 'Profile.png'];
    
    images.forEach(img => {
        const src = path.join(__dirname, img);
        const dest = path.join(CONFIG.imagesDir, img);
        
        if (fs.existsSync(src)) {
            fs.copyFileSync(src, dest);
            log(`  ✓ 复制: ${img}`, 'green');
        } else {
            log(`  ⚠ 文件不存在: ${img}`, 'yellow');
        }
    });
}

// 转换 HTML 到 WXML
function convertHTMLToWXML() {
    log('📄 转换 HTML → WXML...', 'blue');
    
    let html = fs.readFileSync('index.html', 'utf8');
    
    // 移除 head 和 script 标签
    html = html.replace(/<head>[\s\S]*?<\/head>/gi, '');
    html = html.replace(/<script[\s\S]*?<\/script>/gi, '');
    html = html.replace(/<!DOCTYPE[\s\S]*?>/gi, '');
    html = html.replace(/<html[\s\S]*?>/gi, '');
    html = html.replace(/<\/html>/gi, '');
    html = html.replace(/<body>/gi, '');
    html = html.replace(/<\/body>/gi, '');
    
    // 标签转换
    let wxml = html
        .replace(/<img\s+/gi, '<image ')
        .replace(/<\/img>/gi, '</image>')
        .replace(/<image([^>]*)src="([^"]+)"/gi, (match, attrs, src) => {
            // 处理本地图片路径
            if (!src.startsWith('http')) {
                return `<image${attrs}src="/images/${path.basename(src)}"`;
            }
            return match;
        })
        .replace(/<img([^>]*)alt="([^"]+)"/gi, '<image$1alt="$2"')
        .replace(/<button/gi, '<button')
        .replace(/<\/button>/gi, '</button>')
        .replace(/<section/gi, '<view')
        .replace(/<\/section>/gi, '</view>')
        .replace(/<nav/gi, '<view')
        .replace(/<\/nav>/gi, '</view>')
        .replace(/<div/gi, '<view')
        .replace(/<\/div>/gi, '</view>')
        .replace(/<span/gi, '<text')
        .replace(/<\/span>/gi, '</text>')
        .replace(/<p/gi, '<text')
        .replace(/<\/p>/gi, '</text>')
        .replace(/<h1/gi, '<text class="h1"')
        .replace(/<\/h1>/gi, '</text>')
        .replace(/<h2/gi, '<text class="h2"')
        .replace(/<\/h2>/gi, '</text>')
        .replace(/<h3/gi, '<text class="h3"')
        .replace(/<\/h3>/gi, '</text>')
        .replace(/<ul/gi, '<view')
        .replace(/<\/ul>/gi, '</view>')
        .replace(/<li/gi, '<view')
        .replace(/<\/li>/gi, '</view>')
        .replace(/<a([^>]*)href="([^"]+)"([^>]*)>/gi, (match, before, href, after) => {
            // 处理链接
            if (href.startsWith('#')) {
                return `<view${before}data-href="${href}"${after} bindtap="handleNav">`;
            } else if (href.startsWith('mailto:')) {
                return `<view${before}data-email="${href.replace('mailto:', '')}"${after} bindtap="handleEmail">`;
            } else {
                return `<navigator${before}url="${href}"${after}>`;
            }
        })
        .replace(/<\/a>/gi, (match) => {
            // 根据上下文决定闭合标签
            return '</view>';
        });
    
    // 移除 SVG（小程序不支持）
    wxml = wxml.replace(/<svg[\s\S]*?<\/svg>/gi, '');
    
    // 处理事件绑定
    wxml = wxml.replace(/onclick="([^"]+)"/gi, 'bindtap="$1"');
    wxml = wxml.replace(/onerror="([^"]+)"/gi, 'binderror="handleImageError"');
    
    // 移除 audio 标签（小程序使用 audio 组件）
    wxml = wxml.replace(/<audio[\s\S]*?<\/audio>/gi, '');
    
    // 添加页面容器
    wxml = `<view class="page-container">${wxml}</view>`;
    
    fs.writeFileSync(path.join(CONFIG.pagesDir, 'index.wxml'), wxml);
    log('  ✓ 生成 index.wxml', 'green');
}

// 转换 CSS 到 WXSS
function convertCSSToWXSS() {
    log('🎨 转换 CSS → WXSS...', 'blue');
    
    let css = fs.readFileSync('style.css', 'utf8');
    
    // 移除不支持的选择器
    css = css.replace(/:root\s*\{[^}]*\}/gi, '');
    css = css.replace(/html\s*\{[^}]*\}/gi, '');
    
    // 替换 body 为 page
    css = css.replace(/body\s*\{/gi, 'page {');
    
    // 移除不支持的属性
    css = css.replace(/scroll-behavior:\s*[^;]+;/gi, '');
    css = css.replace(/backdrop-filter:\s*[^;]+;/gi, '');
    
    // 处理 CSS 变量（小程序支持，但需要确保兼容性）
    // 保留 CSS 变量，小程序基础库 2.7.0+ 支持
    
    // 写入全局样式
    fs.writeFileSync(path.join(CONFIG.miniprogramDir, 'app.wxss'), css);
    log('  ✓ 生成 app.wxss', 'green');
    
    // 页面样式（可以为空或包含页面特定样式）
    fs.writeFileSync(path.join(CONFIG.pagesDir, 'index.wxss'), '/* 页面样式 */\n');
    log('  ✓ 生成 index.wxss', 'green');
}

// 转换 JS 到小程序 JS
function convertJSToMiniProgram() {
    log('⚙️  转换 JavaScript → 小程序 JS...', 'blue');
    
    let js = fs.readFileSync('script.js', 'utf8');
    
    // 小程序页面 JS 模板
    const pageJS = `// pages/index/index.js
Page({
  data: {
    subtitle: '',
    showLoader: true,
    sleepIndex: '',
    stats: {
      sleepCount: 0,
      experience: 0,
      satisfaction: '100%'
    }
  },

  onLoad() {
    this.initPage();
  },

  onReady() {
    // 页面渲染完成后
    setTimeout(() => {
      this.setData({ showLoader: false });
    }, 1000);
  },

  initPage() {
    this.initTypewriter();
    this.initStatsCounter();
    this.updateSleepIndex();
    setInterval(() => this.updateSleepIndex(), 60000);
  },

  // 打字机效果
  initTypewriter() {
    const subtitle = "睡眠工程师 · 梦境架构师";
    let i = 0;
    const timer = setInterval(() => {
      if (i < subtitle.length) {
        this.setData({
          subtitle: subtitle.substring(0, i + 1)
        });
        i++;
      } else {
        clearInterval(timer);
      }
    }, 80);
  },

  // 数字滚动动画
  initStatsCounter() {
    this.animateNumber(7300, 'sleepCount', '+');
    this.animateNumber(20, 'experience', '+');
  },

  animateNumber(target, key, suffix = '') {
    const duration = 2000;
    const startTime = Date.now();
    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);
      const current = Math.floor(target * eased);
      
      this.setData({
        ['stats.' + key]: current + suffix
      });
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.setData({
          ['stats.' + key]: target + suffix
        });
      }
    };
    
    animate();
  },

  // 睡眠指数
  updateSleepIndex() {
    const now = new Date();
    const hour = now.getHours();
    let sleepIndex;
    
    if (hour >= 22 || hour <= 6) {
      sleepIndex = "深度睡眠黄金期";
    } else if (hour >= 13 && hour <= 14) {
      sleepIndex = "午休能量补给站";
    } else {
      sleepIndex = "清醒状态";
    }
    
    this.setData({ sleepIndex: \`此刻：\${sleepIndex}\` });
  },

  // 导航处理
  handleNav(e) {
    const href = e.currentTarget.dataset.href;
    if (href) {
      wx.pageScrollTo({
        selector: href,
        duration: 500
      });
    }
  },

  // 邮箱处理
  handleEmail(e) {
    const email = e.currentTarget.dataset.email || '1762079094@qq.com';
    wx.setClipboardData({
      data: email,
      success: () => {
        wx.showToast({
          title: '📧 邮箱已复制！',
          icon: 'success',
          duration: 2000
        });
      }
    });
  },

  // 图片加载错误
  handleImageError(e) {
    console.log('图片加载失败', e);
  },

  // 移动端菜单
  toggleMenu() {
    // 小程序中可以通过数据控制菜单显示
  }
});`;

    fs.writeFileSync(path.join(CONFIG.pagesDir, 'index.js'), pageJS);
    log('  ✓ 生成 index.js', 'green');
}

// 创建 app.json
function createAppJSON() {
    log('📋 创建 app.json...', 'blue');
    
    const appJSON = {
        "pages": [
            "pages/index/index"
        ],
        "window": {
            "navigationBarTitleText": "Deep Sleeper",
            "navigationBarBackgroundColor": "#0a0a0a",
            "navigationBarTextStyle": "white",
            "backgroundColor": "#0a0a0a",
            "backgroundTextStyle": "light",
            "enablePullDownRefresh": false
        },
        "style": "v2",
        "sitemapLocation": "sitemap.json",
        "lazyCodeLoading": "requiredComponents"
    };
    
    fs.writeFileSync(
        path.join(CONFIG.miniprogramDir, 'app.json'),
        JSON.stringify(appJSON, null, 2)
    );
    log('  ✓ 生成 app.json', 'green');
}

// 创建 app.js
function createAppJS() {
    log('📱 创建 app.js...', 'blue');
    
    const appJS = `// app.js
App({
  onLaunch() {
    // 小程序启动
    console.log('Deep Sleeper 小程序启动');
  },

  onShow() {
    // 小程序显示
  },

  onHide() {
    // 小程序隐藏
  },

  globalData: {
    userInfo: null
  }
});`;

    fs.writeFileSync(path.join(CONFIG.miniprogramDir, 'app.js'), appJS);
    log('  ✓ 生成 app.js', 'green');
}

// 创建 sitemap.json
function createSitemap() {
    log('🗺️  创建 sitemap.json...', 'blue');
    
    const sitemap = {
        "desc": "关于本小程序的索引",
        "rules": [{
            "action": "allow",
            "page": "*"
        }]
    };
    
    fs.writeFileSync(
        path.join(CONFIG.miniprogramDir, 'sitemap.json'),
        JSON.stringify(sitemap, null, 2)
    );
    log('  ✓ 生成 sitemap.json', 'green');
}

// 创建 project.config.json（微信开发者工具配置）
function createProjectConfig() {
    log('⚙️  创建 project.config.json...', 'blue');
    
    const config = {
        "description": "项目配置文件",
        "packOptions": {
            "ignore": []
        },
        "setting": {
            "urlCheck": false,
            "es6": true,
            "enhance": true,
            "postcss": true,
            "preloadBackgroundData": false,
            "minified": true,
            "newFeature": false,
            "coverView": true,
            "nodeModules": false,
            "autoAudits": false,
            "showShadowRootInWxmlPanel": true,
            "scopeDataCheck": false,
            "uglifyFileName": false,
            "checkInvalidKey": true,
            "checkSiteMap": true,
            "uploadWithSourceMap": true,
            "compileHotReLoad": false,
            "lazyloadPlaceholderEnable": false,
            "useMultiFrameRuntime": true,
            "useApiHook": true,
            "useApiHostProcess": true,
            "babelSetting": {
                "ignore": [],
                "disablePlugins": [],
                "outputPath": ""
            },
            "enableEngineNative": false,
            "useIsolateContext": true,
            "userConfirmedBundleSwitch": false,
            "packNpmManually": false,
            "packNpmRelationList": [],
            "minifyWXSS": true,
            "showES6CompileOption": false,
            "minifyWXML": true
        },
        "compileType": "miniprogram",
        "libVersion": "2.33.0",
        "appid": "touristappid",
        "projectname": "deep-sleeper",
        "condition": {}
    };
    
    fs.writeFileSync(
        path.join(CONFIG.miniprogramDir, 'project.config.json'),
        JSON.stringify(config, null, 2)
    );
    log('  ✓ 生成 project.config.json', 'green');
}

// 创建页面 JSON 配置
function createPageJSON() {
    log('📄 创建页面配置...', 'blue');
    
    const pageJSON = {
        "navigationBarTitleText": "Deep Sleeper",
        "navigationBarBackgroundColor": "#0a0a0a",
        "navigationBarTextStyle": "white",
        "backgroundColor": "#0a0a0a",
        "enablePullDownRefresh": false
    };
    
    fs.writeFileSync(
        path.join(CONFIG.pagesDir, 'index.json'),
        JSON.stringify(pageJSON, null, 2)
    );
    log('  ✓ 生成 index.json', 'green');
}

// 主函数
function main() {
    log('\n🚀 开始转换网页为微信小程序...\n', 'blue');
    
    try {
        // 检查必要文件
        const requiredFiles = ['index.html', 'style.css', 'script.js'];
        for (const file of requiredFiles) {
            if (!fs.existsSync(file)) {
                log(`❌ 错误: 找不到文件 ${file}`, 'red');
                process.exit(1);
            }
        }
        
        // 执行转换
        createDirectories();
        copyImages();
        convertHTMLToWXML();
        convertCSSToWXSS();
        convertJSToMiniProgram();
        createAppJSON();
        createAppJS();
        createSitemap();
        createProjectConfig();
        createPageJSON();
        
        log('\n✅ 转换完成！', 'green');
        log('\n📝 下一步：', 'yellow');
        log('  1. 用微信开发者工具打开 miniprogram 文件夹', 'yellow');
        log('  2. 在 project.config.json 中配置你的 AppID', 'yellow');
        log('  3. 检查并调整代码以适应小程序环境', 'yellow');
        log('  4. 测试所有功能是否正常\n', 'yellow');
        
    } catch (error) {
        log(`\n❌ 转换失败: ${error.message}`, 'red');
        console.error(error);
        process.exit(1);
    }
}

// 运行
if (require.main === module) {
    main();
}

module.exports = { main };
