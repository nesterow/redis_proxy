import { EventEmitter } from 'events'
import Logger from '../Utils/Logger'

import LinkedList from './LinkedList'

class CacheItem {
    /**
     * CacheItem
     * Keeps expiry time for a cache item
     */

    next: CacheItem | undefined
    prev: CacheItem | undefined

    key: string
    value: string
    expiryTime: number

    constructor(key: string, value: string, rip_miliseconds: number|undefined = 0){
        this.key = key
        this.value = value
        this.expiryTime = new Date().getTime() + rip_miliseconds
    }
}

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

    cache: LinkedList
    items: { [key: string]: CacheItem }

    constructor(capacity: number = Infinity, rip_seconds: number = 0) {
        super()
        Logger.debug('TLRUCache: initializing cache')
        
        this.cache = new LinkedList()
        this.items = {}
        this.capacity = capacity
        this.rip = rip_seconds * 1000
        
        // now we might need to syncronize the cache
        // among workers in the cluster.
        // In this case, I am against this approach,
        // since it would duplicate the same cache in the memory
        // I suggest to find a method to keep cache instance only inside
        // the master process, or decouple it from the proxy
        this.on('sync_workers', (item: CacheItem) => {
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
        if (!value) return;
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
            let item: CacheItem = this.cache.tail
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
            this.cache.delete(item)
            delete this.items[key]
        }
    }


    // put an item to the head
    swapHead(item: CacheItem) {
        const node = this.cache.delete(item)
        this.cache.unshift(node)
        this.cache.head.expiryTime = new Date().getTime() + this.rip
        return this.cache.head.value
    }

    dispose() {
        // cut the tail if cache is over capacity
        if (this.length >= this.capacity) {
            do {
                const tail = this.cache.pop() as CacheItem
                delete this.items[tail.key]
            } 
            while (this.length >= this.capacity)
        }
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