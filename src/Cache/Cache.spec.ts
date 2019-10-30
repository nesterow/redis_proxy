import * as expect from 'expect';
import TLRUCache from './Cache'


describe("TLRUCache: Test cache core functionality:", () => {


    it('it should set a new cache item', () => {
        const instance = new TLRUCache(5, 60)
        instance.set('test', 'test')
        expect(instance.get('test')).toEqual('test')
        expect(instance.length).toBe(1)
    })

    it('it should delete an item given "length == 1"', () => {
        const instance = new TLRUCache(5, 60)
        instance.set('test', 'test')
        expect(instance.length).toBe(1)
        instance.delete('test')
        expect(instance.length).toBe(0)
    })

    it('it should fit capacity by deleting LRU item', () => {
        
        const sample = ['1', '2', '3', '4', '5', '6']
        const instance = new TLRUCache(5, 60)
        expect(instance.length).toBe(0)

        sample.map((key) => {
            instance.set(key, 'test')
        })

        expect(instance.cache.head.key).toEqual('6')
        expect(instance.cache.tail.key).toEqual('2')

    })

    it('it should place last used item on the first position', () => {
        const sample = ['1', '2', '3', '4', '5', '6']
        const instance = new TLRUCache(5, 60)
        sample.map((key) => {
            instance.set(key, 'test')
        })
        expect(instance.length).toBe(5)
        
        instance.get('2') // ->> [2, 6, 5, 4, 3]
        expect(instance.cache.head.key).toEqual('2')
        expect(instance.cache.head.next.key).toEqual('6')
        expect(instance.cache.tail.key).toEqual('3')

        instance.get('5') // ->> [5, 2, 6, 4, 3]
        expect(instance.cache.head.key).toEqual('5')
        expect(instance.cache.head.next.key).toEqual('2')
        expect(instance.cache.head.next.next.key).toEqual('6')
        expect(instance.cache.tail.key).toEqual('3')
        expect(instance.cache.tail.prev.key).toEqual('4')
        expect(instance.cache.tail.prev.prev.key).toEqual('6')

    })

    it("it should delete items properly", () => {

        const sample = ['5', '2', '6', '4', '3'].reverse()
        const instance = new TLRUCache(5, 60)
        sample.map((key) => {
            instance.set(key, 'test')
        })
        expect(instance.length).toBe(5)

        //[5, 2, 6, 4, 3]
        expect(instance.cache.head.key).toEqual('5')
        
        instance.delete('3') // => [5, 2, 6, 4]
        expect(instance.length).toBe(4)
        expect(instance.cache.tail.key).toEqual('4')

        instance.delete('2') // => [5, 6, 4]
        expect(instance.length).toBe(3)
        expect(instance.cache.head.key).toEqual('5')
        expect(instance.cache.head.next.key).toEqual('6')
        expect(instance.cache.head.next.next.key).toEqual('4')

        instance.delete('5') // => [6, 4]
        expect(instance.length).toBe(2)
        expect(instance.cache.head.key).toEqual('6')
        expect(instance.cache.tail.key).toEqual('4')

        instance.delete('4') // => [6]
        expect(instance.length).toBe(1)
        expect(instance.cache.head.key).toEqual('6')
        expect(instance.cache.tail.key).toEqual('6')

        instance.delete('6') // => []
        expect(instance.length).toBe(0)


        instance.set('6', 'test')
        instance.set('4', 'test') // => [4, 6]
        expect(instance.length).toBe(2)
        expect(instance.cache.head.key).toEqual('4')
        expect(instance.cache.head.next.key).toEqual('6')
        expect(instance.cache.tail.prev.key).toEqual('4')
        expect(instance.cache.tail.key).toEqual('6')
    
    })

})


describe("TLRUCache: Test cache validation by expiration time", function () {
   

    it('[7 sec] : it should purge items except "5" and "3" afer 5 seconds',  function (done) {
         // capacity = 5, expiry = 5 sec
    
        this.timeout(7000)

        const instance: TLRUCache = new TLRUCache(5, 5)
        const sample: string[] = ['1','2','3','4','5','6']
        expect(instance.length).toBe(0)
        sample.map((key) => {
            instance.set(key, 'test')
        })
        expect(instance.length).toBe(5)

        const purgeInterval = setInterval(() => instance.validate(), 100)
        
        const hitInterval = setInterval(()=>{
            instance.get('5')
            instance.get('3')
        }, 500)

        setTimeout(() => {
            clearInterval(purgeInterval)
            clearInterval(hitInterval)
            expect(instance.length).toBe(2)
            expect(instance.keys).toContain("3")
            expect(instance.keys).toContain("5")
            done()
        }, 6000)

    })
})
