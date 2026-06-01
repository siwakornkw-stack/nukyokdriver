import { UUID, randomUUID } from "crypto";
import { db } from "../../utils/db.server";
import axios, { AxiosRequestConfig } from "axios";
import { Decimal } from "@prisma/client/runtime/library";
// import { fetchData, generateSignature, mapResponseToBetHistory, ReportBetDetail, lsmBetHistory } from "../../utils/API"
import { RequestContent } from "../interfaces/Telegram";
import { OnetimePromoRequest, TelegramRequest, summaryByAgentRequest, summaryByPromotionRequest } from "../interfaces/BotApi";
import * as os from 'os';
import { fromZonedTime, format } from 'date-fns-tz';

import FormData from 'form-data';

// export function findBetHistoryByAppId(appid: string) {
//   return db.betHistory.findMany({
//     where: {
//       memberUsername: {
//         contains: appid
//       }
//     },
//     orderBy: {
//       createdAt: 'desc'
//     }
//   })
// }
/* 
export function payBillService(id: string[], status: string, updatedBy: string) {
  return new Promise(async (resolve, reject) => {
    try {
      // const report = await db.reportBetConditions.findFirst({
      //   where: { reportBetConditionId: id }
      // })
      // if (!report) {
      //   return reject({
      //     status: "error",
      //     message: "report not found."
      //   })
      // }      

      // let reportStatus = status; // 'waiting', 'deny', 'paid'
      // const isPay = reportStatus === 'paid';

      // const result = await db.reportBetConditions.update({
      //   where: { reportBetConditionId: id },
      //   data: {
      //     isPayBill: isPay,
      //     reportStatus: reportStatus
      //   },
      //   select: { reportBetConditionId: true, isPayBill: true }
      // })

      // return resolve({
      //   status: "success",
      //   message: "updated success.",
      //   data: result
      // })

      let reportStatus = status; // 'waiting', 'deny', 'paid'
      const isPay = reportStatus === 'paid';
      const result = await db.reportBetConditions.updateMany({
        where: {
          reportBetConditionId: { in: id }
        },
        data: {
          isPayBill: isPay,
          reportStatus: reportStatus,
          updatedAt: new Date(),
          updatedBy: updatedBy
        }
      })

      return resolve({
        status: "success",
        message: "updated success.",
        data: result
      })

    } catch (error: any) {
      return reject({
        status: "error",
        message: error.message
      })
    }
  })
}
export function filterReportConditions(where: any, page: number, size: number) {
  return new Promise(async (resolve, reject) => {
    try {
      const limit: number = +(size);
      const offset: number = +(limit * ((page || 1) - 1));

      Promise.all([db.reportBetConditions.findMany({
        skip: offset,
        take: limit,
        where: where,
        select: {
          reportBetConditionId: true,
          reportDateTime: true,
          agentName: true,
          playerUsername: true,
          reportType: true,
          reportCondition: true,
          categoryName: true,
          brandName: true,
          isPayBill: true,
          reportStatus: true,
          betDetail: true
        },
        orderBy: {
          reportDateTime: 'desc'
        }
      }), db.reportBetConditions.count({
        where: where
      })])
        .then(async (result) => {
          const row: any[] = await Promise.all(result[0].map(async (item) => {
            const newItem = { ...item };
            newItem.betDetail = JSON.parse(item.betDetail);
            return newItem;
          }));
          const rows: any = row;
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

export function calculateManual(
  agentId: UUID,
  username: string,
  reportDateFrom: string,
  reportDateTo: string,
  reportDate: string,
  desiredDate: Date,
  byUsername: string) {
  return new Promise(async (resolve, reject) => {
    let batchExecutionId;
    try {
      const agent = await db.agents.findUnique({
        where: {
          agentId: agentId,
          isDeleted: false
        },
        select: {
          agentId: true,
          agentName: true,
          appId: true,
          appKey: true
        }
      });
      if (!agent) {
        reject("this agent not found.");
      }

      const member = await db.member.findFirst({
        select: { memberId: true, memberUsername: true },
        where: { agentId: agent?.agentId, memberUsername: username }
      });
      if (!member) {
        reject("this member not found.");
      }
      var batch = await db.batchExecution.create({
        data: {
          batchType: "winloss-report-manual",
          agentName: agent?.agentName,
          executionStatus: "process",
          executionDateTime: new Date(),
          executionDetails: `[${byUsername}]เริ่มตรวจสอบบิลของ ${username}(${reportDateFrom}).`
        }
      });
      batchExecutionId = batch.batchExecutionId;

      let page = 1;
      let last_page = 1;
      let dateFrom: any;
      let dateTo: any;
      let dataAll: lsmBetHistory[] | null = [];
      // get bet history by user all page.
      for (page; page <= last_page; page++) {
        let url = `appid=${agent!.appId}&page=${page}&reportdate_from=${reportDateFrom}&reportdate_to=${reportDateTo}&username=${username}`;
        let signature = generateSignature(url, agent!.appKey);
        const response = await fetchData(agent!.appId, page, reportDateFrom, reportDateTo, username, signature)
        if (response.status != "success") {
          console.error('ERROR: ', response.message);
          await db.batchExecution.update({
            data: {
              executionStatus: "error",
              executionDetails: `[${byUsername}]เกิดปัญหาระหว่างดึงข้อมูลการเดิมพันจากระบบ lsm99.`,
              executionError: `${response.message}`
            },
            where: {
              batchExecutionId: batch.batchExecutionId
            }
          });
          return reject("เกิดปัญหาระหว่างดึงข้อมูลการเดิมพันจากระบบ lsm99.");
        }
        dateFrom = response.data.reportdate_from;
        dateTo = response.data.reportdate_to;
        last_page = response.data.last_page;
        dataAll.push(...mapResponseToBetHistory(response));
      }

      let filteredData: lsmBetHistory[] | null = dataAll.filter((entry) => {
        // const betTime = entry.betTime;
        // return betTime >= startDate && betTime <= endDate;
        const reportDated = entry.reportDate;
        return reportDated === reportDate;
      });

      console.log(`INFO: username: ${username}, dataAll: ${dataAll.length}, filteredData: ${filteredData.length}`);
      console.log(`INFO: byUsername: ${byUsername}, agent: ${agent?.agentName}, member: ${member?.memberUsername}`);
      if (filteredData.length > 0) {
        // check reports.            
        const startTimes = performance.now();
        const lastedReport = await db.reportBetConditions.findFirst({
          select: { reportBetConditionId: true, reportDateTime: true, createdAt: true },
          where: { agentId: agentId, memberId: member?.memberId },
          orderBy: { reportDateTime: 'desc' }
        });
        const defaultDateTime = new Date('2024-01-01'); // default date time.
        const selectedDateTime = lastedReport ? lastedReport.reportDateTime : defaultDateTime;

        const promoCondition = await db.promotionConditions.findMany({
          include: { product: true },
          where: { agentId: agentId },
          orderBy: [{ conditionNumber: 'desc', }, { condition: 'asc', },]
        });

        promoCondition.sort((a, b) => {
          const numA = parseInt(a.conditionNumber);
          const numB = parseInt(b.conditionNumber);

          return numB - numA;
        });
        if (promoCondition == null) {
          await db.batchExecution.update({
            data: {
              executionStatus: "error",
              executionDetails: `[${byUsername}] ไม่พบโปรโมชั่นของ ${agent?.agentName}`,
              executionError: `Promotion conditions not found.`
            },
            where: {
              batchExecutionId: batch.batchExecutionId
            }
          });
          return reject(`[${byUsername}] ไม่พบโปรโมชั่นของ ${agent?.agentName}`);
        }
        // // Find the maximum conditionNumber using reduce
        // const maxConditionNumber = promoCondition.reduce((max, promo) => {
        //     const currentNum = parseInt(promo.conditionNumber);
        //     return currentNum > max ? currentNum : max;
        // }, parseInt(promoCondition[0].conditionNumber));

        for (const promo of promoCondition) {
          //const startFilter = performance.now();

          for (const product of promo.product) {
            const brandCode = product?.brandCode ?? ""
            const categoryCode = product?.categoryCode ?? ""

            let betHistory = filteredData.filter((f) => f.brand === brandCode && f.betTime >= selectedDateTime && f.betTime <= desiredDate);
            if (betHistory.length < 1) {
              continue;
            }

            // const startCheck = performance.now();
            if (promo.condition === "consecutive-loss") {
              if (promo.isBetAmount) {
                await hasConsecutiveLossWithTurnover(betHistory, promo.condition, promo.conditionNumber, promo.fromBetAmount, promo.toBetAmount, brandCode, categoryCode, agentId, agent!.agentName, member!.memberId, username);
              } else {
                await hasConsecutiveLoss(betHistory, promo.condition, promo.conditionNumber, brandCode, categoryCode, agentId, agent!.agentName, member!.memberId, username);
              }
            } else if (promo.condition === "consecutive-win") {
              if (promo.isBetAmount) {
                await hasConsecutiveWinsWithTurnover(betHistory, promo.condition, promo.conditionNumber, promo.fromBetAmount, promo.toBetAmount, brandCode, categoryCode, agentId, agent!.agentName, member!.memberId, username)
              } else {
                await hasConsecutiveWins(betHistory, promo.condition, promo.conditionNumber, brandCode, categoryCode, agentId, agent!.agentName, member!.memberId, username)
              }
            } else if (promo.condition === "last-number") {
              if (promo.isBetAmount) {
                await hasLastNumberWithTurnover(betHistory, promo.condition, promo.conditionNumber, promo.fromBetAmount, promo.toBetAmount, brandCode, categoryCode, agentId, agent!.agentName, member!.memberId, username)
              } else {
                await hasLastNumber(betHistory, promo.condition, promo.conditionNumber, brandCode, categoryCode, agentId, agent!.agentName, member!.memberId, username)
              }
            } else if (promo.condition === "free-spin") {
              if (promo.isBetAmount) {
                await hasFreeSpinWithTurnover(betHistory, promo.condition, promo.conditionNumber, promo.fromBetAmount, promo.toBetAmount, brandCode, categoryCode, agentId, agent!.agentName, member!.memberId, username)
              } else {
                await hasFreeSpin(betHistory, promo.condition, promo.conditionNumber, brandCode, categoryCode, agentId, agent!.agentName, member!.memberId, username)
              }
            } else if (promo.condition === "free-spin-consecutive-loss") {
              if (promo.isBetAmount) {
                await hasFreeSpinConsecutiveLossWithTurnover(betHistory, promo.condition, promo.conditionNumber, promo.fromBetAmount, promo.toBetAmount, brandCode, categoryCode, agentId, agent!.agentName, member!.memberId, username)
              } else {
                await hasFreeSpinConsecutiveLoss(betHistory, promo.condition, promo.conditionNumber, brandCode, categoryCode, agentId, agent!.agentName, member!.memberId, username)
              }
            }

          }
        }

        await db.batchExecution.update({
          data: {
            executionStatus: "success",
            executionDetails: `[${byUsername}]ตรวจสอบบิลของ ${username}(${reportDate}) ใหม่เรียบร้อย.`
          },
          where: {
            batchExecutionId: batch.batchExecutionId
          }
        });
        resolve("success");
      } else {
        await db.batchExecution.update({
          data: {
            executionStatus: "success",
            executionDetails: `[${byUsername}]ลูกค้า ${username} ไม่มีการเดิมพันของวันที่ ${reportDate}.`
          },
          where: {
            batchExecutionId: batch.batchExecutionId
          }
        });
        resolve("success");
      }

    } catch (error: any) {
      await db.batchExecution.update({
        data: {
          executionStatus: "error",
          executionDetails: `[${byUsername}]ระบบมีปัญหา กรุณาแจ้งเจ้าหน้าที่.`,
          executionError: `${error.message}`
        },
        where: {
          batchExecutionId: batchExecutionId
        }
      });
      reject(error.message);
    }
  })
}

export function findAllReportConditions() {
  return db.reportBetConditions.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  })
}

export async function getAllPromotionCondition() {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await db.promotionConditions.findMany({
        select: { condition: true, conditionNumber: true },
        distinct: ['condition', 'conditionNumber'],
        orderBy: {
          createdAt: 'desc'
        }
      });
      result.sort((a, b) => {
        const numA = parseInt(a.conditionNumber);
        const numB = parseInt(b.conditionNumber);
        return numB - numA;
      });
      const groupedArray = result.reduce((result: any, item: any) => {
        const key = item.condition;
        const value = item.conditionNumber;

        if (!result[key]) {
          result[key] = [value];
        } else {
          result[key].push(value);
        }

        return result;
      }, {});

      return resolve(groupedArray);
    } catch (error: any) {
      return reject(error.message)
    }
  })
}

export function getAllProducts() {
  return db.products.findMany({
    select: {
      productId: true,
      productName: true,
      brandCode: true,
      brandName: true,
      categoryCode: true,
      categoryName: true,
      status: true
    },
    orderBy: {
      brandCode: 'asc'
    }
  })
}


export function getAllBatchs(page: number, size: number) {
  return new Promise(async (resolve, reject) => {
    try {
      const limit: number = +(size);
      const offset: number = +(limit * ((page || 1) - 1));

      Promise.all([db.batchExecution.findMany({
        skip: offset,
        take: limit,
        orderBy: {
          executionDateTime: 'desc'
        }
      }), db.batchExecution.count({
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

export function fetchProducts() {
  return new Promise(async (resolve, reject) => {
    try {
      const url: string = process.env.LSM_URL + '/v3/product';
      let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: url,
        headers: {
          'Content-Type': 'application/json'
        }
      };

      axios.request(config)
        .then(async (response) => {
          let result: string[] = []
          for (const element of response.data.data) {
            const check = await db.products.findFirst({
              where: { brandCode: element.brand.code, categoryCode: element.category.code }
            })
            if (!check) {
              var dbCreated = await db.products.create({
                data: {
                  productId: randomUUID(),
                  productName: element.brand.name + " - " + element.category.name,
                  brandName: element.brand.name,
                  brandCode: element.brand.code,
                  status: element.brand.status,
                  categoryName: element.category.name,
                  categoryCode: element.category.code,
                  createdBy: "Auto"
                }
              })
              console.log("INFO: Add " + dbCreated.productName)
              result.push("INFO: Add " + dbCreated.productName)
            } else {
              if (check.status != element.brand.status) {
                var dbUpdated = await db.products.update({
                  where: {
                    productId: check.productId
                  },
                  data: {
                    // productId: randomUUID(),
                    // productName: element.brand.name + " - " + element.category.name,
                    // brandName: element.brand.name,
                    // brandCode: element.brand.code,
                    // status: element.brand.status,
                    // categoryName: element.category.name,
                    // categoryCode: element.category.code,
                    // createdBy: "Auto"
                    status: element.brand.status,
                    updatedAt: new Date(),
                    updatedBy: 'auto'
                  }
                })
                console.log("INFO: updated status " + dbUpdated.productName)
                result.push("INFO: updated status " + dbUpdated.productName)
              }
            }
          }
          return resolve(result);
        })
        .catch((error) => {
          console.log(error);
          return reject(error);
        });
    } catch (error: any) {
      reject(error.message);
    }
  })
}

export async function sendTelegramNotifyMsgAsync(
  hashKey: string,
  staffName: string,
): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try { 
      if (hashKey.trim() === "") {
        return reject("hashKey is empty");
      }
      const bill = await db. reportOnetimeConditions.findFirst({
        where: {
          hashKey: hashKey
        }
      });
      if (!bill) {
        return reject(`Cannot find bill.`)
      }

      const telegramSetting = await db.settings.findFirst({
        where: { agentId: bill.agentId }
      });
      if (!telegramSetting) {
        return reject(`Cannot find telegram setting.`)
      }
      
      let token: string = "";
      let chatId: string = "";
      if (bill.categoryName === "casino") {
        token = String(telegramSetting.telegramTokenCasino);
        chatId = String(telegramSetting.telegramChatIdCasino);
      } else if (bill.categoryName === "game") {
        token = String(telegramSetting.telegramTokenGame);
        chatId = String(telegramSetting.telegramChatIdGame);
      }
      const categoryName: string = bill?.categoryName === 'casino' ? 'คาสิโน' :
                                   bill?.categoryName === 'game' ? 'สล็อต' :
                                   bill?.categoryName === 'sport' ? 'กีฬา' :
                                   bill?.categoryName === 'lotto' ? 'หวย' : ""      
      const message = `${os.EOL}Agent = ${bill.agentName}${os.EOL}`
        +`Member = ${bill.playerUsername}${os.EOL}`
        +`category = ${categoryName}${os.EOL}`
        +`promotion = ${bill.promoName}${os.EOL}`
        //+`Date = date${os.EOL}`
        +`DateTime = ${format(bill.reportDateTime, 'dd/MM/yyyy HH:mm:ss')}${os.EOL}`
        +`bill No. = ${bill.billStart} - ${bill.billEnd}${os.EOL}${os.EOL}`
        +`https://lsm99-winloss-streak.azurewebsites.net/individualProcess?tx=${hashKey}${os.EOL}`
        +`----------------------------------------------------------------${os.EOL}`
        +`Staff = ${staffName}${os.EOL}`
        +`Created = ${format(bill.createdAt.toLocaleString('en-US',{timeZone: 'Asia/Bangkok'}), 'dd/MM/yyyy HH:mm:ss')}`
      // message = `http://localhost:3000/individualProcess?tx=${hashKey}`
    
      const content: RequestContent = {
        chat_id: chatId,
        text: message,
        parse_mode: "HTML",
        disable_notification: true,
        disable_web_page_preview: false,
        reply_to_message_id: null,
      };
    
      const config: AxiosRequestConfig = {
        method: 'post',
        url: `https://api.telegram.org/bot${token}/sendMessage`,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        data: content,
      };
     
      try {
        const response = await axios.request(config);
        if (response.data.ok) {
          await db.reportOnetimeConditions.update({
            where: { reportId: bill.reportId },
            data: { isSendTelegram: true }
          })
          resolve(response.data);
        } else {
          reject(`cannot sent telegram. ${response.data.description}`);
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          reject(`HTTP error ${error.response?.status}: ${error.message}`);
        } else {
          reject('Network error');
        }
      }
    } catch (error: any) {
      reject(error.message);
    }
  });  
}

export function callOnetimePromo(requestBody: OnetimePromoRequest): Promise<any> {
  return new Promise(async (resolve, reject) => {
    try {
      const url: string = process.env.BOT_API + '/check-onetime-promo';
      const config: AxiosRequestConfig = {
        method: 'post',
        maxBodyLength: Infinity,
        url: url,
        headers: {
          'Content-Type': 'application/json'
        },
        data: requestBody
      };

      axios.request(config)
        .then(async (response) => {          
          resolve(response.data);
        })
        .catch((error) => {
          console.log(`ERROR: ${error.message}`);
          reject(error);
        });
    } catch (error: any) {
      reject(error.message);
    }
  })
}

export function individualBillFilter(where: any, page: number, size: number) {
  return new Promise(async (resolve, reject) => {
    try {
      const limit: number = +(size);
      const offset: number = +(limit * ((page || 1) - 1));

      Promise.all([db.reportOnetimeConditions.findMany({
        skip: offset,
        take: limit,
        where: where,
        orderBy: {
          createdAt: 'desc'
        }
      }), db.reportOnetimeConditions.count({
        where: where
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

export function callBillDetails(hashKey: string): Promise<any> {
  return new Promise(async (resolve, reject) => {
    try {
      const url: string = process.env.BOT_API + `/bill-details/${hashKey}`;
      const config: AxiosRequestConfig = {
        method: 'get',
        maxBodyLength: Infinity,
        url: url,
        headers: {
          'Content-Type': 'application/json'
        }
      };

      axios.request(config)
        .then(async (response) => {          
          resolve(response.data);
        })
        .catch((error) => {
          console.log(`ERROR: ${error.message}`);
          reject(error);
        });
    } catch (error: any) {
      reject(error.message);
    }
  })
}

export function individualFilter(where: any, page: number, size: number) {
  return new Promise(async (resolve, reject) => {
    try {
      const limit: number = +(size);
      const offset: number = +(limit * ((page || 1) - 1));

      Promise.all([db.reportIndividualConditions.findMany({
        skip: offset,
        take: limit,
        where: where,
        orderBy: {
          createdAt: 'desc'
        }
      }), db.reportIndividualConditions.count({
        where: where
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

export function callIndividualPromo(requestBody: OnetimePromoRequest): Promise<any> {
  return new Promise(async (resolve, reject) => {
    try {
      const url: string = process.env.BOT_API + '/check-individual-promo';
      const config: AxiosRequestConfig = {
        method: 'post',
        maxBodyLength: Infinity,
        url: url,
        headers: {
          'Content-Type': 'application/json'
        },
        data: requestBody
      };

      axios.request(config)
        .then(async (response) => {          
          resolve(response.data);
        })
        .catch((error) => {
          console.log(`ERROR: ${error.message}`);
          reject(error);
        });
    } catch (error: any) {
      reject(error.message);
    }
  })
}

export function sendTelegramMsg(requestBody: TelegramRequest): Promise<any> {
  return new Promise(async (resolve, reject) => {
    try {
      const formData = new FormData();

      Object.keys(requestBody).forEach(key => {
        if (key !== 'billImage') {
            formData.append(key, requestBody[key] ? requestBody[key] : '');
        }
      });
      requestBody.billImage.forEach((file, index) => {
          const fileField = `billImage${index + 1}`;
          formData.append(fileField, file.buffer, file.originalname);
      });
      const url: string = process.env.BOT_API + '/send-telegram-msg';
      const config: AxiosRequestConfig = {
        method: 'post',
        maxBodyLength: Infinity,
        url: url,
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        data: formData
      };

      axios.request(config)
        .then(async (response) => {          
          resolve(response.data);
        })
        .catch((error) => {
          console.log(`ERROR: ${error.message}`);
          reject(error);
        });
    } catch (error: any) {
      reject(error.message);
    }
  })
}

export function uploadImage(requestBody: any): Promise<any> {
  return new Promise(async (resolve, reject) => {
    try {
      const url: string = process.env.BOT_API + '/upload';
      const config: AxiosRequestConfig = {
        method: 'post',
        maxBodyLength: Infinity,
        url: url,
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        data: requestBody
      };

      axios.request(config)
        .then(async (response) => {          
          resolve(response.data);
        })
        .catch((error) => {
          console.log(`ERROR: ${error.message}`);
          reject(error);
        });
    } catch (error: any) {
      reject(error.message);
    }
  })
}

export function summaryByAgent(body: summaryByAgentRequest,) {
  return new Promise(async (resolve, reject) => {
    try {
      // const limit: number = +(body.size);
      // const offset: number = +(limit * ((body.page || 1) - 1));
      const LSM99Ai = ["c8d053bc-202c-4f42-903d-ec5fee398225","166b3706-88bc-432e-a710-7428d8fb68c9","9f025538-a7f2-4327-986c-aeefc18f29f2","a1eda473-ef8a-4dac-8bce-5065f76ca067"];
      
      const dateFrom = new Date(body.dateFrom);
      const dateTo = new Date(body.dateTo);
      dateFrom.setHours(0, 0, 0, 0);
      dateTo.setHours(23, 59, 59, 999);
      
      const timeZone = 'Asia/Bangkok';
      const utcFromBangkok = fromZonedTime(dateFrom, timeZone);
      const utcToBangkok = fromZonedTime(dateTo, timeZone);

      const reportData = await db.reportIndividualConditions.groupBy({
        by: ['agentId', 'reportDate', 'agentName'],
        _count: { _all: true },
        _sum: { credit: true },
        where: {
          AND: [
            { createdAt: { gte: utcFromBangkok } },
            { createdAt: { lte: utcToBangkok } }
          ]
        },
        orderBy: {
          reportDate: 'desc'
        }
      });

      const groupedData = reportData.reduce((accumulator: any, currentValue: any) => {
        const { agentId, reportDate, agentName, _count, _sum } = currentValue;
      
        if (!accumulator[agentId]) {
          accumulator[agentId] = [];
        }
      
        accumulator[agentId].push({
          reportDate,
          agentName,
          count: _count._all,
          sum: _sum.credit
        });
      
        return accumulator;
      }, {});
      

      const transformedData = Object.keys(groupedData).map(agentId => ({
        agentId,
        agentName: groupedData[agentId][0].agentName,
        agentCount: groupedData[agentId].reduce((total: any, detail: any) => total + detail.count, 0),
        agentSum: groupedData[agentId].reduce((total: any, detail: any) => total + parseFloat(detail.sum), 0).toFixed(2),
        details: groupedData[agentId]
      }));

      let totalAgentCount = 0;
      let totalAgentSum = 0;
      let combinedDetailsMap: { [date: string]: { count: number, sum: number } } = {};

      LSM99Ai.forEach(agentId => {
        if (groupedData[agentId]) {
          groupedData[agentId].forEach((detail: any) => {
            if (!combinedDetailsMap[detail.reportDate]) {
              combinedDetailsMap[detail.reportDate] = { count: 0, sum: 0 };
            }
            combinedDetailsMap[detail.reportDate].count += detail.count;
            combinedDetailsMap[detail.reportDate].sum += parseFloat(detail.sum);
          });
        }
      });

      const combinedDetails: any[] = Object.keys(combinedDetailsMap).map(reportDate => ({
        reportDate,
        count: combinedDetailsMap[reportDate].count,
        sum: combinedDetailsMap[reportDate].sum.toFixed(2),
        agentName: 'LSM99Ai'
      }));

      totalAgentCount = combinedDetails.reduce((total, detail) => total + detail.count, 0);
      totalAgentSum = combinedDetails.reduce((total, detail) => total + parseFloat(detail.sum), 0);

      const transformedDataLSM99Ai = {
        agentId: '',
        agentName: 'LSM99Ai',
        agentCount: totalAgentCount,
        agentSum: totalAgentSum.toFixed(2),
        details: combinedDetails
      };

      const transformedDataDeleteAgentId = transformedData.filter(item => !LSM99Ai.includes(item.agentId));

      const finalTransformedData = [...transformedDataDeleteAgentId, transformedDataLSM99Ai];

      resolve(finalTransformedData);   
      
    } catch (error: any) {
      reject(error.message);
    }
  });
}

export function summaryByPromotion(body: summaryByPromotionRequest,) {
  return new Promise(async (resolve, reject) => {
    try {
      // const limit: number = +(body.size);
      // const offset: number = +(limit * ((body.page || 1) - 1));
      const LSM99Ai = ["c8d053bc-202c-4f42-903d-ec5fee398225","166b3706-88bc-432e-a710-7428d8fb68c9","9f025538-a7f2-4327-986c-aeefc18f29f2","a1eda473-ef8a-4dac-8bce-5065f76ca067"];

      const dateFrom = new Date(body.dateFrom);
      const dateTo = new Date(body.dateTo);
      dateFrom.setHours(0, 0, 0, 0);
      dateTo.setHours(23, 59, 59, 999);
      
      const timeZone = 'Asia/Bangkok';
      const utcFromBangkok = fromZonedTime(dateFrom, timeZone);
      const utcToBangkok = fromZonedTime(dateTo, timeZone);
      const where = {
        AND: [
          { createdAt: { gte: utcFromBangkok } },
          { createdAt: { lte: utcToBangkok } },
          body.isSelectLsm99Ai
            ? { OR: LSM99Ai.map((x) => ({ agentId: x })) }
            : body.agentId === ""
            ? {} : { agentId: body.agentId }
        ]
      };
      const reportData = await db.reportIndividualConditions.groupBy({
        by: ['reportDate', 'promoName'],
        _count: { _all: true },
        _sum: { credit: true },
        where: where,
        orderBy: {
          reportDate: 'desc'
        }
      });

      const groupedData = reportData.reduce((accumulator: any, currentValue: any) => {
        const { reportDate, promoName, _count, _sum } = currentValue;
      
        if (!accumulator[promoName]) {
          accumulator[promoName] = [];
        }
      
        accumulator[promoName].push({
          promoName,
          reportDate,
          count: _count._all,
          sum: _sum.credit
        });
      
        return accumulator;
      }, {});
      

      const transformedData = Object.keys(groupedData).map(promoName => ({
        promoName,
        promoCount: groupedData[promoName].reduce((total: any, detail: any) => total + detail.count, 0),
        promoSum: groupedData[promoName].reduce((total: any, detail: any) => total + parseFloat(detail.sum), 0).toFixed(2),
        details: groupedData[promoName]
      }));
      
      resolve(transformedData);      
      
    } catch (error: any) {
      reject(error.message);
    }
  });
}


async function createReport(
  betHistory: ReportBetDetail[],
  promoCon: string,
  promoConNumber: string,
  brandCode: string,
  categoryCode: string,
  agentId: string,
  agentName: string,
  memberId: string,
  playerUsername: string
): Promise<boolean> {
  try {
    const created = await db.reportBetConditions.create({
      data: {
        agentId: agentId,
        reportDateTime: betHistory[betHistory.length - 1].betTime,
        agentName: agentName,
        memberId: memberId,
        playerUsername: playerUsername,
        reportType: promoCon,
        reportCondition: promoConNumber,
        categoryName: categoryCode,
        brandName: brandCode,
        betDetail: JSON.stringify(betHistory),
        createdBy: "Auto"
      }
    })
    if (created) {
      console.log(`PROCESS: create report[${created.reportBetConditionId}]. agentName: ${created.agentName}, playerUsername: ${created.playerUsername}, brand: ${created.brandName}, condition: ${created.reportType}(${created.reportCondition})`);
      return true
    } else {
      console.error('ERROR: cannot create report. agentName: ' + agentName + ', playerUsername: ' + playerUsername + ', betTime: ' + betHistory[betHistory.length - 1].betTime);
      return false
    }
  } catch (error: any) {
    console.error('ERROR catch(createReport): ', error.message);
    return false
  }
}

async function hasConsecutiveLoss(
  betHistory: ReportBetDetail[],
  promoCon: string,
  promoConNumber: string,
  brandCode: string,
  categoryCode: string,
  agentId: string,
  agentName: string,
  memberId: string,
  playerUsername: string
) {
  const consecutiveCount = Number(promoConNumber);
  if (betHistory.length < consecutiveCount) {
    return null;
  }
  for (let i = 0; i < betHistory.length - consecutiveCount; i++) {
    let consecutiveLoss = 0;
    let consecutiveLossHistory: ReportBetDetail[] = [];
    for (let j = i; j < i + consecutiveCount; j++) {
      if (categoryCode === "casino") {
        if (betHistory[j] 
          && betHistory[j].result === "LOSE"
          && (betHistory[j].chooseBet === "Player" || betHistory[j].chooseBet === "Banker" || betHistory[j].chooseBet === "Dragon" || betHistory[j].chooseBet === "Tiger")
          ) {
          consecutiveLoss++;
          consecutiveLossHistory.push({
            brand: betHistory[j].brand,
            game: betHistory[j].game,
            betTime: betHistory[j].betTime,
            betId: betHistory[j].betId,
            chooseBet: betHistory[j].chooseBet,
            result: betHistory[j].result,
            betAmount: betHistory[j].betAmount,
            memberWinloss: betHistory[j].memberWinloss,
            turnover: betHistory[i].turnover
          });
        } else {
          break;
        }
      } else if (categoryCode === "game") {
        if (betHistory[j] 
          && betHistory[j].result === "LOSE" 
          && betHistory[j].betAmount.add(betHistory[j].memberWinloss).isZero()
          ) {
          consecutiveLoss++;
          consecutiveLossHistory.push({
            brand: betHistory[j].brand,
            game: betHistory[j].game,
            betTime: betHistory[j].betTime,
            betId: betHistory[j].betId,
            chooseBet: betHistory[j].chooseBet,
            result: betHistory[j].result,
            betAmount: betHistory[j].betAmount,
            memberWinloss: betHistory[j].memberWinloss,
            turnover: betHistory[i].turnover
          });
        } else {
          break;
        }
      } else {
        if (betHistory[j] && betHistory[j].result === "LOSE") {
          consecutiveLoss++;
          consecutiveLossHistory.push({
            brand: betHistory[j].brand,
            game: betHistory[j].game,
            betTime: betHistory[j].betTime,
            betId: betHistory[j].betId,
            chooseBet: betHistory[j].chooseBet,
            result: betHistory[j].result,
            betAmount: betHistory[j].betAmount,
            memberWinloss: betHistory[j].memberWinloss,
            turnover: betHistory[i].turnover
          });
        } else {
          break;
        }
      }
      
    }

    if (consecutiveLoss === consecutiveCount) {
      //return consecutiveLossHistory;
      await createReport(consecutiveLossHistory, promoCon, promoConNumber, brandCode, categoryCode, agentId, agentName, memberId, playerUsername);
      consecutiveLossHistory = [];
      i += (consecutiveCount - 1);
      continue;
    } else {
      consecutiveLossHistory = [];
    }
  }
  //return null;
}

async function hasConsecutiveLossWithTurnover(
  betHistory: ReportBetDetail[],
  promoCon: string,
  promoConNumber: string,
  minTurnover: Decimal,
  maxTurnover: Decimal,
  brandCode: string,
  categoryCode: string,
  agentId: string,
  agentName: string,
  memberId: string,
  playerUsername: string
) {
  const consecutiveCount = Number(promoConNumber);
  if (betHistory.length < consecutiveCount) {
    return null;
  }

  for (let i = 0; i < betHistory.length - consecutiveCount; i++) {
    let consecutiveLoss = 0;
    let consecutiveLossHistory: ReportBetDetail[] = [];
    for (let j = i; j < i + consecutiveCount; j++) {
      if (categoryCode === "casino") {
        if (betHistory[j] 
          && betHistory[j].result === "LOSE"
          && (betHistory[j].chooseBet === "Player" || betHistory[j].chooseBet === "Banker" || betHistory[j].chooseBet === "Dragon" || betHistory[j].chooseBet === "Tiger")
          && betHistory[j].turnover >= minTurnover
          && betHistory[j].turnover <= maxTurnover
        ) {
          consecutiveLoss++;
          consecutiveLossHistory.push({
            brand: betHistory[j].brand,
            game: betHistory[j].game,
            betTime: betHistory[j].betTime,
            betId: betHistory[j].betId,
            chooseBet: betHistory[j].chooseBet,
            result: betHistory[j].result,
            betAmount: betHistory[j].betAmount,
            memberWinloss: betHistory[j].memberWinloss,
            turnover: betHistory[i].turnover
          });
        } else {
          break;
        }
      } else if (categoryCode === "game") {
        if (betHistory[j]
          && betHistory[j].result === "LOSE"
          && betHistory[j].betAmount.add(betHistory[j].memberWinloss).isZero()
          && betHistory[j].turnover >= minTurnover
          && betHistory[j].turnover <= maxTurnover
        ) {
          consecutiveLoss++;
          consecutiveLossHistory.push({
            brand: betHistory[j].brand,
            game: betHistory[j].game,
            betTime: betHistory[j].betTime,
            betId: betHistory[j].betId,
            chooseBet: betHistory[j].chooseBet,
            result: betHistory[j].result,
            betAmount: betHistory[j].betAmount,
            memberWinloss: betHistory[j].memberWinloss,
            turnover: betHistory[i].turnover
          });
        } else {
          break;
        }
      } else {
        if (betHistory[j] &&
          betHistory[j].result === "LOSE" &&
          betHistory[j].turnover >= minTurnover &&
          betHistory[j].turnover <= maxTurnover
        ) {
          consecutiveLoss++;
          consecutiveLossHistory.push({
            brand: betHistory[j].brand,
            game: betHistory[j].game,
            betTime: betHistory[j].betTime,
            betId: betHistory[j].betId,
            chooseBet: betHistory[j].chooseBet,
            result: betHistory[j].result,
            betAmount: betHistory[j].betAmount,
            memberWinloss: betHistory[j].memberWinloss,
            turnover: betHistory[i].turnover
          });
        } else {
          break;
        }
      }
      
    }

    if (consecutiveLoss === consecutiveCount) {
      //return consecutiveLossHistory;
      await createReport(consecutiveLossHistory, promoCon, promoConNumber, brandCode, categoryCode, agentId, agentName, memberId, playerUsername);
      consecutiveLossHistory = [];
      i += (consecutiveCount - 1);
      continue;
    } else {
      consecutiveLossHistory = [];
    }
  }
  //return null;
}

async function hasConsecutiveWins(
  betHistory: ReportBetDetail[],
  promoCon: string,
  promoConNumber: string,
  brandCode: string,
  categoryCode: string,
  agentId: string,
  agentName: string,
  memberId: string,
  playerUsername: string
) {
  const consecutiveCount = Number(promoConNumber);
  if (betHistory.length < consecutiveCount) {
    return null;
  }

  for (let i = 0; i < betHistory.length - consecutiveCount; i++) {
    let consecutiveWins = 0;
    //let consecutiveWinHistory: BetHistory[] = [];
    let consecutiveWinHistory: ReportBetDetail[] = [];

    for (let j = i; j < i + consecutiveCount; j++) {
      if (categoryCode === "casino") {
        if (betHistory[j] 
          && betHistory[j].result === "WIN"
          && (betHistory[j].chooseBet === "Player" || betHistory[j].chooseBet === "Banker" || betHistory[j].chooseBet === "Dragon" || betHistory[j].chooseBet === "Tiger")
          ) {
          consecutiveWins++;
          //consecutiveWinHistory.push(betHistory[j]);
          consecutiveWinHistory.push({
            brand: betHistory[j].brand,
            game: betHistory[j].game,
            betTime: betHistory[j].betTime,
            betId: betHistory[j].betId,
            chooseBet: betHistory[j].chooseBet,
            result: betHistory[j].result,
            betAmount: betHistory[j].betAmount,
            memberWinloss: betHistory[j].memberWinloss,
            turnover: betHistory[i].turnover
          });
        } else {
          break;
        }
      } else {
        if (betHistory[j] && betHistory[j].result === "WIN") {
          consecutiveWins++;
          //consecutiveWinHistory.push(betHistory[j]);
          consecutiveWinHistory.push({
            brand: betHistory[j].brand,
            game: betHistory[j].game,
            betTime: betHistory[j].betTime,
            betId: betHistory[j].betId,
            chooseBet: betHistory[j].chooseBet,
            result: betHistory[j].result,
            betAmount: betHistory[j].betAmount,
            memberWinloss: betHistory[j].memberWinloss,
            turnover: betHistory[i].turnover
          });
        } else {
          break;
        }
      }
      
    }

    if (consecutiveWins === consecutiveCount) {
      // return consecutiveWinHistory;
      await createReport(consecutiveWinHistory, promoCon, promoConNumber, brandCode, categoryCode, agentId, agentName, memberId, playerUsername);
      consecutiveWinHistory = [];
      i += (consecutiveCount - 1);
      continue;
    } else {
      consecutiveWinHistory = [];
    }
  }
  //return null;
}

async function hasConsecutiveWinsWithTurnover(
  betHistory: ReportBetDetail[],
  promoCon: string,
  promoConNumber: string,
  minTurnover: Decimal,
  maxTurnover: Decimal,
  brandCode: string,
  categoryCode: string,
  agentId: string,
  agentName: string,
  memberId: string,
  playerUsername: string
) {
  const consecutiveCount = Number(promoConNumber);
  if (betHistory.length < consecutiveCount) {
    return null;
  }

  for (let i = 0; i < betHistory.length - consecutiveCount; i++) {
    let consecutiveWins = 0;
    //let consecutiveWinHistory: BetHistory[] = [];
    let consecutiveWinHistory: ReportBetDetail[] = [];
    for (let j = i; j < i + consecutiveCount; j++) {
      if (categoryCode === "casino") {
        if (betHistory[j]
          && betHistory[j].result === "WIN"
          && (betHistory[j].chooseBet === "Player" || betHistory[j].chooseBet === "Banker" || betHistory[j].chooseBet === "Dragon" || betHistory[j].chooseBet === "Tiger")
          && betHistory[j].turnover >= minTurnover
          && betHistory[j].turnover <= maxTurnover
        ) {
          consecutiveWins++;
          //consecutiveWinHistory.push(betHistory[j]);
          consecutiveWinHistory.push({
            brand: betHistory[j].brand,
            game: betHistory[j].game,
            betTime: betHistory[j].betTime,
            betId: betHistory[j].betId,
            chooseBet: betHistory[j].chooseBet,
            result: betHistory[j].result,
            betAmount: betHistory[j].betAmount,
            memberWinloss: betHistory[j].memberWinloss,
            turnover: betHistory[i].turnover
          });
        } else {
          break;
        }
      } else {
        if (betHistory[j] &&
          betHistory[j].result === "WIN" &&
          betHistory[j].turnover >= minTurnover &&
          betHistory[j].turnover <= maxTurnover
        ) {
          consecutiveWins++;
          //consecutiveWinHistory.push(betHistory[j]);
          consecutiveWinHistory.push({
            brand: betHistory[j].brand,
            game: betHistory[j].game,
            betTime: betHistory[j].betTime,
            betId: betHistory[j].betId,
            chooseBet: betHistory[j].chooseBet,
            result: betHistory[j].result,
            betAmount: betHistory[j].betAmount,
            memberWinloss: betHistory[j].memberWinloss,
            turnover: betHistory[i].turnover
          });
        } else {
          break;
        }
      }
      
    }

    if (consecutiveWins === consecutiveCount) {
      // return consecutiveWinHistory;
      await createReport(consecutiveWinHistory, promoCon, promoConNumber, brandCode, categoryCode, agentId, agentName, memberId, playerUsername);
      consecutiveWinHistory = [];
      i += (consecutiveCount - 1);
      continue;
    } else {
      consecutiveWinHistory = [];
    }
  }
  // return null;
}

async function hasLastNumber(
  betHistory: ReportBetDetail[],
  promoCon: string,
  promoConNumber: string,
  brandCode: string,
  categoryCode: string,
  agentId: string,
  agentName: string,
  memberId: string,
  playerUsername: string
) {
  for (let i = 0; i < betHistory.length; i++) {
    let lastNumberHistory: ReportBetDetail[] = [];
    if (categoryCode === "casino") {
      if (betHistory[i].betId.endsWith(promoConNumber)
      && (betHistory[i].chooseBet === "Player" || betHistory[i].chooseBet === "Banker" || betHistory[i].chooseBet === "Dragon" || betHistory[i].chooseBet === "Tiger")
    ) {
        lastNumberHistory.push({
          brand: betHistory[i].brand,
          game: betHistory[i].game,
          betTime: betHistory[i].betTime,
          betId: betHistory[i].betId,
          chooseBet: betHistory[i].chooseBet,
          result: betHistory[i].result,
          betAmount: betHistory[i].betAmount,
          memberWinloss: betHistory[i].memberWinloss,
          turnover: betHistory[i].turnover
        });
        // return lastNumberHistory;
        await createReport(lastNumberHistory, promoCon, promoConNumber, brandCode, categoryCode, agentId, agentName, memberId, playerUsername);
        lastNumberHistory = [];
        continue;
      } else {
        lastNumberHistory = [];
      }
    } else {
      if (betHistory[i].betId.endsWith(promoConNumber)) {
        lastNumberHistory.push({
          brand: betHistory[i].brand,
          game: betHistory[i].game,
          betTime: betHistory[i].betTime,
          betId: betHistory[i].betId,
          chooseBet: betHistory[i].chooseBet,
          result: betHistory[i].result,
          betAmount: betHistory[i].betAmount,
          memberWinloss: betHistory[i].memberWinloss,
          turnover: betHistory[i].turnover
        });
        // return lastNumberHistory;
        await createReport(lastNumberHistory, promoCon, promoConNumber, brandCode, categoryCode, agentId, agentName, memberId, playerUsername);
        lastNumberHistory = [];
        continue;
      } else {
        lastNumberHistory = [];
      }
    }    
  }
  //return null;
}

async function hasLastNumberWithTurnover(
  betHistory: ReportBetDetail[],
  promoCon: string,
  promoConNumber: string,
  minTurnover: Decimal,
  maxTurnover: Decimal,
  brandCode: string,
  categoryCode: string,
  agentId: string,
  agentName: string,
  memberId: string,
  playerUsername: string
) {
  for (let i = 0; i < betHistory.length; i++) {
    let lastNumberHistory: ReportBetDetail[] = [];
    if (categoryCode === "casino") {
      if (betHistory[i].betId.endsWith(promoConNumber) 
      && (betHistory[i].chooseBet === "Player" || betHistory[i].chooseBet === "Banker" || betHistory[i].chooseBet === "Dragon" || betHistory[i].chooseBet === "Tiger")
      && betHistory[i].turnover >= minTurnover 
    && betHistory[i].turnover <= maxTurnover
    ) {
        lastNumberHistory.push({
          brand: betHistory[i].brand,
          game: betHistory[i].game,
          betTime: betHistory[i].betTime,
          betId: betHistory[i].betId,
          chooseBet: betHistory[i].chooseBet,
          result: betHistory[i].result,
          betAmount: betHistory[i].betAmount,
          memberWinloss: betHistory[i].memberWinloss,
          turnover: betHistory[i].turnover
        });
        // return lastNumberHistory;
        await createReport(lastNumberHistory, promoCon, promoConNumber, brandCode, categoryCode, agentId, agentName, memberId, playerUsername);
        lastNumberHistory = [];
        continue;
      } else {
        lastNumberHistory = [];
      }
    } else {
      if (betHistory[i].betId.endsWith(promoConNumber) && betHistory[i].turnover >= minTurnover && betHistory[i].turnover <= maxTurnover) {
        lastNumberHistory.push({
          brand: betHistory[i].brand,
          game: betHistory[i].game,
          betTime: betHistory[i].betTime,
          betId: betHistory[i].betId,
          chooseBet: betHistory[i].chooseBet,
          result: betHistory[i].result,
          betAmount: betHistory[i].betAmount,
          memberWinloss: betHistory[i].memberWinloss,
          turnover: betHistory[i].turnover
        });
        // return lastNumberHistory;
        await createReport(lastNumberHistory, promoCon, promoConNumber, brandCode, categoryCode, agentId, agentName, memberId, playerUsername);
        lastNumberHistory = [];
        continue;
      } else {
        lastNumberHistory = [];
      }
    }
    
  }
  //return null;
}


async function hasFreeSpin(
  betHistory: ReportBetDetail[],
  promoCon: string,
  promoConNumber: string,
  brandCode: string,
  categoryCode: string,
  agentId: string,
  agentName: string,
  memberId: string,
  playerUsername: string
) {
  const consecutiveCount = Number(promoConNumber);
  if (betHistory.length < consecutiveCount) {
    return null;
  }
  for (let i = 0; i < betHistory.length - consecutiveCount; i++) {
    let freeSpin = 0;
    let freeSpinHistory: ReportBetDetail[] = [];
    for (let j = i; j < i + consecutiveCount; j++) {
      if (betHistory[j] && betHistory[j].betAmount.isZero()) {
        freeSpin++;
        freeSpinHistory.push({
          brand: betHistory[j].brand,
          game: betHistory[j].game,
          betTime: betHistory[j].betTime,
          betId: betHistory[j].betId,
          chooseBet: betHistory[j].chooseBet,
          result: betHistory[j].result,
          betAmount: betHistory[j].betAmount,
          memberWinloss: betHistory[j].memberWinloss,
          turnover: betHistory[i].turnover
        });
      } else {
        break;
      }
    }

    if (freeSpin === consecutiveCount) {
      freeSpinHistory.unshift(betHistory[i - 1]);
      await createReport(freeSpinHistory, promoCon, promoConNumber, brandCode, categoryCode, agentId, agentName, memberId, playerUsername);
      freeSpinHistory = [];
      i += (consecutiveCount - 1);
      continue;
    } else {
      freeSpinHistory = [];
    }
  }
}

async function hasFreeSpinWithTurnover(
  betHistory: ReportBetDetail[],
  promoCon: string,
  promoConNumber: string,
  minTurnover: Decimal,
  maxTurnover: Decimal,
  brandCode: string,
  categoryCode: string,
  agentId: string,
  agentName: string,
  memberId: string,
  playerUsername: string
) {
  const consecutiveCount = Number(promoConNumber);
  if (betHistory.length < consecutiveCount) {
    return null;
  }

  for (let i = 0; i < betHistory.length - consecutiveCount; i++) {
    let freeSpin = 0;
    let freeSpinHistory: ReportBetDetail[] = [];
    for (let j = i; j < i + consecutiveCount; j++) {
      if (betHistory[j] && betHistory[j].betAmount.isZero()) {
        freeSpin++;
        freeSpinHistory.push({
          brand: betHistory[j].brand,
          game: betHistory[j].game,
          betTime: betHistory[j].betTime,
          betId: betHistory[j].betId,
          chooseBet: betHistory[j].chooseBet,
          result: betHistory[j].result,
          betAmount: betHistory[j].betAmount,
          memberWinloss: betHistory[j].memberWinloss,
          turnover: betHistory[i].turnover
        });
      } else {
        break;
      }
    }

    if (freeSpin === consecutiveCount) {
      if (betHistory[i - 1].turnover >= minTurnover && betHistory[i - 1].turnover <= maxTurnover) {
        freeSpinHistory.unshift(betHistory[i - 1]);
        await createReport(freeSpinHistory, promoCon, promoConNumber, brandCode, categoryCode, agentId, agentName, memberId, playerUsername);
        freeSpinHistory = [];
        i += (consecutiveCount - 1);
        continue;
      } else {
        freeSpinHistory = [];
      }
    } else {
      freeSpinHistory = [];
    }
  }
}

async function hasFreeSpinConsecutiveLoss(
  betHistory: ReportBetDetail[],
  promoCon: string,
  promoConNumber: string,
  brandCode: string,
  categoryCode: string,
  agentId: string,
  agentName: string,
  memberId: string,
  playerUsername: string
) {
  const consecutiveCount = Number(promoConNumber);
  if (betHistory.length < consecutiveCount) {
    return null;
  }
  for (let i = 0; i < betHistory.length - consecutiveCount; i++) {
    let freeSpin = 0;
    let freeSpinHistory: ReportBetDetail[] = [];
    for (let j = i; j < i + consecutiveCount; j++) {
      // betHistory = betHistory.filter((f) => f.result != "LOSE" || (f.result === "LOSE" && (f.betAmount.add(f.memberWinloss).isZero())));
      if (betHistory[j] && betHistory[j].betAmount.isZero() && betHistory[j].memberWinloss.isZero()) {
        freeSpin++;
        freeSpinHistory.push({
          brand: betHistory[j].brand,
          game: betHistory[j].game,
          betTime: betHistory[j].betTime,
          betId: betHistory[j].betId,
          chooseBet: betHistory[j].chooseBet,
          result: betHistory[j].result,
          betAmount: betHistory[j].betAmount,
          memberWinloss: betHistory[j].memberWinloss,
          turnover: betHistory[i].turnover
        });
      } else {
        break;
      }
    }

    if (freeSpin === consecutiveCount) {
      freeSpinHistory.unshift(betHistory[i - 1]);
      await createReport(freeSpinHistory, promoCon, promoConNumber, brandCode, categoryCode, agentId, agentName, memberId, playerUsername);
      freeSpinHistory = [];
      i += (consecutiveCount - 1);
      continue;
    } else {
      freeSpinHistory = [];
    }
  }
  //return null;
}

async function hasFreeSpinConsecutiveLossWithTurnover(
  betHistory: ReportBetDetail[],
  promoCon: string,
  promoConNumber: string,
  minTurnover: Decimal,
  maxTurnover: Decimal,
  brandCode: string,
  categoryCode: string,
  agentId: string,
  agentName: string,
  memberId: string,
  playerUsername: string
) {
  const consecutiveCount = Number(promoConNumber);
  if (betHistory.length < consecutiveCount) {
    return null;
  }

  for (let i = 0; i < betHistory.length - consecutiveCount; i++) {
    let freeSpin = 0;
    let freeSpinHistory: ReportBetDetail[] = [];
    for (let j = i; j < i + consecutiveCount; j++) {
      if (betHistory[j] && betHistory[j].result === "LOSE") {
        freeSpin++;
        freeSpinHistory.push({
          brand: betHistory[j].brand,
          game: betHistory[j].game,
          betTime: betHistory[j].betTime,
          betId: betHistory[j].betId,
          chooseBet: betHistory[j].chooseBet,
          result: betHistory[j].result,
          betAmount: betHistory[j].betAmount,
          memberWinloss: betHistory[j].memberWinloss,
          turnover: betHistory[i].turnover
        });
      } else {
        break;
      }
    }

    if (freeSpin === consecutiveCount) {
      if (betHistory[i - 1].turnover >= minTurnover && betHistory[i - 1].turnover <= maxTurnover) {
        freeSpinHistory.unshift(betHistory[i - 1]);
        await createReport(freeSpinHistory, promoCon, promoConNumber, brandCode, categoryCode, agentId, agentName, memberId, playerUsername);
        freeSpinHistory = [];
        i += (consecutiveCount - 1);
        continue;
      } else {
        freeSpinHistory = [];
      }
    } else {
      freeSpinHistory = [];
    }
  }
} */
