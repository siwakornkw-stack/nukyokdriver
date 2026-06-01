
import { Response, Request, NextFunction } from 'express'
import { IGetUserAuthInfoRequest } from "../../typings/express"
import { ParsedToken } from '../../typings/token'
import { db } from '../../utils/db.server'
import { ParamsWithId } from '../interfaces/ParamsWithId'
import { AgentInput } from './agent.schemas'
import { randomUUID } from 'crypto'
import { AgentData, AgentDetail } from '../interfaces/AgentResponse'
import { setCache, getCache } from "../../utils/redis"