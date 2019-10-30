/* 
    A Doubly Linked List
    This implemetation resembles some of the methods from the JavaScript Array
    Later I'm going to distribute it as a separate module
*/

export class Node {
    prev: Node
    next: Node
    value: unknown
    constructor(value: any = null) {
        this.value = value
    }
}


export default class LinkedList {

    tail: Node | any = null
    head: Node | any = null

    private _isCircular: boolean = false
    private _length: number = 0
    

    constructor(circular: boolean = false) {
        this._isCircular = circular
    }
    
    //@ts-ignore
    get length() {
        return this._length
    }

    //@ts-ignore
    get isCircular() {
        return this._isCircular
    }

    pop(): Node {
        const tail = this.tail
        this.tail = this.tail.prev
        this.connect(this.tail)
        this._length -= 1
        return this.unlink(tail)
    }

    shift(): Node {
        const head = this.head
        this.head = this.head.next
        this.connect(this.head)
        this._length -= 1
        return this.unlink(head)
    }

    push(node: Node) {
        this.connect(node)
        const prev = this.tail
        if (prev) {
            node.prev = prev
            prev.next = node
        }
        this.tail = node
        this._length += 1
    }

    unshift(node: Node) {
        this.connect(node)
        const next = this.head
        if (next) {
            node.next = next
            next.prev = node
        }
        this.head = node
        this._length += 1
    }

    delete(node: Node) {
        const prev = node.prev
        const next = node.next
        if (prev) prev.next = next
        if (next) next.prev = prev
        if (node === this.tail)
            this.tail = node.prev
        if (node === this.head)
            this.head = this.head.next
        if (this._length > 0)
            this._length -= 1
        return this.unlink(node)
    }

    swap(node1: Node, node2: Node) {
        
        let {head, tail} = this

        const [N1L, N2L] = [node1.prev, node2.prev] //left neighbours
        const [N1R, N2R] = [node1.next, node2.next] //right neighbours

        const N1 = this.delete(node1)
        const N2 = this.delete(node2)

        // link neighboring to the swapped nodes
        if(N1L) N1L.next = N2
        if(N1R) N1R.prev = N2
        if(N2L) N2L.next = N1
        if(N2R) N2R.prev = N1

        // we need to check if the nodes were neighbours
        N1.prev = N1 === N2L ? N2 : N2L 
        N1.next = N1 === N2R ? N2 : N2R
        N2.prev = N2 === N1L ? N1 : N1L 
        N2.next = N2 === N1R ? N1 : N1R

        //check if we swap nodes with head or tail
        if (node1 === head) this.head = N2
        if (node1 === tail) this.tail = N2
        if (node2 === head) this.head = N1
        if (node2 === tail) this.tail = N1
    }

    unlink(node: Node) {
        node.prev = undefined
        node.next = undefined
        return node
    }
    

    private connect(node: Node = undefined) {
        if (!this.head && node) {
            this.head = node
        }
        if (!this.tail && node) {
            this.tail = node
        }
        if (this._isCircular) {
            this.head.prev = this.tail
            this.tail.next = this.head
        } else {
            this.head.prev = undefined
            this.tail.next = undefined
        }
    }

}