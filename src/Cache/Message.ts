
export enum MessageType {
    GET = 'get',
    SET = 'set',
    STATS = 'stats'
}

export interface RequestMessage {
    id: string
    type: MessageType,
    data: any 
}

export interface ResponseMessage {
    id: string
    data: any
    isResponse: boolean
}