# 网页转微信小程序转换工具

## 使用方法

### 1. 运行转换脚本

```bash
node convert-to-wechat.js
```

### 2. 转换后的目录结构

```
miniprogram/
├── app.js              # 小程序入口文件
├── app.json            # 小程序配置文件
├── app.wxss            # 全局样式
├── sitemap.json        # 站点地图
├── project.config.json # 微信开发者工具配置
├── pages/
│   └── index/
│       ├── index.js    # 页面逻辑
│       ├── index.json # 页面配置
│       ├── index.wxml # 页面结构
│       └── index.wxss # 页面样式
├── images/             # 图片资源
│   ├── hero-bg.jpg
│   └── Profile.png
└── utils/              # 工具函数（可选）
```

### 3. 在微信开发者工具中打开

1. 打开微信开发者工具
2. 选择"导入项目"
3. 选择 `miniprogram` 文件夹
4. 在 `project.config.json` 中配置你的 AppID（或使用测试号）

## 转换说明

### 已转换的内容

- ✅ HTML → WXML（标签转换、事件绑定）
- ✅ CSS → WXSS（样式转换）
- ✅ JavaScript → 小程序 JS（API 适配）
- ✅ 图片资源复制
- ✅ 小程序配置文件生成

### 需要注意的差异

1. **标签差异**
   - `<div>` → `<view>`
   - `<span>` → `<text>`
   - `<img>` → `<image>`
   - `<a>` → `<navigator>` 或 `<view>`（根据链接类型）

2. **事件绑定**
   - `onclick` → `bindtap`
   - `onerror` → `binderror`

3. **API 差异**
   - `document.getElementById()` → `this.setData()`
   - `window.addEventListener()` → `Page()` 生命周期
   - `navigator.clipboard` → `wx.setClipboardData()`

4. **样式限制**
   - 移除了 `backdrop-filter`（小程序不支持）
   - 移除了 `scroll-behavior`（小程序不支持）
   - CSS 变量需要基础库 2.7.0+

### 可能需要手动调整的功能

1. **外部链接**
   - GitHub、WeChat 等外部链接需要在小程序后台配置业务域名

2. **音频播放**
   - 小程序需要使用 `<audio>` 组件或 `wx.createInnerAudioContext()`

3. **图片加载**
   - 网络图片需要在小程序后台配置 downloadFile 域名

4. **滚动定位**
   - 使用 `wx.pageScrollTo()` 替代 `scrollIntoView()`

## 常见问题

### Q: 转换后样式显示不正常？
A: 检查 CSS 变量是否支持，小程序基础库需要 2.7.0+，或者将 CSS 变量替换为具体值。

### Q: 外部链接无法打开？
A: 需要在微信小程序后台配置业务域名，或者使用 `web-view` 组件。

### Q: 图片加载失败？
A: 检查图片路径是否正确，网络图片需要配置 downloadFile 域名。

### Q: 音频无法播放？
A: 小程序需要使用 `<audio>` 组件或 `wx.createInnerAudioContext()` API。

## 技术支持

如有问题，请检查：
1. 微信开发者工具控制台错误信息
2. 小程序基础库版本（建议 2.33.0+）
3. 网络请求域名配置




