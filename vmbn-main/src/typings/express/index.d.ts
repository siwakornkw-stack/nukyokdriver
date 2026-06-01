declare namespace Express {
  export interface Request {
    user?: ParsedToken
    tenantId?: string
  }
}

// import { Request } from "express"

// export interface middlewareRequest extends Request {
//     user?: ParsedToken
// }