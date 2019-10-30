import * as expect from 'expect'
import LinkedList, {Node} from './LinkedList'


describe('Linked List:', function() {

    const sample = (length: number = 0): LinkedList => {
        const ll: LinkedList = new LinkedList()
        for(let i = 0; i < length; i++) {
            ll.push(new Node(i))
        }
        return ll
    }

    it('#push on empty list', () => {
        const list = sample()
        const node1 = new Node(1)
        const node2 = new Node(2)
        
        list.push(node1)
        expect(list.length).toBe(1)
        expect(list.tail).toEqual(node1)
        expect(list.head).toEqual(node1)

        list.push(node2)
        expect(list.head).toEqual(node1)
        expect(list.tail).toEqual(node2)
        expect(list.tail.prev).toEqual(node1)
        expect(list.head.next).toEqual(node2)
        
    })

    it('#push on non-empty list', () => {
        const list = sample(5)
        expect(list.head.value).toBe(0)
        expect(list.tail.value).toBe(4)
        
        const node5 = new Node(5)
        list.push(node5)
        expect(list.tail).toEqual(node5)
        expect(list.tail.prev.value).toBe(4)
        expect(list.head.value).toBe(0)
        expect(list.length).toBe(6)

    })

    it('#unshift on empty list', () => {
        const list = sample()
        const node1 = new Node(1)
        const node2 = new Node(2)
        
        list.unshift(node1)
        expect(list.length).toBe(1)
        expect(list.tail).toEqual(node1)
        expect(list.head).toEqual(node1)

        list.unshift(node2)
        expect(list.head).toEqual(node2)
        expect(list.tail).toEqual(node1)
        expect(list.tail.prev).toEqual(node2)
        expect(list.head.next).toEqual(node1)
    })

    it('#unshift on non-empty list', () => {
        const list = sample(5)
        expect(list.head.value).toBe(0)
        expect(list.tail.value).toBe(4)
        
        const node5 = new Node(5)
        list.unshift(node5)
        expect(list.head).toEqual(node5)
        expect(list.head.next.value).toBe(0)
        expect(list.tail.value).toBe(4)
        expect(list.length).toBe(6)

    })

    it('#pop the list', () => {
        const list = sample(5)
        const node = list.pop()
        expect(node.value).toBe(4)
        expect(list.tail.next).toBe(undefined)
        expect(list.length).toBe(4)
    })

    it('#shift the list', () => {
        const list = sample(5)
        const node = list.shift()
        expect(node.value).toBe(0)
        expect(list.head.prev).toBe(undefined)
        expect(list.length).toBe(4)
    })

    it('#delete an arbitrary node', () => {
        const list = sample(5)
        const node = list.head.next.next //2
        expect(node.value).toBe(2)
        list.delete(node)
        expect(list.length).toBe(4)
        expect(list.head.next.value).toBe(1)
        expect(list.head.next.next.value).toBe(3)
    })

    it('#delete a node from tail', () => {
        const list = sample(5)
        const deleted = list.delete(list.tail)
        expect(deleted.value).toBe(4)
        expect(list.length).toBe(4)
        expect(list.tail.next).toBe(undefined)
        expect(list.tail.value).toBe(3)
    })

    it('#delete a node from head', () => {
        const list = sample(5)
        const deleted = list.delete(list.head)
        expect(deleted.value).toBe(0)
        expect(list.length).toBe(4)
        expect(list.head.prev).toBe(undefined)
        expect(list.head.value).toBe(1)
    })

    it('#swap arbitrary items', () => {
        const list = sample(5)
        const node1 = list.tail.prev
        const node2 = list.head.next
        expect(node1.value).toBe(3)
        expect(node2.value).toBe(1)
        
        list.swap(node1, node2)
        expect(list.tail.prev.value).toBe(1)
        expect(list.tail.prev.prev.next.value).toBe(1)
        expect(list.head.next.value).toBe(3)
        
    })

    it('#swap neighbours', () => {
        const list = sample(5)
        const node1 = list.head.next
        const node2 = list.head.next.next
        expect(node1.value).toBe(1)
        expect(node2.value).toBe(2)
        
        list.swap(node1, node2)
        expect(list.head.next.value).toBe(2)
        expect(list.head.next.next.value).toBe(1)
        
    })

    it('#swap head and tail', () => {
        const list = sample(5)
        list.swap(list.tail, list.head)
        expect(list.tail.value).toBe(0)
        expect(list.head.value).toBe(4)
        expect(list.head.prev).toBe(undefined)
        expect(list.head.next.value).toBe(1)
        expect(list.tail.next).toBe(undefined)
        expect(list.tail.prev.value).toBe(3)
    })

    it('#swap head and an arbitrary node', () => {
        const list = sample(5)
        const node = list.head.next
        expect(node.value).toBe(1)
        list.swap(node, list.head)
        expect(list.head.value).toBe(1)
        expect(list.head.next.value).toBe(0)
    })

    it('#swap tail and an arbitrary node', () => {
        const list = sample(5)
        const node = list.tail.prev
        expect(node.value).toBe(3)
        list.swap(list.tail, node)
        expect(list.tail.value).toBe(3)
        expect(list.tail.prev.value).toBe(4)
    })


})