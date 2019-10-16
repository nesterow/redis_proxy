import IProxy from './IProxy'
import { RedisClient } from "redis"


class TCPProxy implements IProxy {
    
    redis: RedisClient

    constructor(redis: RedisClient) {
        this.redis = redis
    }

    handler(req: Request, res: Response) {}

    listen(port: number, cb: any) {}
}


export default HTTPProxy