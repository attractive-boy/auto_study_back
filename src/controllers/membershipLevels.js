const dayjs = require('dayjs');

async function rechargeMembership(request, reply) {
  const { userId, amount } = request.body;
  
  try {
    // 开启事务处理
    const result = await this.prisma.$transaction(async (prisma) => {
      // 创建充值记录
      const recharge = await prisma.recharge.create({
        data: {
          userId,
          amount,
          rechargeStatus: '成功'
        }
      });

      // 更新会员余额
      const membership = await prisma.membership.findFirst({
        where: { userId }
      });

      if (!membership) {
        throw new Error('会员信息不存在');
      }

      const updatedMembership = await prisma.membership.update({
        where: { id: membership.id },
        data: {
          balance: membership.balance + amount,
          // 充值后延长会员有效期3个月
          expiresAt: membership.expiresAt
            ? dayjs(membership.expiresAt).add(3, 'month').toDate()
            : dayjs().add(3, 'month').toDate()
        },
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          }
        }
      });

      // 创建收益记录
      await prisma.reconciliation.create({
        data: {
          type: '会员充值收益',
          amount
        }
      });

      return { recharge, membership: updatedMembership };
    });

    return reply.code(201).send(result);
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: '会员充值失败' });
  }
}

async function getRechargeHistory(request, reply) {
  const { userId } = request.params;
  try {
    const recharges = await this.prisma.recharge.findMany({
      where: { userId: parseInt(userId) },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });
    return reply.send(recharges);
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: '获取充值记录失败' });
  }
}

async function getMembershipLevel(request, reply) {
  const { userId } = request.params;
  try {
    const membership = await this.prisma.membership.findFirst({
      where: { userId: parseInt(userId) },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    if (!membership) {
      return reply.code(404).send({ error: '会员信息不存在' });
    }

    // 根据余额判断会员等级
    let level = '普通会员';
    let benefits = ['基础服务'];

    if (membership.balance >= 10000) {
      level = '钻石会员';
      benefits = ['基础服务', '专属客服', 'VIP专座', '免费停车', '生日特权'];
    } else if (membership.balance >= 5000) {
      level = '金牌会员';
      benefits = ['基础服务', '专属客服', 'VIP专座', '免费停车'];
    } else if (membership.balance >= 2000) {
      level = '银牌会员';
      benefits = ['基础服务', '专属客服', 'VIP专座'];
    } else if (membership.balance >= 1000) {
      level = '铜牌会员';
      benefits = ['基础服务', '专属客服'];
    }

    const membershipInfo = {
      ...membership,
      level,
      benefits,
      nextLevel: level !== '钻石会员' ? {
        name: getNextLevel(level),
        requiredBalance: getRequiredBalance(level)
      } : null
    };

    return reply.send(membershipInfo);
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: '获取会员等级信息失败' });
  }
}

function getNextLevel(currentLevel) {
  const levels = {
    '普通会员': '铜牌会员',
    '铜牌会员': '银牌会员',
    '银牌会员': '金牌会员',
    '金牌会员': '钻石会员'
  };
  return levels[currentLevel] || null;
}

function getRequiredBalance(currentLevel) {
  const requirements = {
    '普通会员': 1000,
    '铜牌会员': 2000,
    '银牌会员': 5000,
    '金牌会员': 10000
  };
  return requirements[currentLevel] || null;
}

module.exports = {
  rechargeMembership,
  getRechargeHistory,
  getMembershipLevel
};