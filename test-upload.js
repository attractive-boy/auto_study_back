const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');
const path = require('path');

async function testUpload() {
  // 创建一个测试文件
  const testFilePath = path.join(__dirname, 'test_upload.txt');
  if (!fs.existsSync(testFilePath)) {
    fs.writeFileSync(testFilePath, 'This is a test file for upload.');
  }

  // 读取文件内容
  const fileContent = fs.readFileSync(testFilePath);
  const form = new FormData();
  
  // 添加文件和文件夹字段
  form.append('file', fileContent, {
    filename: 'test_upload.txt',
    contentType: 'text/plain'
  });
  form.append('folder', 'test');

  try {
    const response = await axios.post('http://127.0.0.1:3000/upload', form, {
      headers: {
        ...form.getHeaders(),
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhZG1pbiIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc0NzIwOTExOX0.QHZQ8tnl2d4guAtzYCVwXo59X4Q06RMJTKK_CddMa_g'
      }
    });
    console.log('上传成功：', response.data);
  } catch (error) {
    if (error.response) {
      console.error('上传失败：', error.response.data);
      console.error('状态码：', error.response.status);
      console.error('响应头：', error.response.headers);
    } else if (error.request) {
      console.error('请求失败：', error.message);
    } else {
      console.error('错误：', error.message);
    }
  }
}

testUpload(); 