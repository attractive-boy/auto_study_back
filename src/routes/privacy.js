async function privacyRoutes(fastify, options) {
    // 隐私政策页面
    fastify.get('/privacy-policy', {
      schema: {
        description: '隐私政策页面',
        tags: ['系统'],
        response: {
          200: {
            type: 'string',
            description: '隐私政策 HTML 页面'
          }
        }
      }
    }, async (request, reply) => {
      const htmlContent = `
  <!DOCTYPE html>
  <html lang="zh">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>隐私政策</title>
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; background-color: #f9f9f9; }
      h1, h2, h3 { color: #333; }
      p { margin: 0 0 15px; }
      ul { margin: 0 0 15px 20px; }
      li { margin: 5px 0; }
      .container { max-width: 800px; margin: auto; background-color: #fff; padding: 20px; border-radius: 4px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>隐私政策</h1>
      <p>欢迎访问我们的网站。本隐私政策旨在向您说明我们如何收集、使用、存储和保护您的个人信息。</p>
      
      <h2>1. 信息收集</h2>
      <p>我们通过多种方式收集您的信息，包括但不限于：</p>
      <ul>
        <li>您在注册或使用服务时主动提供的信息（如姓名、电子邮件地址等）。</li>
        <li>通过 Facebook 登录获取的用户数据（如 Facebook 用户 ID、公开的个人资料等）。</li>
        <li>自动收集的信息，包括但不限于 IP 地址、浏览器类型、访问时间及访问页面等。</li>
      </ul>
      
      <h2>2. 信息使用</h2>
      <p>我们使用收集到的信息主要用于：</p>
      <ul>
        <li>为您提供个性化和便捷的服务体验。</li>
        <li>改进和优化网站及相关服务。</li>
        <li>处理您的请求、提供客户支持及反馈。</li>
        <li>遵守法律法规要求及维护系统安全。</li>
      </ul>
      
      <h2>3. 第三方服务</h2>
      <p>为实现便捷登录和增强服务体验，我们采用了 Facebook 登录方式。通过该方式，我们仅获取并使用您的公开信息，且仅在您同意的范围内使用。</p>
      
      <h2>4. 信息存储与保护</h2>
      <p>我们采取合理的技术和管理措施保护您的个人信息，防止未经授权的访问、泄露或篡改。</p>
      
      <h2>5. Cookie 的使用</h2>
      <p>为提升用户体验，我们可能会使用 Cookie 收集部分浏览信息。您可以通过浏览器设置管理或禁用 Cookie，但这可能会影响部分功能的使用。</p>
      
      <h2>6. 用户权利</h2>
      <p>您有权查阅、更正或删除我们持有的您的个人信息。如需行使上述权利，请参阅下方的数据删除说明或通过我们的联系方式联系我们。</p>
      
      <h2>7. 隐私政策更新</h2>
      <p>我们可能会不定期更新本隐私政策，更新后的政策将在本页面公布。建议您定期查阅以了解最新信息。</p>
      
      <h2>8. 联系我们</h2>
      <p>如果您对本隐私政策有任何疑问或意见，请通过以下方式与我们联系：</p>
      <p>Email: attractiveboy666@gmail.com</p>
      <p>电话: +86-10-12345678</p>
      
      <p>感谢您对我们服务的信任与支持！</p>
    </div>
  </body>
  </html>
  `;
      reply.type('text/html');
      return htmlContent;
    });
  
    // 数据删除说明页面
    fastify.get('/data-deletion', {
      schema: {
        description: '数据删除说明页面',
        tags: ['系统'],
        response: {
          200: {
            type: 'string',
            description: '数据删除说明 HTML 页面'
          }
        }
      }
    }, async (request, reply) => {
      const htmlContent = `
  <!DOCTYPE html>
  <html lang="zh">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>数据删除说明</title>
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; background-color: #f9f9f9; }
      h1, h2, h3 { color: #333; }
      p { margin: 0 0 15px; }
      ul, ol { margin: 0 0 15px 20px; }
      li { margin: 5px 0; }
      .container { max-width: 800px; margin: auto; background-color: #fff; padding: 20px; border-radius: 4px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>数据删除说明</h1>
      <p>本页面旨在向您详细说明如何删除在本网站中存储的您的个人数据。请您仔细阅读以下流程和说明，并按照步骤操作。</p>
      
      <h2>1. 数据删除请求流程</h2>
      <ol>
        <li>
          <strong>登录账户：</strong>请使用您的 Facebook 登录或其他认证方式登录您的账户。
        </li>
        <li>
          <strong>进入账户设置：</strong>登录后，导航至“账户设置”页面，找到数据管理或数据删除选项。
        </li>
        <li>
          <strong>提交删除请求：</strong>点击“删除我的数据”按钮后，系统会提示您确认删除操作。请确认并提交请求。
        </li>
        <li>
          <strong>身份验证：</strong>为了确保数据安全，我们可能要求您进行额外的身份验证，例如通过电子邮件或短信验证码确认您的身份。
        </li>
        <li>
          <strong>请求处理：</strong>我们将在收到删除请求后 7 个工作日内处理您的申请。处理完成后，我们会通过注册邮箱向您发送确认通知。
        </li>
      </ol>
      
      <h2>2. 数据删除后果</h2>
      <p>请注意，一旦数据删除操作完成，您的账户中的所有个人数据（包括账户信息、浏览记录、偏好设置等）将被永久删除，该操作不可恢复。</p>
      
      <h2>3. 特殊情况说明</h2>
      <p>在某些情况下，为了遵守法律法规或解决纠纷，我们可能需要保留部分数据。若出现这种情况，我们将提前告知并说明保留原因及时间。</p>
      
      <h2>4. 联系方式</h2>
      <p>如果您在数据删除过程中遇到任何问题或有其他疑问，请通过以下方式联系我们：</p>
      <p>Email: attractiveboy666@gmail.com</p>
      <p>电话: +86-10-12345678</p>
      
      <p>感谢您的理解与配合！</p>
    </div>
  </body>
  </html>
  `;
      reply.type('text/html');
      return htmlContent;
    });
  }
  
module.exports = privacyRoutes;
  