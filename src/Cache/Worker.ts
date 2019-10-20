/**
 * We need to decouple the cache from the main thread.
 * Here I will implement a pub/sub using IPC
 */

import {fork, ChildProcess} from 'child_process'
import {resolve} from 'path'
import * as uuid from 'uuid/v4'
import {RequestMessage, ResponseMessage, MessageType} from './Message'
const {NODE_ENV} = process.env

const dir = ['test', 'dev'].includes(NODE_ENV) ?  resolve(__dirname, '..', '..', 'build', 'cache') : __dirname;

const workerProcess: ChildProcess = fork(resolve(dir, 'Process.js'))


export async function get(key: string) {
    return await send(MessageType.GET, { key, })
}

export async function set(key: string, value: string) {
    return await send(MessageType.SET, { key, value })
}

export async function stats() {
    return await send(MessageType.STATS, null)
}

function send(type: MessageType, message: any) {
    return new Promise((resolve, reject) => {
        const req: RequestMessage = {
            id: uuid(),
            type: type,
            data: message
        }
        workerProcess.send(req)     
        const handler: Function = function(message: ResponseMessage) {
            if (message.id === req.id){
                resolve(message.data)
                clearTimeout(timeout)
                workerProcess.off('message', handler as any)
            }
        }
        const timeout = setTimeout(() => {
            workerProcess.off('message', handler as any)
            reject(new Error("Worker: operation time limit"))
        }, 1000)
        workerProcess.on('message', handler as any) 
    })
}

process.on('exit', () => {
    workerProcess.kill() 
})
