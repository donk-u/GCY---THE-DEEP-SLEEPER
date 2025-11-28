
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
