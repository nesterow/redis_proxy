/**
 * Here we would specify a subset of redis protocol
 */

//@ts-ignore
import * as Parser from 'redis-parser'

export default class Protocol {
    
    static parse(...buffers : Buffer[]){
        const result: any[] = [];
        new Parser({
            returnReply(reply:any) { result.push(reply) },
            returnError(err:any) { console.log(err) },
            returnFatalError(err:any) { console.log(err) }
        }).execute(Buffer.concat(buffers));
        return result
    }

    /**
     * Associate commands with return values, 2D
     * [ [command[], value],
     *  [command[], value]  ]
     * 
     */
    static associate(request: Buffer, response: Buffer) {
        const result: any[] = Protocol.parse(request, response)
        const associate: Array<any[]> = []
        for (let i = 0; i < result.length / 2; i++) {
            associate.push([ result[i], result[i + result.length / 2] ])
        }
        return associate
    }

    static handle(request: Buffer){
        const commands: any[] = Protocol.parse(request)
    }

}