import { config } from "dotenv"
import { resolve } from "path"
config({ path: resolve(__dirname, '../config.env') })

import * as redis from 'redis'

import HTTPProxy from './Proxy/HTTPProxy' 
const {HTTP_PROXY_PORT, REDIS_URL} = process.env


const redisClient = redis.createClient({
    url: REDIS_URL
})

function main() {
    console.log("Redis is ready. Initializing proxies...")
    
    const http_proxy = new HTTPProxy(redisClient)
    http_proxy.listen(HTTP_PROXY_PORT, () => {

        console.log("👍  HTTP Proxy is listening on ::" + HTTP_PROXY_PORT)

    })
}

redisClient.on('ready', main)
redisClient.on('error', () => {})