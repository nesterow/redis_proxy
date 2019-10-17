import * as expect from 'expect';
import {get, set} from './Worker'

describe('CacheWorker: test core operations on decoupled cache', function(){

    it('it should add entities to the cache', async function(){
        const keys: string[] = 'abcdefghigklmopqrstuv'.split('');
        for(let i = 0; i<keys.length; i++) {
            await set(keys[i], 'test' + i)
        }
        const valueA = await get('a')
        const valueB = await get('b')
        expect(valueA).toEqual('test0')
        expect(valueB).toEqual('test1')
        return Promise.resolve()
    })
    
    this.afterAll(() => {
        setTimeout(() => process.exit())
    })
})
