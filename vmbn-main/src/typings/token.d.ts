export interface ParsedToken {
    exp: number
    customerId: string
    username: string
    tenantId: string
    role: string
    jti: string
}

export interface ParsedTokenAdmin {
  exp: number
  adminId: string
  username: string
  tenantId: string
  jti: string
}