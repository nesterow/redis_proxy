import { RedisClient } from 'redis'

export default interface IProxy {
    redis?: RedisClient
    listen(port: number|string, cb: void): void
    handler(...args: any[]): void
}