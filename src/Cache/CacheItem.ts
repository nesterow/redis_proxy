
export default class CacheItem {
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