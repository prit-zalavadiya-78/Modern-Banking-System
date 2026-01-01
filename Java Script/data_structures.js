// DATA STRUCTURES (JS)

// Doubly linked list node
class ListNode {
    constructor(data) {
        this.data = data;
        this.next = null;
        this.prev = null;
    }
}

// Doubly linked list (for transaction history)
class DoublyLinkedList {
    constructor() {
        this.head = null;
        this.tail = null;
        this.size = 0;
    }

    addFirst(data) {
        const node = new ListNode(data);
        if (!this.head) {
            this.head = this.tail = node;
        } else {
            node.next = this.head;
            this.head.prev = node;
            this.head = node;
        }
        this.size++;
        return node;
    }

    addLast(data) {
        const node = new ListNode(data);
        if (!this.tail) {
            this.head = this.tail = node;
        } else {
            this.tail.next = node;
            node.prev = this.tail;
            this.tail = node;
        }
        this.size++;
        return node;
    }

    removeNode(node) {
        if (!node) return null;
        if (node.prev) node.prev.next = node.next;
        else this.head = node.next;
        if (node.next) node.next.prev = node.prev;
        else this.tail = node.prev;
        node.next = node.prev = null;
        this.size--;
        return node.data;
    }

    removeFirst() {
        if (!this.head) return null;
        const node = this.head;
        return this.removeNode(node);
    }

    toArray(limit = null) {
        let arr = [];
        let cur = this.head;
        let count = 0;
        while (cur && (limit === null || count < limit)) {
            arr.push(cur.data);
            cur = cur.next;
            count++;
        }
        return arr;
    }

    findNode(predicate) {
        let cur = this.head;
        while (cur) {
            if (predicate(cur.data)) return cur;
            cur = cur.next;
        }
        return null;
    }
}

// Simple binary max-heap Priority Queue (for loan requests)
class PriorityQueue {
    constructor() {
        this.heap = []; // elements: {item, priority}
    }
    size() { return this.heap.length; }
    enqueue(item, priority = 0) {
        this.heap.push({ item, priority });
        this._siftUp(this.heap.length - 1);
    }
    dequeue() {
        if (!this.size()) return null;
        const top = this.heap[0];
        const last = this.heap.pop();
        if (this.size()) {
            this.heap[0] = last;
            this._siftDown(0);
        }
        return top.item;
    }
    peek() {
        return this.size() ? this.heap[0].item : null;
    }
    toArray() { return this.heap.map(h => h.item); }
    _siftUp(idx) {
        while (idx > 0) {
            const parent = Math.floor((idx - 1) / 2);
            if (this.heap[parent].priority >= this.heap[idx].priority) break;
            [this.heap[parent], this.heap[idx]] = [this.heap[idx], this.heap[parent]];
            idx = parent;
        }
    }
    _siftDown(idx) {
        const n = this.heap.length;
        while (true) {
            let left = idx * 2 + 1;
            let right = left + 1;
            let largest = idx;
            if (left < n && this.heap[left].priority > this.heap[largest].priority) largest = left;
            if (right < n && this.heap[right].priority > this.heap[largest].priority) largest = right;
            if (largest === idx) break;
            [this.heap[largest], this.heap[idx]] = [this.heap[idx], this.heap[largest]];
            idx = largest;
        }
    }
}

// Simple FIFO queue (for support tickets)
class SimpleQueue {
    constructor() { this.data = []; this._nextId = 1; }
    enqueue(item) { item.id = this._nextId++; this.data.push(item); return item; }
    dequeue() { return this.data.shift() || null; }
    peek() { return this.data[0] || null; }
    size() { return this.data.length; }
    toArray() { return this.data.slice(); }
}