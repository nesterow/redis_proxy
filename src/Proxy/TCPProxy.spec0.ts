import * as expect from 'expect';

import TCPProxy from './TCPProxy'
import * as redis from 'redis'


describe("TCPProxy: test tcp proxy implementation", function() {
    const proxy: TCPProxy = new TCPProxy()
    let redisClient: redis.RedisClient = null

    it('it should create proxy', async function() {
        return new Promise((resolve) => proxy.listen(7000, () => {
            redisClient = redis.createClient({port: 7000, host: '127.0.0.1'})
            resolve()
        }))
    })

    it('it should check basic communication trough the proxy', () => {
        redisClient.set('a', 'a')
        redisClient.set('b', 'b')
        redisClient.get('a', function() {

        })
        redisClient.get('c')
        redisClient.get('a')
        redisClient.eval("return {err='this is an error'}", function() {

        })
        
    })

    it('it should get cached value', async () => {
        return new Promise((resolve) => {
            setTimeout(()=> redisClient.get('a', (e,a)=> {
                console.log(1,a)
                resolve()
            }), 300)
        })
    })
    

    this.afterAll(()=> setTimeout(() => process.exit(),2000))

})