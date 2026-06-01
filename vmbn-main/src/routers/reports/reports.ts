import express from 'express';
import { db } from '../../utils/db.server';
import crypto, { randomUUID } from 'crypto';
import axios from 'axios';
import { Prisma } from '@prisma/client';
const routers = express.Router();
/* 
// routers.get("/bet-histories", async (req, res) => {
//     try {        
//         const data = req.body;
//         const size: number = Number(req.query.size) || 10;
//         const page: number = Number(req.query.page) || 1;

//         const limit: number = +size;
// 		const offset: number = +(limit * ((page || 1) - 1));        
        
//         Promise.all([
//             await db.betHistory.findMany({
//                 skip: offset,
//                 take: limit,
//             }),
//             await db.betHistory.count()
//         ])
//         .then(async (result) => {
//             const results: any = result[0];
//             const total: number = result[1];

//             res.json({
//                 total: total,
//                 limit: limit,
//                 currPage: +page || 1,
//                 lastPage: Math.ceil(total / limit),
//                 data: results,
//             });
//         }).catch((error) => {
//             console.log(error);
//             return res.json(error);
//         });
//     } catch (error: any) {
//         return res.json(error);
//     } finally {
//         await db.$disconnect(); // Disconnect the Prisma client
//     }
// })

routers.get("/fetch-product", async (req, res) => {
    try {      
        const url: string = process.env.LSM_URL+'/v3/product';
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
            for (const element of response.data.data){
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
                        var dbUpdated = await db.products.create({
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
                        console.log("INFO: updated status " + dbUpdated.productName)
                        result.push("INFO: updated status " + dbUpdated.productName)
                    }                    
                }                
            }            
           
            return res.json(result);
          })
          .catch((error) => {
            console.log(error);
            return res.json(error);
          });  
    } catch (error: any) {
        return res.json(error);
    } finally {
        await db.$disconnect(); // Disconnect the Prisma client
    }
})

routers.get("/fetch-product-test", async (req, res) => {
    try {        
        var username = "xbgtemplate";
        const appid = process.env.LSM_APPID as string
        const key = process.env.LSM_KEY as string
        let url = `appid=${appid}&username=${username}`;
        let signature = generateSignature(url, key);
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: 'http://apilsm2022.lsmtest.com/v3/product',
            headers: { 
              'Content-Type': 'application/json'
            }
          };
          
          axios.request(config)
          .then((response) => {
            //console.log(JSON.stringify(response.data));
            response.data.data.forEach(async (element: any) => {
                var dbcreate = await db.products.create({
                    data: {
                        productId: randomUUID(),
                        productName: element.brand.name + " - " + element.category.name,
                        brandName: element.brand.name,
                        brandCode: element.brand.code,
                        categoryName: element.category.name,
                        categoryCode: element.category.code,
                        status: "active",
                        createdBy: "Auto"
                    }
                })
                console.log(dbcreate.productName)
            });
            res.json(response.data);
          })
          .catch((error) => {
            console.log(error);
            res.json(error);
          });  
    } catch (error: any) {
        return res.json(error);
    } finally {
        await db.$disconnect(); // Disconnect the Prisma client
    }
})
function generateSignature(url: string, key: string): string {
    const hmac = crypto.createHmac('sha1', key);
    hmac.update(url);
    const signature = hmac.digest('base64');
    return signature;
}

routers.get("/products", async (req, res) => {
    try {        
        const result = await db.products.findMany()
        res.status(200).json(result)        
    } catch (error: any) {
        return res.json(error);
    } finally {
        await db.$disconnect(); // Disconnect the Prisma client
    }
})
 */
export default routers;