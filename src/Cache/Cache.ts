import CacheItem from './CacheItem'
import { EventEmitter } from 'events'
import Logger from '../Utils/Logger'

class TLRUCache extends EventEmitter {
    /**
     * 
     * Time aware Least Recently Used
     * This is a "Linked List" mapped by key (this.items)
     * 
     * We will swap items putting recently used in the head
     * When we need to delete an item we interlink its neigbours
     * and delete references so that the deleted item is garbage-collected
     * 
     * Compexity:
     *  - retrieval/insertion/deletion: O(1)
     *  - invalidation: O(n1)
     */

    capacity: number = Infinity
    rip: number = 0 // retained information period (miliseconds)

    head: CacheItem
    tail: CacheItem
    items: { [key: string]: CacheItem }

    constructor(capacity: number = Infinity, rip_seconds: number = 0) {
        super()
        Logger.debug('TLRUCache: initializing cache')
        
        this.items = {}
        this.capacity = capacity
        this.rip = rip_seconds * 1000
        
        // now we might need to syncronize the cache
        // among workers in the cluster.
        // In this case, I am against this approach,
        // since it would duplicate the same cache in the memory
        // I suggest to find a method to keep cache instance only inside
        // the master process, or decouple it from the proxy
        this.on('sync', (item: CacheItem) => {
            this.set(item.key, item.value)
            Logger.debug(`TLRUCache:on +sync -> ${item.key}`)
        })
    
    }

    get(key: string): string {
        Logger.debug(`TLRU Cache:get() +get -> ${key}`)
        const item: CacheItem = this.items[key]
        if (item) {
            this.swapHead(item)
            return item.value
        }
        return undefined
    }

    set(key: string, value: any) {
        Logger.debug(`TLRU Cache:set() +set -> ${key}`)
        let item: CacheItem = this.items[key]
        if (!item) {
            this.dispose()
            item = new CacheItem(key, value, this.rip)
            this.items[key] = item
            this.swapHead(item)
            return item.value
        }
    }

    validate() {
        /**
         * Clean expired items. This method should be somehow scheduled
         * we'll go in reverse order from least to the recent
         * also break the loop if current time < expiry time
         */
        Logger.debug(`TLRU Cache:validate() +purge expired`)
        process.nextTick(() => {
            const time: number = new Date().getTime()
            let item: CacheItem = this.tail
            while (item) {
                if (item.expiryTime <= time)
                    this.delete(item.key)
                else
                    break // next items determened to be valid
                item = item.prev
            }
            
        })
    }

    // take out an item from its position
    // and delete references to get it garbage-collected
    delete(key: string) {
        const item = this.items[key]
        Logger.debug(`TLRU Cache:delete() +delete -> ${key}`)
        if (item) {
            this.takeOut(item)
            if (this.tail === item) 
                this.tail = this.tail.prev
            if (this.head === item)
                this.head = this.head.next
            delete this.items[key]
        }
    }
    
    // take out an item from its  position
    // and interlink its neighbours
    takeOut(item: CacheItem) {
        const prev = item.prev
        const next = item.next
        if (prev) prev.next = next
        if (next) next.prev = prev
    }

    // put an item to the head
    swapHead(item: CacheItem) {

        if (!this.head)
            this.head = item

        const head = this.head
        if (item !== head) {
            
            this.takeOut(item)

            item.next = head
            head.prev = item
            this.head = item

            if (!this.tail) {
                this.tail = item.next
                this.tail.next = undefined
            }
            if (this.tail === this.head) 
                this.cutTail()

            this.head.prev = undefined
            this.tail.next = undefined
        }
        this.head.expiryTime = new Date().getTime() + this.rip
        return this.head.value
    }

    dispose() {
        // cut the tail if cache is over capacity
        if (this.length >= this.capacity) {
            do {
                const tail = this.cutTail()
                delete this.items[tail.key]
            } 
            while (this.length >= this.capacity)
        }
    }

    cutTail(){
        const tail = this.tail
        this.tail = tail.prev
        this.tail.next = undefined
        tail.prev = undefined
        return tail
    }

    //@ts-ignore
    get length(){
        return Object.keys(this.items).length
    }

    //@ts-ignore
    get keys() {
        return Object.keys(this.items)
    }
}

export default TLRUCache