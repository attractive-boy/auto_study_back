const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  try {
    // 检查是否已存在管理员账号
    const existingAdmin = await prisma.admin.findUnique({
      where: { username: 'admin' }
    });

    if (!existingAdmin) {
      // 创建默认管理员账号
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash('admin123', saltRounds);

      await prisma.admin.create({
        data: {
          username: 'admin',
          passwordHash
        }
      });

      console.log('默认管理员账号创建成功');
    } else {
      console.log('管理员账号已存在，跳过创建');
    }
  } catch (error) {
    console.error('创建管理员账号失败:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 