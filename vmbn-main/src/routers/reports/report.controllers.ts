import { NextFunction, Response, Request } from "express"
import { IGetUserAuthInfoRequest, IFilterUserAuthInfoRequest } from "../../typings/express"
import { ParsedToken } from "../../typings/token"
import { PrismaWhere } from "../../typings/prisma"
import * as string from "../../utils/string"
import * as reportServices  from './report.services'
import * as agentServices  from '../agents/agent.services'
import { formatDate } from "../../utils/API"
import { setCache, getCache } from "../../utils/redis"
import { OnetimePromoRequest, TelegramRequest, summaryByAgentRequest, summaryByPromotionRequest } from "../interfaces/BotApi"
/* 
export async function filter(
    req: IFilterUserAuthInfoRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const user: ParsedToken = req.user
      const { playerUsername, agentName, betCondition, betConditionNumber, status, dateFrom, dateTo, brand, category, page=1, size=10 } = req.body 
      const where: PrismaWhere = { AND: [] }

      if (!string.isNullOrUndefinedOrEmpty(playerUsername)) {        
        where.AND.push({ playerUsername: playerUsername })
      }

      if (!string.isNullOrUndefinedOrEmpty(agentName)) {
        where.AND.push({ agentName: agentName })
      }

      // if (!string.isNullOrUndefinedOrEmpty(betCondition)) {
      //   where.AND.push({ reportType: { contains: betCondition, } })
      // }

      if (betCondition.length !== 0) {
        where.AND.push({ reportType: { in: betCondition, } })
      }

      if (betConditionNumber.length !== 0) {
        where.AND.push({ reportCondition: { in: betConditionNumber, } })
      }

      // NOTE: 1 day = 2024-01-01T00:00:00 to 2024-01-01T23:59:59
      // if (!string.isNullOrUndefinedOrEmpty(dateFrom) || !string.isNullOrUndefinedOrEmpty(dateTo)) {
      //   if (!string.isNullOrUndefinedOrEmpty(dateFrom) && !string.isNullOrUndefinedOrEmpty(dateTo)) {
      //     const dFrom = new Date(dateFrom)
      //     const dTo = new Date(dateTo)
      //     dTo.setHours(23, 59, 59, 999)
      //     dTo.toISOString()
      //     where.AND.push({ reportDateTime: { gte: dFrom, lte: dTo } })
      //   } else if (!string.isNullOrUndefinedOrEmpty(dateFrom)){
      //     const dFrom = new Date(dateFrom)
      //     where.AND.push({ reportDateTime: { gte: dFrom, } })
      //   } else if (!string.isNullOrUndefinedOrEmpty(dateTo)){
      //     const dTo = new Date(dateTo)
      //     dTo.setHours(23, 59, 59, 999)
      //     dTo.toISOString()
      //     where.AND.push({ reportDateTime: { lte: dTo, } })
      //   }        
      // }

      // NOTE: 1 day = 2024-01-01T11:00:00 to 2024-01-02T10:59:59
      if (!string.isNullOrUndefinedOrEmpty(dateFrom) || !string.isNullOrUndefinedOrEmpty(dateTo)) {
        if (!string.isNullOrUndefinedOrEmpty(dateFrom) && !string.isNullOrUndefinedOrEmpty(dateTo)) {
          const dFrom = new Date(dateFrom)
          const dTo = new Date(dateTo)
          dFrom.setHours(11, 0, 0, 0)  
          dFrom.toISOString() 
          dTo.setDate(dTo.getDate() + 1);       
          dTo.setHours(10, 59, 59, 999)
          dTo.toISOString()
          where.AND.push({ reportDateTime: { gte: dFrom, lte: dTo } });

        } else if (!string.isNullOrUndefinedOrEmpty(dateFrom)){
          const dFrom = new Date(dateFrom)
          dFrom.setHours(11, 0, 0, 0)  
          dFrom.toISOString() 
          where.AND.push({ reportDateTime: { gte: dFrom, } });

        } else if (!string.isNullOrUndefinedOrEmpty(dateTo)){
          const dTo = new Date(dateTo)
          dTo.setDate(dTo.getDate() + 1);       
          dTo.setHours(10, 59, 59, 999)
          dTo.toISOString()
          where.AND.push({ reportDateTime: { lte: dTo, } });
        }        
      }

      // if (!string.isNullOrUndefinedOrEmpty(isPayBill)) {
      //   const boolValue = isPayBill.toLowerCase() === 'true';
      //   where.AND.push({ isPayBill: boolValue })
      // }

      // TODO: remove isPayBill when filter when data is migrated
      if (!string.isNullOrUndefinedOrEmpty(status)) {
        if (status === 'paid') {
          where.AND.push({ isPayBill: true });
        }
        else if (status === 'deny') {
          where.AND.push({ isPayBill: false });
          where.AND.push({ reportStatus: 'deny' });
        }
        else if (status === 'waiting') {
          where.AND.push({ isPayBill: false });
          where.AND.push({ 
            OR: [
              {
                reportStatus: 'waiting'
              },
              {
                reportStatus: null
              }
            ]
           });
        }
      }

      if (!string.isNullOrUndefinedOrEmpty(brand)) {        
        where.AND.push({ brandName: brand });
      }

      if (!string.isNullOrUndefinedOrEmpty(category)) {        
        where.AND.push({ categoryName: category });
      }

      const keyCache: string = JSON.stringify(where.AND);
      const data =  await getCache(`report-filter-${keyCache}-${page}-${size}`);
      if (data) {
        res.status(200).json(JSON.parse(data));
        return;
      }

      const reports = await reportServices.filterReportConditions(where, page, size)
      setCache(`report-filter-${keyCache}-${page}-${size}`, JSON.stringify(reports), 60);
      res.status(200).json(reports);
    } catch (error: any) {
      res.status(500).json(error);
    }
  }

export async function products(
  req: IGetUserAuthInfoRequest,
  res: Response,
  next: NextFunction) {
  try {
    const data =  await getCache('report-getAllProducts');
    if (data) {
      res.status(200).json(JSON.parse(data));
      return;
    }
    const products = await reportServices.getAllProducts()
    setCache('report-getAllProducts', JSON.stringify(products), 900);
    res.status(200).json(products)
  } catch (error: any) {
    res.status(500).json(error);
  }
}

export async function promotionCondition(
  req: IGetUserAuthInfoRequest,
  res: Response,
  next: NextFunction) {
  try {
    const data =  await getCache('report-getAllPromotionCondition');
    if (data) {
      res.status(200).json(JSON.parse(data));
      return;
    }
    const user: ParsedToken = req.user
    const response = await reportServices.getAllPromotionCondition()
    setCache('report-getAllPromotionCondition', JSON.stringify(response), 900);
    res.status(200).json(response)
  } catch (error: any) {
    res.status(500).json(error);
  }
}

export async function batch(
  req: IGetUserAuthInfoRequest,
  res: Response,
  next: NextFunction) {
  try {
    const user: ParsedToken = req.user
    const { page=1, size=10 } = req.body 

    const data =  await getCache(`report-batch-${page}-${size}`);
    if (data) {
      res.status(200).json(JSON.parse(data));
      return;
    }
    const products = await reportServices.getAllBatchs(page, size)
    setCache(`report-batch-${page}-${size}`, JSON.stringify(products), 60);
    res.status(200).json(products)
  } catch (error: any) {
    res.status(500).json(error);
  }
}

export async function payBill(
  req: IGetUserAuthInfoRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const user: ParsedToken = req.user
    const { id, status } = req.body       
    const response = await reportServices.payBillService(id, status, user.username)
    res.status(200).json(response)
  } catch (error: any) {
    res.status(500).json(error);
  }
}

export async function calculateManual(
  req: IGetUserAuthInfoRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const user: ParsedToken = req.user
    const { dateTime, agentId, username } = req.body 
    const where: PrismaWhere = { AND: [] }
    const startDate = new Date(dateTime);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 1);
    const reportDateFrom = formatDate(startDate);
    const reportDateTo = formatDate(endDate);
    
    const year = startDate.getFullYear();
    const month = String(startDate.getMonth() + 1).padStart(2, '0');
    const day = String(startDate.getDate()).padStart(2, '0');
    const reportDate = `${year}-${month}-${day}`;
    const desiredDate = new Date(`${year}-${month}-${day}T11:00:00`);
    // const startDate = new Date(endDateTime);
    // startDate.setDate(endDateTime.getDate() - 1);
    // const startDateTime = startDate.toISOString().slice(0, 10);
    
    const reports = await reportServices.calculateManual(agentId, username, reportDateFrom, reportDateTo, reportDate, desiredDate, user.username)
    res.status(200).json(reports)
  } catch (error) {
    res.status(500).json(error);
  }
}

export async function fetchProducts(
  req: IGetUserAuthInfoRequest,
  res: Response,
  next: NextFunction) {
  try {
    const products = await reportServices.fetchProducts()
    res.status(200).json(products)
  } catch (error: any) {
    res.status(500).json(error);
  }
}

export async function sendTelegram(
  req: IGetUserAuthInfoRequest,
  res: Response,
  next: NextFunction) {
  try {
    const user = req.user;
    const { hashKey} = req.body
    const products = await reportServices.sendTelegramNotifyMsgAsync(hashKey, user.username)
    res.status(200).json(products)
  } catch (error: any) {
    res.status(500).json(error);
  }
}

export async function callOnetimePromo(
  req: IGetUserAuthInfoRequest,
  res: Response,
  next: NextFunction) {
  try {
    const user: ParsedToken = req.user;
    const requestBody: OnetimePromoRequest = {
      agentId: req.body.agentId,
      memberUsername: req.body.memberUsername,
      dateFrom: req.body.dateFrom,
      dateTo: req.body.dateTo,
      promoId: req.body.promoId,
      categoryCode: req.body.categoryCode,
      billStart: req.body.billStart,
      billEnd: req.body.billEnd,
      createdBy: user.username,
      isManual: req.body.isManual,
      isOtherBill: req.body.isOtherBill,
    };
    const products = await reportServices.callOnetimePromo(requestBody)
    res.status(200).json(products)
  } catch (error: any) {
    res.status(500).json(error);
  }
}

export async function individualBillFilter(
  req: IGetUserAuthInfoRequest,
  res: Response,
  next: NextFunction) {
  try {
    const { playerUsername, agentId, promotionId, status="matched", page=1, size=10 } = req.body 
      const where: PrismaWhere = { AND: [] }
      

      if (!string.isNullOrUndefinedOrEmpty(playerUsername)) {        
        where.AND.push({ playerUsername: playerUsername })
      }
      if (!string.isNullOrUndefinedOrEmpty(agentId)) {        
        where.AND.push({ agentId: agentId })
      }
      if (!string.isNullOrUndefinedOrEmpty(promotionId)) {        
        where.AND.push({ promoConditionId: promotionId })
      }
      if (!string.isNullOrUndefinedOrEmpty(status)) {        
        where.AND.push({ reportStatus: status })
      }

      const bills = await reportServices.individualBillFilter(where, page, size)
      res.status(200).json(bills);
  } catch (error: any) {
    res.status(500).json(error);
  }
}

export async function callBillDetails(
  req: IGetUserAuthInfoRequest,
  res: Response,
  next: NextFunction) {
  try {
    const hashKey = req.body.hashKey
    const products = await reportServices.callBillDetails(hashKey)
    res.status(200).json(products)
  } catch (error: any) {
    res.status(500).json(error);
  }
}

export async function individualFilter(
  req: IGetUserAuthInfoRequest,
  res: Response,
  next: NextFunction) {
  try {
    const { playerUsername, agentId, promotionId, status="matched", page=1, size=10 } = req.body 
      const where: PrismaWhere = { AND: [] }
            
      if (!string.isNullOrUndefinedOrEmpty(playerUsername)) {        
        where.AND.push({ playerUsername: playerUsername })
      }
      if (!string.isNullOrUndefinedOrEmpty(agentId)) {        
        where.AND.push({ agentId: agentId })
      }
      if (!string.isNullOrUndefinedOrEmpty(promotionId)) {        
        where.AND.push({ promoConditionId: promotionId })
      }
      if (!string.isNullOrUndefinedOrEmpty(status)) {        
        where.AND.push({ reportStatus: status })
      }
      const keyCache: string = JSON.stringify(where.AND);
      const data =  await getCache(`individualFilter-${keyCache}`);
      if (data) {
        res.status(200).json(JSON.parse(data));
        return;
      }
      const bills = await reportServices.individualFilter(where, page, size);
      setCache(`individualFilter-${keyCache}`, JSON.stringify(bills), 60);
      res.status(200).json(bills);
  } catch (error: any) {
    res.status(500).json(error);
  }
}

export async function callIndividualPromo(
  req: IGetUserAuthInfoRequest,
  res: Response,
  next: NextFunction) {
  try {
    const user: ParsedToken = req.user;
    const requestBody: OnetimePromoRequest = {
      agentId: req.body.agentId,
      memberUsername: req.body.memberUsername,
      dateFrom: req.body.dateFrom,
      dateTo: req.body.dateTo,
      promoId: req.body.promoId,
      categoryCode: req.body.categoryCode,
      billStart: req.body.billStart,
      billEnd: req.body.billEnd,
      createdBy: user.username,
      isManual: req.body.isManual,
      isOtherBill: req.body.isOtherBill,
    };
    const products = await reportServices.callIndividualPromo(requestBody)
    res.status(200).json(products)
  } catch (error: any) {
    res.status(500).json(error);
  }
}

export async function sendTelegramMsg(
  req: IGetUserAuthInfoRequest,
  res: Response,
  next: NextFunction) {
  try {
    const user = req.user;
    const requestBody: TelegramRequest = {
      reportDate: req.body.reportDate,
      agentId: req.body.agentId,
      memberId: req.body.memberId,
      promoConditionId: req.body.promoConditionId,
      reportDateTime: req.body.reportDateTime,
      reportStatus: req.body.reportStatus,
      agentName: req.body.agentName,
      playerUsername: req.body.playerUsername,
      promoName: req.body.promoName,
      reportType: req.body.reportType,
      reportCondition: req.body.reportCondition,
      categoryName: req.body.categoryName,
      billStart: req.body.billStart,
      billEnd: req.body.billEnd,
      billHistory: req.body.billHistory,
      billDetailUrl: req.body.billDetailUrl,
      hashKey: req.body.hashKey,
      failedReason: req.body.failedReason,
      credit: req.body.credit,
      phone: req.body.phone,
      annotation: req.body.annotation,
      billImage: req.files as Express.Multer.File[],
      staffName: req.body.staffName,
    };
    const products = await reportServices.sendTelegramMsg(requestBody)
    res.status(products.code != 200 ? 400 : 200).json(products)
  } catch (error: any) {
    res.status(500).json(error);
  }
}

export async function uploadImage(
  req: IGetUserAuthInfoRequest,
  res: Response,
  next: NextFunction) {
  try {
    const image = req.file; 
    if (image && image.buffer && image.mimetype) {      
      // Convert Buffer to Blob-like object
      const blob = new Blob([Buffer.from(image.buffer)], { type: image.mimetype });

      const formData = new FormData();
      formData.append('image', blob);
      const uploads = await reportServices.uploadImage(formData);
      res.status(200).json(uploads)
    } else {
      res.status(400).json(`Image has problem. Please upload image again.`)
    }    
  } catch (error: any) {
    res.status(500).json(error);
  }
}

export async function summaryByAgent(
  req: IGetUserAuthInfoRequest,
  res: Response,
  next: NextFunction) {
  try {
    const requestBody: summaryByAgentRequest = {
      dateFrom: req.body.dateFrom,
      dateTo: req.body.dateTo,
      // page: req.body.promoId ?? 1,
      // size: req.body.categoryCode ?? 20,
    };
    const keyCache: string = JSON.stringify(requestBody);
    const data =  await getCache(`summaryByAgent-${keyCache}`);
    if (data) {
      res.status(200).json(JSON.parse(data));
      return;
    }
    const summary = await reportServices.summaryByAgent(requestBody)
    setCache(`summaryByAgent-${keyCache}`, JSON.stringify(summary), 60);
    res.status(200).json(summary);
  } catch (error: any) {
    res.status(500).json(error);
  }
}

export async function summaryByPromotion(
  req: IGetUserAuthInfoRequest,
  res: Response,
  next: NextFunction) {
  try {
    const requestBody: summaryByPromotionRequest = {
      agentId: req.body.agentId,
      isSelectLsm99Ai: req.body.isSelectLsm99Ai,
      dateFrom: req.body.dateFrom,
      dateTo: req.body.dateTo,
      // page: req.body.promoId ?? 1,
      // size: req.body.categoryCode ?? 20,
    };

    const keyCache: string = JSON.stringify(requestBody);
    const data =  await getCache(`summaryByPromotion-${keyCache}`);
    if (data) {
      res.status(200).json(JSON.parse(data));
      return;
    }
    const summary = await reportServices.summaryByPromotion(requestBody)
    setCache(`summaryByPromotion-${keyCache}`, JSON.stringify(summary), 60);
    res.status(200).json(summary);
  } catch (error: any) {
    res.status(500).json(error);
  }
}
 */