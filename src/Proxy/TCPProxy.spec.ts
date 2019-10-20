import * as path from 'path'
import configure from '../Utils/Configure'
configure(path.resolve(__dirname,'../..'))

import * as expect from 'expect'
import * as redis from 'redis'
import TCPProxy from './TCPProxy'

const {REDIS_URL, TCP_PROXY_PORT} = process.env



describe("TCPProxy: test tcp proxy implementation", function() {

    const proxy: TCPProxy = new TCPProxy(REDIS_URL)
    let redisClient: redis.RedisClient = null
    const PORT = parseInt(TCP_PROXY_PORT)

    this.beforeAll(async function() {
        return new Promise((resolve) => proxy.listen(PORT, () => {
            redisClient = redis.createClient({port: PORT, host: '127.0.0.1'})
            resolve()
        }))
    })

    it('it should check basic communication trough the proxy', () => {
        redisClient.set('a', 'a')
        redisClient.set('b', 'b')
        redisClient.get('a', function(e,a) {
            expect(a).toEqual('a')
        })
        redisClient.get('c', function(e,c){
            expect(c).toBe(null)
        })
        redisClient.get('a')
        redisClient.eval("return {err='this is an error'}", function() {})
        
    })

    it('it should get cached value', async () => {
        return new Promise((resolve) => {
            setTimeout(()=> redisClient.get('a', (e,a)=> {
                expect(a).toEqual('a')
                resolve()
            }), 300)
        })
    })
    

    this.afterAll(()=> setTimeout(() => process.exit(),200))

})