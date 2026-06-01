import { NextFunction, Response, Request } from "express"
import { IGetUserAuthInfoRequest } from "../../typings/express";
import * as memberServices from "./member.services"
import { ParsedToken } from "../../typings/token";

/* 
export async function FindAllMemberByAgentId(
    req: IGetUserAuthInfoRequest,
    res: Response,
    next: NextFunction) {
    try {
        const id = req.params.id
        const response = await memberServices.getMemberByAgentId(id);
        res.json(response)
    } catch (error: any) {
        res.status(500).json(error);
    }
} */

export async function user(
    req: IGetUserAuthInfoRequest,
    res: Response,
    next: NextFunction) {
    try {
        const parsedToken: ParsedToken | undefined = req.parsedToken
        if (!parsedToken) throw new Error('Unauthorized')
        const payload = {
            TenantId: parsedToken.tenantId,
            CustomerId: parsedToken.customerId,
        }
        const response = await memberServices.getUser(payload);
        res.json(response)
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

export async function checkLine(
    req: IGetUserAuthInfoRequest,
    res: Response,
    next: NextFunction) {
    try {
        const parsedToken: ParsedToken | undefined = req.parsedToken
        if (!parsedToken) throw new Error('Unauthorized')
        const payload = {
            TenantId: parsedToken.tenantId,
            CustomerId: parsedToken.customerId,
        }
        const response = await memberServices.checkLine(payload);
        res.json(response)
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}
