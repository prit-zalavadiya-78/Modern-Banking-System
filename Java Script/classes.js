// OOP CLASSES

class User{
    constructor(email,password,name,accountNumber,balance)
    {
        this.name = name;
        this.accountNumber = accountNumber;
        this.balance = balance;
        this.email = email;
        this.password = password;
        this.transactions = [];
        this.loans = [];
        this.tickets = [];
        this.payees = [];
        this.cards = [];
    }
}    

class Admin{
    constructor(){
        this.users = []; 
        this.undoRequests = []; 
        this.loanRequests = []; 
        this.customerQueries = [];
    }
}

class Payee {
    constructor(name, accountNumber) {
        this.name = name;
        this.accountNumber = accountNumber;
    }
}

class Transaction {
    constructor(type, amount, balanceAfter, details = '') {
        this.date = new Date();
        this.type = type; // 'deposit', 'withdrawal', 'transfer-out', 'transfer-in'
        this.amount = amount;
        this.balanceAfter = balanceAfter;
        this.details = details; 
    }
}

class PaymentMethod {
    constructor(ownerName) {
        this.ownerName = ownerName;
    }

    getCardInfo() {
        return `PaymentMethod owned by ${this.ownerName}`;
    }
}

class Card extends PaymentMethod {
    constructor(accountHolder, cardNumber, expiryDate, cvv, transactionLimit) {
        super(accountHolder); 
        this.cardNumber = cardNumber || this._generateCardNumber();
        this.accountHolder = accountHolder;
        this.expiryDate = expiryDate || this._generateExpiryDate();
        this.cvv = cvv || this._generateCVV();
        this.transactionLimit = transactionLimit || 500;
        this.type = 'Card';
    }

    processPayment(amount) {
        if (amount <= this.transactionLimit) return true;
        return false;
    }

    getCardInfo() {
        return `${this.accountHolder}'s card • ${this.cardNumber} • EXP ${this.expiryDate}`;
    }

    _generateCardNumber = () => Array(4).fill(0).map(() => Math.floor(1000 + Math.random() * 9000)).join(' ');
    _generateCVV = () => Math.floor(100 + Math.random() * 900).toString();
    _generateExpiryDate() {
        const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
        const year = new Date().getFullYear() + 5;
        return `${month}/${String(year).slice(2)}`;
    }

    setTransactionLimit(newLimit) {
        if (newLimit > 0) {
            this.transactionLimit = newLimit;
            return true;
        }
        return false;
    }
}

class DebitCard extends Card {
    constructor(accountHolder, cardNumber = 0, expiryDate = 0, cvv = 0, transactionLimit = 0) {
        super(accountHolder, cardNumber, expiryDate, cvv, transactionLimit);
        this.type = 'Debit';
    }

    getCardInfo() {
        return `[Debit] ${super.getCardInfo()}`;
    }
}

class CreditCard extends Card {
    constructor(accountHolder, cardNumber = 0, expiryDate = 0, cvv = 0, transactionLimit = 0) {
        super(accountHolder, cardNumber, expiryDate, cvv, transactionLimit);
        this.type = 'Credit';
        this.transactionLimit = transactionLimit || 1000;
    }

    getCardInfo() {
        return `[Credit] ${super.getCardInfo()}`;
    }
}

class Account {
    // Private fields
    #accountNumber;
    #balance;
    #transactions;

    constructor(ownerName, accountNumber = null, balance = 1000, transactions = [], debitCard = null, creditCard = null) {
        this.#accountNumber = accountNumber || Math.floor(1000000000 + Math.random() * 9000000000);
        this.#balance = balance;

        this.#transactions = new DoublyLinkedList();
        transactions.forEach(element => {
            this.#transactions.addLast(element);
        });
        // console.log(debitCard);
        if(debitCard == null) this.debitCard = new DebitCard(ownerName);
        else this.debitCard = new DebitCard(ownerName, debitCard.cardNumber, debitCard.expiryDate, debitCard.cvv, debitCard.transactionLimit);
        if(creditCard == null) this.creditCard = new CreditCard(ownerName);
        else this.creditCard = new CreditCard(ownerName, creditCard.cardNumber, creditCard.expiryDate, creditCard.cvv, creditCard.transactionLimit);
    }

    get accountNumber() {
        return this.#accountNumber;
    }
    get balance() {
        return this.#balance;
    }
    set balance(val) {
        this.#balance = Number(val);
    }
    get transactions() {
        return this.#transactions;
    }

    deposit(amount, isTransfer = false, fromCustomerName = '', remark = '') {
        if (amount > 0) {
            this.#balance += amount;
            const type = isTransfer ? 'transfer-in' : 'deposit';
            let details = isTransfer ? `From ${fromCustomerName}` : ('Cash Deposit');
            if(remark) details = isTransfer ? `From ${fromCustomerName}` : ('Cash Deposit - ' + remark);
            const node = this.#transactions.addFirst(new Transaction(type, amount, this.#balance, details));
            return node;
        }
        return null;
    }
    
    withdraw(amount, isTransfer = false, toCustomerName = '', remark = '') {
        if (amount > 0 && amount <= this.#balance) {
            this.#balance -= amount;
            const type = isTransfer ? 'transfer-out' : 'withdrawal';
            let details = isTransfer ? `From ${toCustomerName}` : ('Cash Withdrawal');
            if(remark) details = isTransfer ? `From ${toCustomerName}` : ('Cash Withdrawal - ' + remark);
            const node = this.#transactions.addFirst(new Transaction(type, amount, this.#balance, details));
            return node;
        }
        return null;
    }

    attemptCharge(paymentMethod, amount) {
        if (!paymentMethod || typeof paymentMethod.processPayment !== 'function') {
            throw new Error('Invalid payment method');
        }
        return paymentMethod.processPayment(amount);
    }
}

class Customer {
    #password;
    #account;
    #payees;
    #undoStack;
    #tickets;
    #loans;

    constructor(name, email, password, accountNumber = null, balance, payees=[], undoStack=[], tickets=[], transactions = [], loans = [], debitCard = null, creditCard = null) {
        this.name = name;
        this.email = email;
        this.#password = password;
        this.#account = new Account(name, accountNumber, balance, transactions, debitCard, creditCard);
        this.#payees = payees;
        this.#undoStack = undoStack;
        this.#tickets = tickets;
        this.#loans = loans;
    }

    get password() {
        return this.#password;
    }
    get account() {
        return this.#account;
    }
    get payees() {
        return this.#payees;
    }
    get tickets() {
        return this.#tickets;
    }
    get loans() {
        return this.#loans;
    }
    get undoStack() {
        return this.#undoStack;
    }

    addPayee(payee) {
        
        if(parseInt(payee) == this.#account.accountNumber) return false;
        if (!this.#payees.some(p => p.accountNumber === payee.accountNumber)) {
            this.#payees.push(payee);
            return true;
        }
        return false;
    }

    undoLast() {
        if (!this.#undoStack || this.#undoStack.length === 0) {
            return { success: false, message: 'Nothing to undo.' };
        }
        const action = this.#undoStack.pop();
        const acc = this.account;

        const isLatest = acc.transactions.head && acc.transactions.head === action.txNode;

        if (!isLatest) {
            return { success: false, message: 'Cannot undo because newer transactions exist.' };
        }

        if (action.type === 'deposit') {
            acc.transactions.removeNode(action.txNode);
            acc.balance -= action.amount;
            return { success: true, message: `Deposit of $${action.amount.toFixed(2)} undone.` };
        }

        if (action.type === 'withdrawal') {
            acc.transactions.removeNode(action.txNode);
            acc.balance += action.amount;
            return { success: true, message: `Withdrawal of $${action.amount.toFixed(2)} undone.` };
        }

        if (action.type === 'transfer-out') {
            const recipient = bank.findCustomerByAccountNumber(action.recipientAccNumber);
            if (!recipient) return { success: false, message: 'Recipient account not found.' };

            const recHead = recipient.account.transactions.head;
            const recMatch = recHead && recHead.data.type === 'transfer-in' && recHead.data.amount === action.amount && recHead.data.details && recHead.data.details.includes(this.name);

            if (!recMatch) return { success: false, message: 'Cannot undo transfer: recipient has newer transactions.' };

            if (recipient.account.balance < action.amount) return { success: false, message: 'Cannot undo transfer: recipient has insufficient funds.' };

            acc.transactions.removeNode(action.txNode);
            acc.balance += action.amount;

            recipient.account.transactions.removeNode(recHead);
            recipient.account.balance -= action.amount;

            return { success: true, message: `Transfer of $${action.amount.toFixed(2)} reversed.` };
        }

        return { success: false, message: 'Unknown action type.' };
    }
}

class Bank {
    customers;
    #loanRequests;
    #supportQueue;

    constructor(users = [], loanRequests = [], customerQueries = []) {
        this.customers = users;
        this.#loanRequests = new PriorityQueue();
        loanRequests.forEach(element => {
            this.#loanRequests.enqueue(element);
        });
        this.#supportQueue = new SimpleQueue();
        customerQueries.forEach(element => {
            this.#supportQueue.enqueue({ customerEmail: element.customerEmail, customerName: element.customerName, message:element.message, createdAt: element.createdAt, status: element.status});
        });
    }

    get customers() {
        return this.customers;
    }
    get loanRequests() {
        return this.#loanRequests;
    }
    get supportQueue() {
        return this.#supportQueue;
    }

    findCustomerByAccountNumber(accountNumber) {
        let isThere = false;
        this.customers.forEach(element => {
            if (element.accountNumber == accountNumber) {
                isThere = localStorage.getItem(element.email + '_');
                isThere = JSON.parse(isThere);
            }
        });
        return isThere;
    }

    transferMoney(senderCustomer, payeeAccountNumber, amount) {
        let recipientCustomer = this.findCustomerByAccountNumber(parseInt(payeeAccountNumber));
        if (!recipientCustomer) {
            return { success: false, message: 'Recipient account not found.' };
        }

        recipientCustomer = new Customer(recipientCustomer.name, recipientCustomer.email, recipientCustomer.password, recipientCustomer.accountNumber, recipientCustomer.balance, recipientCustomer.payees, recipientCustomer.undoQueries, recipientCustomer.tickets, recipientCustomer.transactions, recipientCustomer.loans);
        if (senderCustomer.account.accountNumber === recipientCustomer.account.accountNumber) {
            return { success: false, message: 'Cannot transfer to your own account.' };
        }
        
        const senderNode = senderCustomer.account.withdraw(amount, true, recipientCustomer.name);
        if (!senderNode) return { success: false, message: 'Insufficient funds.' };
        
        const recipientNode = recipientCustomer.account.deposit(amount, true, senderCustomer.name);
        
        senderCustomer.undoStack.push({ type: 'transfer-out', amount, txNode: senderNode, recipientAccNumber: recipientCustomer.account.accountNumber });
        updateUserData(JSON.parse(localStorage.getItem(recipientCustomer.email+'_')), recipientCustomer);
        return { success: true, message: `Successfully transferred $${amount.toFixed(2)}.` };
    }
    
    applyLoan(customer, amount, priority = 1, note = '') {
        const req = { applicantEmail: customer.email, applicantName: customer.name, amount, note, date: new Date(), status: 'pending' };
        this.#loanRequests.enqueue(req, priority);
        customer.loans.push({req, priority});
        return req;
    }
    
    processLoan(email, date) {
        let cust = this.findCustomerByAccountNumber(parseInt(JSON.parse(localStorage.getItem(email+'_')).accountNumber));
        cust = new Customer(recipientCustomer.name, recipientCustomer.email, recipientCustomer.password, recipientCustomer.accountNumber, recipientCustomer.balance, recipientCustomer.payees, recipientCustomer.undoQueries, recipientCustomer.tickets, recipientCustomer.transactions, recipientCustomer.loans);
        let loan = cust.loanRequests.find(
            loan => !(loan.req.date === date)   
        );
        loan.req.status = 'approved';
        const node = cust.account.deposit(req.amount, false, '', `Loan approved`);
        if (node) {
            updateUserData(JSON.parse(localStorage.getItem(email+'_')), cust);
            // cust.undoStack.push({ type: 'deposit', amount: req.amount, txNode: node });
        }
        // return { req, approvedFor: cust.email };
    }

    // support queue handling
    submitTicket(customer, message) {
        const ticket = { customerEmail: customer.email, customerName: customer.name, message, createdAt: new Date(), status: 'pending' };
        this.#supportQueue.enqueue(ticket);
        customer.tickets.push(ticket);
        return ticket;
    }

    processNextTicket() {
        const ticket = this.#supportQueue.dequeue();
        if (!ticket) return null;
        ticket.status = 'resolved';
        ticket.resolvedAt = new Date();
        return ticket;
    }
}

function updateUserData(u = user, cU = currentUser){
    if(u==null) return;
    u.balance = cU.account.balance;
    u.transactions = cU.account.transactions.toArray();
    u.undoQueries = cU.undoStack;
    u.loans = cU.loans;
    u.tickets = cU.tickets;
    u.payees = cU.payees;
    // console.log(user.balance);
    const seen = new Set();
    localStorage.setItem(u.email+'_', JSON.stringify(u, (key, value) => {
            if (typeof value === 'object' && value !== null) {
                if (seen.has(value)) {
                return '[Circular]'; // Replace circular reference with a string placeholder
                }
                seen.add(value);
            }
            return value;
        }));
}