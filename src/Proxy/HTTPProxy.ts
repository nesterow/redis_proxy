import * as express from "express"
import {Request, Response} from "express"
import IProxy from './IProxy'
import { RedisClient } from "redis"
import Logger from '../Utils/Logger'
import {get, set, stats} from '../Cache/Worker'

class HTTPProxy implements IProxy {
    
    app: express.Application
    redis: RedisClient

    constructor(redis: RedisClient) {
        this.redis = redis
        this.app = express()
        this.app.get('/', this.stats)
        this.app.get('/GET/:key', this.handler)
        this.app.use(this.errorHandler)
    }
    
    // get from redis, if exists update proxy cache
    RGET = async (key: string) => {
        return new Promise((resolve, reject) => {
            this.redis.get(key, async (err: any, value: string) => {
                if (err) reject(err)
                await set(key, value)
                resolve(value)
            })
        })
    }

    stats = async (req: Request, res: Response) => {
        const proxy = {
            memoryUsage: process.memoryUsage(),
            cpuUsage: process.cpuUsage()
        }
        const cache = await stats()
        res.json({ proxy, cache }).end()
    }

    handler = async (req: Request, res: Response) => {
        const {key} = req.params
        let value = await get(key)
        if (!value) {
            value = await this.RGET(key)
            if (!value)
                return res.status(404).end()
        }
        return res.json({key, value}).end()
    }

    errorHandler = async (err: any, req: Request, res: Response, next: Function) => {
        Logger.error("ERROR: HTTP Proxy -- " + err.stack)
    }

    listen(port: number|string, cb: any) {
        this.app.listen(port, cb)
    }
}


export default HTTPProxy
