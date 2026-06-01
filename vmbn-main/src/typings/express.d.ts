import { Request } from "express"
import { ParsedToken, ParsedTokenAdmin } from "./token"
export interface IGetUserAuthInfoRequest<TParams = {}, TBody = {}, TQuery = {}> extends Request {
    parsedToken?: ParsedToken
}
export interface IGetUserAuthInfoRequestAdmin<TParams = {}, TBody = {}, TQuery = {}> extends Request {
    parsedToken?: ParsedTokenAdmin
}
export interface IFilterUserAuthInfoRequest<TParams = {}, TBody = {}, TQuery = {}> extends Request {
    user?: ParsedToken
    agentUsername?: string  // ยูสเซอร์เนมลูกค้า: Xbgtemplate
    agentName?: string      // ชื่อเวป: LSM99AI
    betCondition?: string   // ประเภท: แพ้ 10 ตาติดต่อกัน
    dateFrom?: string   // yyyy-mm-dd: 2023-10-10
    dateTo?: string     // yyyy-mm-dd: 2023-10-10
    page?: number     // 1
    size?: number     // 10
}

export interface IGetRequestTenant<TParams = {}, TBody = {}, TQuery = {}> extends Request {
    tenantId?: string
}