import * as express from "express"
import {Request, Response} from "express"
import IProxy from './IProxy'
import { RedisClient } from "redis"


class HTTPProxy implements IProxy {
    
    app: express.Application
    redis: RedisClient

    constructor(redis: RedisClient) {
        this.redis = redis
        this.app = express()
        this.app.get('/', this.handler)
    }

    handler(req: Request, res: Response) {

    }

    listen(port: number|string, cb: any) {
        this.app.listen(port, cb)
    }
}


export default HTTPProxy
