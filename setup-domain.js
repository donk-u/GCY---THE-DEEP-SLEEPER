# CloudBase DEFAULT_DOMAIN_EXPIRED 解决方案

## ❌ 错误说明

**错误码**: `DEFAULT_DOMAIN_EXPIRED`  
**错误信息**: Default domain has expired  
**原因**: CloudBase 提供的默认域名已过期，需要使用自定义域名

## 🔧 解决方案

### 方案一：配置自定义域名（推荐）

#### 1. 准备域名
- 拥有一个已备案的域名（如需要）
- 域名 DNS 解析权限

#### 2. CloudBase 控制台配置
1. 访问 [CloudBase 控制台](https://console.cloud.tencent.com/tcb)
2. 选择环境: `cloud1-3gc4eoi9a5139d21`
3. 进入: **静态网站托管** → **域名管理**
4. 点击: **添加域名**
5. 输入: 你的域名（如 `portfolio.yourdomain.com`）
6. 开启: **HTTP 强制跳转 HTTPS**

#### 3. DNS 解析配置
在你的域名服务商（如阿里云、腾讯云等）添加 CNAME 记录：

```
记录类型: CNAME
主机记录: portfolio    (或其他子域名)
记录值: cloud1-3gc4eoi9a5139d21-1385724839.tcloudbaseapp.com
TTL: 600
```

#### 4. 等待生效
- DNS 解析：5-30 分钟
- SSL 证书：自动配置
- 全球生效：最长 24 小时

### 方案二：使用临时域名（紧急情况）

如果急需访问，可以使用以下临时方案：

#### 1. 重新创建环境
1. 在 CloudBase 控制台创建新环境
2. 部署项目到新环境
3. 获得新的默认域名（30天有效期）

#### 2. 使用其他云服务
- **Vercel**: 免费静态托管
- **Netlify**: 免费静态托管
- **GitHub Pages**: 免费静态托管

### 方案三：购买云服务套餐

升级到付费套餐可获得：
- 长期默认域名
- 更多流量和存储
- 技术支持

## 🚀 快速部署到其他平台

### Vercel 部署
```bash
# 1. 安装 Vercel CLI
npm i -g vercel

# 2. 登录
vercel login

# 3. 部署
vercel --prod
```

### Netlify 部署
```bash
# 1. 拖拽文件夹到 netlify.com
# 2. 或使用 CLI
npm i -g netlify-cli
netlify deploy --prod --dir=.
```

## 📋 推荐操作步骤

### 立即解决（选择一个）：

#### 🎯 最佳方案：配置自定义域名
1. 运行域名配置脚本：`node setup-domain.js`
2. 按照配置指南操作
3. 等待 DNS 生效

#### 🚀 快速方案：部署到 Vercel
1. 安装 Vercel CLI：`npm i -g vercel`
2. 部署：`vercel --prod`
3. 获得永久域名：`your-project.vercel.app`

#### 🆓 免费方案：部署到 Netlify
1. 访问 netlify.com
2. 拖拽项目文件夹
3. 获得永久域名

## 🔍 验证方法

### 检查部署状态
```bash
# 检查域名解析
nslookup your-domain.com

# 检查 HTTP 状态
curl -I https://your-domain.com

# 检查 SSL 证书
openssl s_client -connect your-domain.com:443
```

## 📞 技术支持

- [CloudBase 文档](https://docs.cloudbase.net/)
- [腾讯云客服](https://console.cloud.tencent.com/workorder)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/cloudbase)

---

## ⚡ 总结

**默认域名过期是正常现象**，CloudBase 免费版默认域名有30天有效期。  
**最佳解决方案是配置自定义域名**，这样可以获得长期稳定的访问地址。

如果你没有域名，推荐使用 Vercel 或 Netlify 等免费托管服务，它们提供永久免费的域名。