/**
 * This module should be forked using process.fork()
 */

import TLRUCache from './Cache'
import {RequestMessage, ResponseMessage, MessageType} from './Message'
const {PROXY_CACHE_EXPIRY = '190', PROXY_CACHE_CAPACITY = '1024'} = process.env

const Cache: TLRUCache = new TLRUCache( 
    parseInt(PROXY_CACHE_CAPACITY),
    parseInt(PROXY_CACHE_EXPIRY)
)

/**
 * Handle get/set operations
 * @param message 
 */
function handler(message: RequestMessage) {
    if (!('type' in message)) return;
    const key = message.data.key
    const value = message.data.value
    switch(message.type) {
        case MessageType.GET:
            const getResult = Cache.get(key)
            const getRes: ResponseMessage = {
                id: message.id,
                data: getResult,
                isResponse: true
            }
            process.send(getRes)
        case MessageType.SET:
            const setResult = Cache.set(key, value)
            const setRes: ResponseMessage = {
                id: message.id,
                data: setResult,
                isResponse: true
            }
            process.send(setRes)
    }
}

/**
 * Schedule cache invalidation operations
 */
function scheduleEviction() {
    Cache.validate()
    setTimeout(scheduleEviction, parseInt(PROXY_CACHE_EXPIRY) * 1000)
}



process.on('message', handler)
scheduleEviction()