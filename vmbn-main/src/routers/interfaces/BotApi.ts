import { Request } from 'express';

export interface OnetimePromoRequest {
    agentId: string;
    memberUsername: string;
    dateFrom: string;
    dateTo: string;
    promoId: string;
    categoryCode: string;
    billStart: string;
    billEnd: string;
    createdBy: string;
    isManual: boolean;
    isOtherBill: boolean;
}

export interface TelegramRequest {
    reportDate: string;
    agentId: string;
    memberId: string;
    promoConditionId: string;
    reportDateTime: Date;
    reportStatus: 'matched' | 'not-matched'; 
    agentName: string;
    playerUsername: string;
    promoName: string;
    reportType: string; 
    reportCondition: string; 
    categoryName: string;
    billStart: Date;
    billEnd: Date;
    billHistory: string;
    billDetailUrl: string;
    hashKey: string;
    failedReason: string;
    credit: number;
    phone: string;
    billImage: Express.Multer.File[];
    staffName: string;
    [key: string]: any;
    // createdAt: Date;
    // createdBy: string;
}

export interface summaryByAgentRequest {
    dateFrom: string;
    dateTo: string;
    // page:number;
    // size:number;
}

export interface summaryByPromotionRequest {
    agentId: string;
    isSelectLsm99Ai: boolean;
    dateFrom: string;
    dateTo: string;
}