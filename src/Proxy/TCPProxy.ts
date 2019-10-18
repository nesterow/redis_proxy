import IProxy from './IProxy'
import { RedisClient } from "redis"
import * as net from 'net'
//@ts-ignore
import * as Parser from 'redis-parser'

import Protocol from './Protocol'

class TCPProxy implements IProxy {
    
    socket: net.Socket

    constructor() {}

    handler(requestMessage: Buffer) {
        const proxySocket: net.Socket = new net.Socket()
        
        const handleResponse = (request: Buffer) => {
            proxySocket.on('data', (response: Buffer) => {
                // console.log('->>>\n', Protocol.associate(request, response))
                this.socket.write(response)
                proxySocket.destroy()
            })
        } 

        proxySocket.connect(6379, '127.0.0.1', () => {
            proxySocket.write(requestMessage)
            handleResponse(requestMessage)
        })
        
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