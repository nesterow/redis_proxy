import * as path from 'path'
import configure from './Utils/Configure'
configure(path.resolve(__dirname,'..'))

import * as expect from 'expect'
import * as redis from 'redis'
import HTTPProxy from './Proxy/HTTPProxy'
import * as request from "supertest"
import {set, get} from './Cache/Worker'

const {REDIS_URL} = process.env

const redisClient = redis.createClient({ url: REDIS_URL})
const Proxy = new HTTPProxy(redisClient)

describe("HTTP Proxy: run e2e tests", function() {

    this.beforeAll(async () => {
        const keys: string[] = 'abcdefgh'.split('')
        for(let i = 0; i < keys.length; i++) {
            await set(keys[i], 'test'+i)
        }
        return new Promise((resolve, reject) => {
            Proxy.redis.set('test', 'test', (err: any, result: any) => {
                resolve()
            })
        })
    })

    it('GET "/" - it should get stats', async function () {
        const res = await request(Proxy.app).get('/')
        const {proxy, cache} = res.body
        expect(proxy.memoryUsage).toHaveProperty('rss')
        expect(cache.cpuUsage).toHaveProperty('user')
        return Promise.resolve()
    })

    it('GET "/GET/abcd" - it should return 404', async function(){
        const res = await request(Proxy.app).get('/GET/abcd')
        expect(res.status).toBe(404)
        return Promise.resolve()
    })

    it('GET "/GET/c" - it should return 200 with body.value="test2"', async function(){
        const res = await request(Proxy.app).get('/GET/c')
        expect(res.status).toBe(200)
        expect(res.body.value).toEqual("test2")
        return Promise.resolve()
    })

    it('GET "/GET/test" - it should update proxy cache from redis and return 200 with body.value="test"', async function(){
        const res = await request(Proxy.app).get('/GET/test')
        expect(res.status).toBe(200)
        expect(res.body.value).toEqual("test")
        return Promise.resolve()
    })

    it('it should verify that the proxy cache was updated', async function() {
        const verify = await get('test')
        expect(verify).toEqual("test")
        return Promise.resolve()
    })

    this.afterAll(() => {
        setTimeout(() => process.exit(), 1300)
    })

})