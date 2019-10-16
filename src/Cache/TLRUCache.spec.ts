import * as expect from 'expect';
import TLRUCache from './TLRUCache'

describe("TLRUCache: Test cache core functionality:", () => {

    // capacity = 5
    const cache: TLRUCache = new TLRUCache(5, 60)
    const sample: string[] = ['1','2','3','4','5','6']

    it('it should set a new cache item', () => {
        cache.set('test', 'test')
        expect(cache.get('test')).toEqual('test')
        expect(cache.length).toBe(1)
    })

    it('it should delete an item given "length == 1"', () => {
        expect(cache.length).toBe(1)
        cache.delete('test')
        expect(cache.length).toBe(0)
    })

    it('it should fit capacity by deleting LRU item', () => {
        expect(cache.length).toBe(0)

        sample.map((key) => {
            cache.set(key, 'test')
        })

        expect(cache.head.key).toEqual('6')
        expect(cache.tail.key).toEqual('2')

    })

    it('it should place last used item on the first position', () => {
        expect(cache.length).toBe(5)
        
        cache.get('2') // ->> [2, 6, 5, 4, 3]
        expect(cache.head.key).toEqual('2')
        expect(cache.head.next.key).toEqual('6')
        expect(cache.tail.key).toEqual('3')

        cache.get('5') // ->> [5, 2, 6, 4, 3]
        expect(cache.head.key).toEqual('5')
        expect(cache.head.next.key).toEqual('2')
        expect(cache.head.next.next.key).toEqual('6')
        expect(cache.tail.key).toEqual('3')
        expect(cache.tail.prev.key).toEqual('4')
        expect(cache.tail.prev.prev.key).toEqual('6')

    })

    it("it should delete items properly", () => {
        //[5, 2, 6, 4, 3]
        expect(cache.head.key).toEqual('5')
        
        cache.delete('3') // => [5, 2, 6, 4]
        expect(cache.length).toBe(4)
        expect(cache.tail.key).toEqual('4')

        cache.delete('2') // => [5, 6, 4]
        expect(cache.length).toBe(3)
        expect(cache.head.key).toEqual('5')
        expect(cache.head.next.key).toEqual('6')
        expect(cache.head.next.next.key).toEqual('4')

        cache.delete('5') // => [6, 4]
        expect(cache.length).toBe(2)
        expect(cache.head.key).toEqual('6')
        expect(cache.tail.key).toEqual('4')

        cache.delete('4') // => [6]
        expect(cache.length).toBe(1)
        expect(cache.head.key).toEqual('6')
        expect(cache.tail.key).toEqual('6')

        cache.delete('6') // => []
        expect(cache.length).toBe(0)


        cache.set('6', 'test')
        cache.set('4', 'test') // => [4, 6]
        expect(cache.length).toBe(2)
        expect(cache.head.key).toEqual('4')
        expect(cache.head.next.key).toEqual('6')
        expect(cache.tail.prev.key).toEqual('4')
        expect(cache.tail.key).toEqual('6')
    
    })

})

describe("TLRUCache: Test cache validation by expiration time", function () {
    // capacity = 5, expiry = 5 sec
    const cache: TLRUCache = new TLRUCache(5, 5)
    const sample: string[] = ['1','2','3','4','5','6']

    it('it should add items to cache', () => {
        expect(cache.length).toBe(0)
        sample.map((key) => {
            cache.set(key, 'test')
        })
        expect(cache.length).toBe(5)
    })

    it('[7 sec] : it should purge items except "5" and "3" afer 5 seconds',  function (done) {
        this.timeout(7000)

        const purgeInterval = setInterval(() => cache.validate(), 100)
        
        const hitInterval = setInterval(()=>{
            cache.get('5')
            cache.get('3')
        }, 500)

        setTimeout(() => {
            clearInterval(purgeInterval)
            clearInterval(hitInterval)
            expect(cache.length).toBe(2)
            expect(cache.keys).toContain("3")
            expect(cache.keys).toContain("5")
            done()
        }, 6000)

    })

})