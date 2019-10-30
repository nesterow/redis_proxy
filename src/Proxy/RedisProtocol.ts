/**
 * Here we would specify a subset of redis protocol
 */

//@ts-ignore
import * as Parser from 'redis-parser'
//@ts-ignore
import * as Resp from 'respjs'


    
export function decodeRequest(...buffers : Buffer[]){
    const result: any[] = [];
    new Parser({
        returnReply(reply:any) { 
            result.push(reply) 
        },
        returnError(err:Error) { 
            result.push({error: 1, message: err.message})
        },
    }).execute(Buffer.concat(buffers));
    return result
}

export function encodeRequest(cmds: any[]) {
    const buffers: any[] = cmds.map((r: any[]) => Resp.encodeRequest(r))
    return Buffer.concat(buffers)
}

export function encodeResponse(resBatch: any[]) {
    const enc = (val: any): any => {

        if (val === null)
            return Resp.encodeNull()

        if (val === 'OK')
            // I don't see more cases
            return Resp.encodeString(val)

        if (typeof val === 'string')
            return Resp.encodeBulk(val)

        if (typeof val === 'number')
            return Resp.encodeInteger(val)

        if (typeof val === 'object' && val.error)
            return Buffer.from("-" + val.message + "\r\n")

        if (Array.isArray(val) && !val.length)
            return Resp.encodeNullArray()

        if (Array.isArray(val))
            return Resp.encodeArray(val.map(enc))
    }
    const res: any[] = resBatch.map(enc)
    return res.join('')
}

/**
 * Convenience method
 * Associate commands with return values, 2D
 * [ [command[], value],
 *  [command[], value]  ]
 * 
 */
export function associate(request: Buffer, response: Buffer) {
    const result: any[] = decodeRequest(request, response)
    const associate: Array<any[]> = []
    for (let i = 0; i < result.length / 2; i++) {
        associate.push([ result[i], result[i + result.length / 2] ])
    }
    return associate
}


export function isCacheable(cmd: any[]) {
    switch (cmd[0]) {
        case 'get':
            return true
    }
    return false
}

