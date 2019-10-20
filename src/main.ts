import * as path from 'path'
import configure from './Utils/Configure'
configure(path.resolve(__dirname,'..'))

import Logger from './Utils/Logger'
import * as redis from 'redis'
import HTTPProxy from './Proxy/HTTPProxy' 
import TCPProxy from './Proxy/TCPProxy'
const {TCP_PROXY_PORT, HTTP_PROXY_PORT, REDIS_URL} = process.env


const redisClient = redis.createClient({url: REDIS_URL})

const main = () => {
    Logger.info("Redis is ready. Initializing proxies...")
    
    const http_proxy = new HTTPProxy(redisClient)

    http_proxy.listen(HTTP_PROXY_PORT, () => {
        Logger.info("👍  HTTP Proxy is listening on ::" + HTTP_PROXY_PORT)
    })
    
    const redis_proxy = new TCPProxy(REDIS_URL)
    redis_proxy.listen(parseInt(TCP_PROXY_PORT), () => {
        Logger.info("👍  TCP Proxy is listening on ::" + TCP_PROXY_PORT)
    })
    return http_proxy
}

redisClient.on('ready', main)
redisClient.on('error', (error: any) => {

})

process.on('uncaughtException', (err) => { 
    Logger.error("Node.JS Error: "+ err)
})