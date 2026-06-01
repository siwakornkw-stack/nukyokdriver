// import { Products } from "@prisma/client";

export interface AgentData {
    agentId: string;
    agentName: string;
    appId: string;
    appKey: string;
    status: string;
    isDeleted: boolean;
    createdBy: string | null;
    updatedBy: string | null;
    PromotionConditions: PromotionCondition[];
}

export interface AgentDetail {
    agentId: string;
    agentName: string;
    status: string;
    Promotion: Promotion[];
    Category: Category[];
}

interface Category {
    categoryCode: string;
    categoryName: string;
}

interface Promotion {
    promotionConditionId: string;
    agentId: string;
    condition: string;
    conditionNumber: string;
    categoryCode: string;
    isBetAmount: boolean;
    fromBetAmount: number;
    toBetAmount: number;
    creditLimit: number | null;
    promotionConditionName: string | null;
}

export interface PromotionCondition {
    promotionConditionId: string;
    condition: string;
    conditionNumber: number;
    isBetAmount: boolean;
    fromBetAmount: number;
    toBetAmount: number;
    creditLimit: number | null;
    product: any[];
}