## Redis Proxy
HTTP Proxy and caching layer for Redis `GET` command written in TypeScript

### Usage
```bash
make test   # run unit and e2e tests
make start  # start service in docker containers
make stop   # stop service
```

### Requirements
- Linux or MacOS
- Docker, docker-compose
- Make, Bash

### Configuration
```
REDIS_URL=redis://127.0.0.1:6379/1 # redis instance
LOG_LEVEL=debug                    # log level
HTTP_PROXY_PORT=8080               # TCP port for the HTTP Proxy
TCP_PROXY_PORT=7070                # Redis protocol proxy port
PROXY_CACHE_EXPIRY=3600            # cache expiry time in seconds
PROXY_CACHE_CAPACITY=1024          # cache capacity as number of entries
```

### Rest API
- `GET /` - returns usage information for the cache instance and http proxy
- `GET /GET/{key}` - returns value associated with the key or 404 if value  dosn't exist on either cache or redis instance


### Architecture
The proxy service conists of two key components: **Cache** and **Proxy**

##### Cache
- The cache implements TLRU replacement policy. 
- Invalidation operations are scheduled in periods of cache expiration time `PROXY_CACHE_EXPIRY`
- The cache is decoupled from the main thread using Node.JS IPC to avoid bloking Event Loop.
- The cache is implemented as a [Doubly Linked List](https://en.wikipedia.org/wiki/Doubly_linked_list). It provides cheap replacement operations [O(1)].

#### Proxy
- Proxy communicates with the cache and a redis instance. The Proxy runs within a single node.js instance, but it is possible to run it in cluster mode if decouple the cache instance in separate service.
- HTTP Proxy uses Express.js. Further improvement would be to use another web framework, but it depends on particular situation.
- TCP Proxy works as follows: (1) It decomposes request batches. (2) Then it retrieves cached values (3) After that, it constructs response batch adding to the cache new values. The cache is shared with HTTP Proxy

### Complexity
- For cache operations like retrieval, insertion and deletion - `O(1)`
- For cache invalidation the complicity is `O(n1)`, this is additional operation scheduled in periods of cache expiration time
- For https proxy, worst case would be retrieval operation from redis when the entity is stored on disk - `O(1+n1)`

### Additional Notes
1. Time spent:
    - I started this task 4 days ago and I could spare at most 3 hours per day.
    - About 30% of time was spent searching/reading documentation. 
    - ~20% I was implementing the Cache module
    - ~40% I was implementing Redis protocol proxy
    - ~10% of time was spent on configuration
2. Possible Improvements:
    - It is possible to run it in cluster mode. To achieve that we need to run the cache in a separate process, for example using PM2.
    - Benchmarks & Tests.

### TODO:
- [X] TLRU Cache
- [X] HTTP Proxy
- [X] Proxy Stats
- [X] Documentation
- [X] Bonus: redis protocol proxy
- [ ] Bonus: cluster mode 

