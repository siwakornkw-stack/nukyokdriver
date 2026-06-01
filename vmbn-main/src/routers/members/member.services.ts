import { UUID } from "crypto";
import { db } from '../../utils/db.server'
import { response } from "express";

export function getUser({TenantId, CustomerId}: {TenantId: string, CustomerId: string}){
    return new Promise(async (resolve, reject) => {
        try {
            const memberList = await db.customer.findFirst({
                where: {
                    TenantId: TenantId,
                    CustomerId: CustomerId
                }
            })
            if (!memberList) {
                reject({
                    success: false,
                    code: 400,
                    message: `member list not fond by this TenantId: ${TenantId} and CustomerId: ${CustomerId}`,
                    data: null
                })
            } else {
                resolve({
                    success: true,
                    code: 200,
                    message: 'success',
                    data: memberList
                })
            }        
            
        } catch (error: any) {
            reject({
                success: false,
                code: 500,
                message: `${error.message}`,
                data: null
            });
        }
    })    
}

export function checkLine({TenantId, CustomerId}: {TenantId: string, CustomerId: string}){
    return new Promise(async (resolve, reject) => {
        try {
            const memberList = await db.customer.findFirst({
                where: {
                    TenantId: TenantId,
                    CustomerId: CustomerId
                }                
            })      
            const response = {
                hasLine: memberList?.LineUserId ? true : false
            }

            resolve({
                success: true,
                code: 200,
                message: 'success',
                data: response
            })
        } catch (error: any) {
            reject({
                success: false,
                code: 500,
                message: `${error.message}`,
                data: null
            });
        }
    })    
}