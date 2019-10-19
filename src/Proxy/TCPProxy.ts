import IProxy from './IProxy'
import * as net from 'net'

import Protocol from './Protocol'
import {get, set} from '../Cache/Worker'

class TCPProxy implements IProxy {
    
    socket: net.Socket

    constructor() {}

    handler = async (requestMessage: Buffer) => {
        
        const sendRequest = (message: Buffer): any => new Promise((resolve, reject)=>{
            if (!message.length) resolve(message) // return empty buffer
            const proxySocket: net.Socket = new net.Socket()
            proxySocket.connect(6379, '127.0.0.1', () => {
                proxySocket.write(message)
                proxySocket.on('data', (response: Buffer) => {
                    resolve(response)
                    proxySocket.destroy()
                })
                proxySocket.on('error', (err) => {
                    reject(err)
                    proxySocket.destroy()
                }) 
            })
        })

        const requestBatch: any[] = Protocol.decodeRequest(requestMessage)
        let cached: any = {}
        const filtered: any[] = []
        
        for (let i = 0; i < requestBatch.length; i++) {
            const cmd = requestBatch[i]
            if (Protocol.isCacheable(cmd)) {
                const [c, key] = cmd
                const cache = await get(key)
                if (cache)
                    cached[cmd.toString()] = cache
                else
                    filtered.push(cmd)
            } else {
                filtered.push(cmd)
            }
        }
        const request: Buffer = Protocol.encodeRequest(filtered)
        const response: Buffer = await sendRequest(request)

        const fromRedis: any = {}
        Protocol.associate(request, response).map((item: any[]) => {
            const [cmd, value] = item
            fromRedis[cmd.toString()] = value
        })

        const responseBatch = []
        for (let i = 0; i < requestBatch.length; i++) {
            const cmd = requestBatch[i].toString()
            const cachedValue = cached[cmd]
            if (cachedValue) {
                //console.log('cached >>>>', cachedValue)
                responseBatch.push(cachedValue)
                continue
            }
            const redisValue = fromRedis[cmd]
            if (!Protocol.isCacheable(requestBatch[i])) {
                responseBatch.push(redisValue)
                continue
            }
            const [c, key] = requestBatch[i]
            await set(key, redisValue)
            responseBatch.push(redisValue)
        }

        //console.log('-=-=-=-=\n', Protocol.encodeResponse(responseBatch).toString(), response.toString())
        this.socket.write(Protocol.encodeResponse(responseBatch))
        
        
    }

    listen(port: number, cb: any) {
        const server: net.Server = net.createServer((socket: net.Socket) => {
            this.socket = socket
            socket.on('data', (msg: Buffer) => this.handler(msg))
        })
        server.listen(port, cb)
        
    }

}


export default TCPProxy