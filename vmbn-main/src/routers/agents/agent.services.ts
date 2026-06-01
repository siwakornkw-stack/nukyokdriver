import * as bcrypt from 'bcrypt'
import { db } from '../../utils/db.server'
import { UUID } from 'crypto'
import { getTenant } from '../tenant/tenant.services';
/* 
export function getStatus(TenantId: string){
  return new Promise(async (resolve, reject) => {
    try {
      const tenant = getTenant(TenantId);

      

      Promise.all([db.agents.findMany({
        skip: offset,
        take: limit,
        select: {
          agentId: true,
          agentName: true,
          status: true,
          isDeleted: true,
          createdBy: true,
          updatedBy: true
        },
        where: {
          //userId: userId,
          status: { not: "deleted" }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }), db.agents.count({
        where: {
          //userId: userId,
          status: { not: "deleted" }
        }
      })])
        .then(async (result) => {
          const rows: any = result[0];
          const count: any = result[1];
          resolve({
            total: count,
            lastPage: Math.ceil(count / limit),
            currPage: +page || 1,
            limit: limit,
            rowsCount: rows.length,
            rows: rows
          });
        });

    } catch (error: any) {
      reject(error.message);
    }
  });
}

export function findAgentByUsername(username: string) {
  return db.agents.findFirst({
    where: {
        username,
    },
  })
}

export function createAgentByUsernameAndPassword(agent: Prisma.AgentsCreateInput) {
    agent.password = bcrypt.hashSync(agent.password, 12)
  return db.agents.create({
    data: agent,
  })
}

export function findAgentById(agentId: Agents['agentId']) {
  return db.agents.findUnique({
    where: {
        agentId,
    },
  })
} */