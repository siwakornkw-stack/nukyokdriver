import * as z from 'zod'

const ProductSchema = z.object({
  productId: z.string(),
});
const PromotionConditionSchema = z.object({
  promotionConditionId: z.string().optional(),
  promotionConditionName: z.string().optional(),
  condition: z.enum(["consecutive-loss", "consecutive-win", "last-number", "free-spin", "free-spin-consecutive-loss", "step-wins", "step-losses","muay", "last-number-lotto-member-number-prize-first", "last-number-lotto-ticket-lotto-prize-first", "last-number-lotto-ticket-sport-prize-first", "last-number-lotto-member-number-prize-last-two-digits", "last-number-lotto-ticket-lotto-prize-last-two-digits", "last-number-lotto-ticket-sport-prize-last-two-digits"]),
  conditionNumber: z.string().optional().default("0"),
  isBetAmount: z.boolean(),
  isBillWater: z.boolean().optional().nullable().default(false),
  fromBetAmount: z.number().optional().nullable().default(0),
  toBetAmount: z.number().optional().nullable().default(0),
  fromOddsAmount: z.number().optional().nullable().default(0),
  toOddsAmount: z.number().optional().nullable().default(0),
  creditLimit: z.number().nullable().optional().default(0),
  products: z.array(ProductSchema),
});
export const AgentSchema = z.object({
    //sequence: z.number().min(1, 'Sequence is required'),
    agentName: z.string().min(1, 'Agent Name is required'),
    //username: z.string().min(1, 'Username is required'),
    //password: z.string().min(1, 'Password is required'),
    appId: z.string().min(1, 'App ID is required'),
    appKey: z.string().min(1, 'App Key is required'),
    promotionConditions: z.array(PromotionConditionSchema).optional(),
  });

export type AgentInput = z.infer<typeof AgentSchema>
