document.addEventListener('DOMContentLoaded', () => {
    // APPLICATION STATE & SETUP
    let user = sessionStorage.getItem('user');
    if(!user) window.location.href = 'login.html';
    user = JSON.parse(localStorage.getItem(user)); 
    if(!user) window.location.href = 'login.html';
    let admin = localStorage.getItem('admin');
    admin = JSON.parse(admin); 
    let bank = new Bank(admin.users, admin.loanRequests, admin.customerQueries);
    let currentUser = new Customer(user.name, user.email, user.password, user.accountNumber, user.balance, user.payees, user.undoQueries, user.tickets, user.transactions, user.loans, user.cards[0], user.cards[1]);

    // Deposit & Withdraw
    const logoutBtn = document.getElementById('logout-btn');
    const welcomeMessage = document.getElementById('welcome-message');
    const dashboardBalance = document.getElementById('dashboard-balance');
    const dashboardAccountNumber = document.getElementById('dashboard-account-number');
    const depositAmountInput = document.getElementById('deposit-amount');
    const depositRemarkInput = document.getElementById('deposit-remark');
    const depositBtn = document.getElementById('deposit-btn');
    const withdrawAmountInput = document.getElementById('withdraw-amount');
    const withdrawRemarkInput = document.getElementById('withdraw-remark');
    const withdrawBtn = document.getElementById('withdraw-btn');
    const transactionMessage = document.getElementById('transaction-message');
    const transactionHistoryContainer = document.getElementById('transaction-history');
    // Payees & Transfers
    const payeeNameInput = document.getElementById('payee-name');
    const payeeAccountNumberInput = document.getElementById('payee-account-number');
    const addPayeeBtn = document.getElementById('add-payee-btn');
    const payeeMessage = document.getElementById('payee-message');
    const payeeSelect = document.getElementById('payee-select');
    const transferAmountInput = document.getElementById('transfer-amount');
    const transferBtn = document.getElementById('transfer-btn');
    const transferMessage = document.getElementById('transfer-message');
    // Card Management
    const debitCardDetailsContainer = document.getElementById('debit-card-details');
    const creditCardDetailsContainer = document.getElementById('credit-card-details');
    const cardSelect = document.getElementById('card-select');
    const newLimitInput = document.getElementById('new-limit-amount');
    const updateLimitBtn = document.getElementById('update-limit-btn');
    const limitMessage = document.getElementById('limit-message');

    let loanCardContainer, supportCardContainer;

    function updateUserData(u = user, cU = currentUser){
        if(u==null) return;
        u.balance = cU.account.balance;
        u.transactions = cU.account.transactions.toArray();
        u.undoQueries = cU.undoStack;
        u.loans = cU.loans;
        u.tickets = cU.tickets;
        u.payees = cU.payees;
        u.cards[0] = (cU.account.debitCard);
        u.cards[1] = (cU.account.creditCard);
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
    
    function updateAdminData(){
        if(admin==null) return;
        admin.customerQueries = bank.supportQueue.toArray();
        admin.loanRequests = bank.loanRequests.toArray();
        admin.undoRequests = bank.undoRequests;
        const seen = new Set();
        localStorage.setItem('admin', JSON.stringify(admin, (key, value) => {
                if (typeof value === 'object' && value !== null) {
                    if (seen.has(value)) {
                    return '[Circular]'; // Replace circular reference with a string placeholder
                    }
                    seen.add(value);
                }
                return value;
            }));
    }

    function showMessage(element, message, isError = false) {
        if (!element) return;
        element.textContent = message;
        element.className = `text-center text-sm mt-2 h-4 ${isError ? 'text-red-500' : 'text-green-600'}`;
        setTimeout(() => element.textContent = '', 3000);
    }

    function findCardByTitle(title) {
        const headings = document.querySelectorAll('h2');
        for (const h of headings) {
            if (h.textContent && h.textContent.trim() === title) return h.parentElement;
        }
        return null;
    }

    // RENDERING FUNCTIONS
    function renderDashboard() {
        if (!currentUser) return;
        welcomeMessage.textContent = `Welcome, ${currentUser.name}!`;
        const account = currentUser.account;
        if (dashboardBalance) dashboardBalance.textContent = `$${account.balance.toFixed(2)}`;
        if (dashboardAccountNumber) dashboardAccountNumber.textContent = `ACC: ${account.accountNumber}`;
        renderTransactionHistory();
        renderCardDetails();
        renderPayees();
        renderLoanUI();
        renderSupportUI();
    }
    
    function renderTransactionHistory() {
        if (!currentUser) return;
        const account = currentUser.account;
        if (!transactionHistoryContainer) return;
        transactionHistoryContainer.innerHTML = '';
        const arr = account.transactions.toArray(5);
        if (arr.length === 0) {
            transactionHistoryContainer.innerHTML = '<p class="text-slate-500 text-center">No transactions yet.</p>';
            return;
        }
        arr.forEach(tx => {
            const isCredit = tx.type === 'deposit' || tx.type === 'transfer-in';
            const transactionEl = document.createElement('div');
            transactionEl.className = 'flex justify-between items-center p-3 mr-3 rounded-lg bg-slate-50 border';
            let typeText = tx.type.replace('-', ' ');
            transactionEl.innerHTML = `
                <div>
                    <p class="font-semibold capitalize">${typeText}</p>
                    <p class="text-xs text-slate-500">${tx.details ? tx.details + ' - ' + (new Date(tx.date).toLocaleDateString()) : new Date(tx.date).toLocaleDateString()}</p>
                </div>
                <p class="font-bold ${isCredit ? 'text-green-600' : 'text-red-600'}">
                    ${isCredit ? '+' : '-'}$${tx.amount.toFixed(2)}
                </p>
            `;
            transactionHistoryContainer.appendChild(transactionEl);
        });
    }

    function renderCardDetails() {
        if (!currentUser) return;
        const account = currentUser.account;
        const renderCard = (card, container) => {
            if (!container || !card) return;
            container.innerHTML = `
                <div class="p-4 rounded-lg shadow-inner ${card.type === 'Debit' ? 'bg-blue-100' : 'bg-purple-100'}">
                    <h4 class="font-bold text-sm ${card.type === 'Debit' ? 'text-blue-800' : 'text-purple-800'}">${card.type} Card</h4>
                    <p class="font-mono text-xs mt-2">${card.cardNumber}</p>
                    <div class="flex justify-between text-xs mt-1">
                        <span>EXP: ${card.expiryDate}</span>
                        <span>CVV: ${card.cvv}</span>
                    </div>
                    <p class="text-xs mt-2">Limit: <span class="font-semibold">$${card.transactionLimit}</span></p>
                </div>
            `;
        };
        renderCard(currentUser.account.debitCard, debitCardDetailsContainer);
        renderCard(currentUser.account.creditCard, creditCardDetailsContainer);
    }

    function renderPayees() {
        if (!currentUser || !payeeSelect) return;
        payeeSelect.innerHTML = '<option value="">Select a payee</option>';
        currentUser.payees.forEach(payee => {
            const option = document.createElement('option');
            option.value = payee.accountNumber;
            option.textContent = `${payee.name} - ${payee.accountNumber}`;
            payeeSelect.appendChild(option);
        });
    }

    function renderLoanUI() {
        if (!loanCardContainer) return;
        const pendingCount = bank.loanRequests.size();
        const myLoans = currentUser.loans;
        loanCardContainer.innerHTML = `
            <h3 class="text-lg font-semibold mb-2">Loan Requests</h3>
            <p class="text-sm text-slate-500 mb-2">Applied: ${pendingCount}</p>
            <div class="mb-3">
                <form id="loan-apply-form">
                    <input id="loan-amount" type="number" placeholder="Amount" class="w-full p-2 border rounded-md mb-2" required>
                    <select id="loan-priority" class="w-full p-2 border rounded-md mb-2">
                        <option value="1">Priority: Low</option>
                        <option value="2">Priority: Medium</option>
                        <option value="3">Priority: High</option>
                    </select>
                    <input id="loan-note" type="text" placeholder="Reason" class="w-full p-2 border rounded-md mb-2" required>
                    <button type="submit" class="w-full bg-indigo-600 text-white py-2 rounded-md">Apply for Loan</button>
                </form>
            </div>
            <div class="mt-2">
                <button id="process-next-loan" class="w-full bg-green-500 text-white py-2 rounded-md mb-2">Process Next Loan</button>
            </div>
            <h4 class="font-semibold mt-2">My Loans</h4>
            <div id="my-loans" class="space-y-2 mt-2 max-h-40 overflow-y-auto">No loan requests.</div>
        `;

        const loanForm = document.getElementById('loan-apply-form');
        if (loanForm) {
            loanForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const amt = parseFloat(document.getElementById('loan-amount').value);
                const pr = parseInt(document.getElementById('loan-priority').value, 10);
                const note = document.getElementById('loan-note').value.trim();
                if (isNaN(amt) || amt <= 0) { alert('Enter valid loan amount'); return; }
                bank.applyLoan(currentUser, amt, pr, note);
                updateAdminData();
                updateUserData();
                renderLoanUI();
                renderDashboard();
                alert('Loan request submitted.');
            });
        }

        const myLoansContainer = document.getElementById('my-loans');
        if (myLoansContainer) {
            myLoansContainer.innerHTML = '';
            let priority = '';
            myLoans.slice().reverse().forEach(t => {
                if(parseInt(t.priority) == 1) priority = 'Low';
                if(parseInt(t.priority) == 2) priority = 'Medium';
                if(parseInt(t.priority) == 3) priority = 'High';
                const el = document.createElement('div');
                el.className = 'p-2 rounded-md bg-slate-50 border';
                el.innerHTML = `<div class="text-sm">${t.req.note}<p class="font-bold ${t.req.status =='approved' ? 'text-green-600' : (t.req.status == 'pending' ? 'text-yellow-600' : 'text-red-600')}">
                    $${t.req.amount.toFixed(2)}
                </p></div><div class="text-xs text-slate-500 mt-1">${t.req.status} - ${priority} - ${new Date(t.req.date).toLocaleString()}</div>`;
                myLoansContainer.appendChild(el);
            });
            if(myLoansContainer.innerHTML == '') myLoansContainer.innerHTML = "No loan requested";
        }
    }
    
    // Render Support UI
    function renderSupportUI() {
        if (!supportCardContainer) return;
        const queueSize = currentUser.tickets.length;
        const myTickets = currentUser.tickets || [];
        supportCardContainer.innerHTML = `
        <h3 class="text-lg font-semibold mb-2">Support</h3>
        <p class="text-sm text-slate-500 mb-2">Tickets: ${queueSize}</p>
        <textarea id="support-message" class="w-full p-2 border rounded-md mb-2" placeholder="Describe your issue"></textarea>
        <button id="submit-ticket" class="w-full bg-teal-500 text-white py-2 rounded-md mb-3">Submit Ticket</button>
        <button id="process-ticket" class="w-full bg-orange-500 text-white py-2 rounded-md mb-3">Process Next Ticket</button>
        <h4 class="font-semibold mt-2">My Tickets</h4>
        <div id="my-tickets" class="space-y-2 mt-2 max-h-40 overflow-y-auto">No ticketes.</div>
        `;

        const submitBtn = document.getElementById('submit-ticket');
        if (submitBtn) {
            submitBtn.addEventListener('click', () => {
                const msg = document.getElementById('support-message').value.trim();
                if (!msg) { alert('Please enter a message'); return; }
                bank.submitTicket(currentUser, msg);
                updateAdminData();
                updateUserData();
                document.getElementById('support-message').value = '';
                renderSupportUI();
                alert('Ticket submitted.');
            });
        }
        
        const myTicketsContainer = document.getElementById('my-tickets');
        if (myTicketsContainer) {
            myTicketsContainer.innerHTML = '';
            myTickets.slice().reverse().forEach(t => {
                const el = document.createElement('div');
                el.className = 'p-2 rounded-md bg-slate-50 border';
                el.innerHTML = `<div class="text-sm">${t.message}</div><div class="text-xs text-slate-500 mt-1">${t.status} - ${new Date(t.createdAt).toLocaleString()}</div>`;
                myTicketsContainer.appendChild(el);
            });
            if(myTicketsContainer.innerHTML == '') myTicketsContainer.innerHTML = "No query raised";
        }
    }

    // EVENT HANDLERS

    if (logoutBtn) logoutBtn.addEventListener('click', () => {
        updateUserData();
        sessionStorage.setItem('user', '');
        window.location.href = 'login.html';
    });
    
    if (depositBtn) depositBtn.addEventListener('click', () => {
        const amount = parseFloat(depositAmountInput.value);
        const remark = depositRemarkInput.value.trim();
        if(isNaN(amount) || amount <= 0) {
            showMessage(transactionMessage, 'Please enter a valid amount.', true); return;
        }
        const node = currentUser.account.deposit(amount, false, '', remark);
        if (node) {
            currentUser.undoStack.push({ type: 'deposit', amount, txNode: node });
            showMessage(transactionMessage, `Successfully deposited $${amount.toFixed(2)}.`);
            updateUserData();
            renderDashboard();
        }
        depositAmountInput.value = '';
        depositRemarkInput.value = '';
    });
    
    if (withdrawBtn) withdrawBtn.addEventListener('click', () => {
        const amount = parseFloat(withdrawAmountInput.value);
        const remark = withdrawRemarkInput.value.trim();
        if(isNaN(amount) || amount <= 0) {
            showMessage(transactionMessage, 'Please enter a valid amount.', true); return;
        }
        const node = currentUser.account.withdraw(amount, false, '', remark);
        if (node) {
            currentUser.undoStack.push({ type: 'withdrawal', amount, txNode: node });
            showMessage(transactionMessage, `Successfully withdrew $${amount.toFixed(2)}.`);
            renderDashboard();
        } else {
            showMessage(transactionMessage, 'Insufficient funds.', true);
        }
        withdrawAmountInput.value = '';
        withdrawRemarkInput.value = '';
    });
    
    if (updateLimitBtn) updateLimitBtn.addEventListener('click', () => {
        const cardType = cardSelect.value;
        const newLimit = parseFloat(newLimitInput.value);
        if(isNaN(newLimit) || newLimit <= 0) {
            showMessage(limitMessage, 'Please enter a valid limit.', true); return;
        }
        const card = cardType === 'debit' ? currentUser.account.debitCard : currentUser.account.creditCard;
        if(card.setTransactionLimit(newLimit)) {
            showMessage(limitMessage, `Limit updated to $${newLimit.toFixed(2)}.`);
            renderCardDetails();
        }
        updateUserData();
        newLimitInput.value = '';
    });

    if (addPayeeBtn) addPayeeBtn.addEventListener('click', () => {
        const name = payeeNameInput.value.trim();
        const accNum = payeeAccountNumberInput.value.trim();
        
        if (!name || !accNum) {
            showMessage(payeeMessage, 'Please fill both fields.', true); return;
        }
        if(parseInt(accNum) == currentUser.account.accountNumber){
            showMessage(payeeMessage, "You can't add your self", true); return;
        }
        if(bank.findCustomerByAccountNumber(parseInt(accNum) === null)) {
            showMessage(payeeMessage, 'Payee account does not exist.', true); return;
        }
        const newPayee = new Payee(name, parseInt(accNum));
        if (currentUser.addPayee(newPayee)) {
            showMessage(payeeMessage, 'Payee added successfully.');
            renderPayees();
            // console.log(currentUser.payees);
            updateUserData();
            payeeNameInput.value = '';
            payeeAccountNumberInput.value = '';
        } else {
            showMessage(payeeMessage, 'Payee already exists.', true);
        }
    });

    if (transferBtn) transferBtn.addEventListener('click', () => {
        const payeeAccNum = parseInt(payeeSelect.value);
        const amount = parseFloat(transferAmountInput.value);
        if (!payeeAccNum) {
            showMessage(transferMessage, 'Please select a payee.', true); return;
        }
        if (isNaN(amount) || amount <= 0) {
            showMessage(transferMessage, 'Please enter a valid amount.', true); return;
        }
        const result = bank.transferMoney(currentUser, payeeAccNum, amount);
        showMessage(transferMessage, result.message, !result.success);
        if (result.success) {
            updateAdminData();
            updateUserData();
            renderDashboard();
            transferAmountInput.value = '';
        }
    });

    // DYNAMIC UI INSERTIONS
    function ensureDynamicUI() {

        // Loan card
        const cardMgmt = findCardByTitle('Card Management');
        if (cardMgmt && !document.getElementById('loan-card')) {
            loanCardContainer = document.createElement('div');
            loanCardContainer.id = 'loan-card';
            loanCardContainer.className = 'bg-white p-6 rounded-xl shadow-md mt-4';
            cardMgmt.parentElement.appendChild(loanCardContainer);
        } else if (cardMgmt) {
            loanCardContainer = document.getElementById('loan-card');
        }

        // Support card
        if (cardMgmt && !document.getElementById('support-card')) {
            supportCardContainer = document.createElement('div');
            supportCardContainer.id = 'support-card';
            supportCardContainer.className = 'bg-white p-6 rounded-xl shadow-md mt-4';
            cardMgmt.parentElement.appendChild(supportCardContainer);
        } else if (cardMgmt) {
            supportCardContainer = document.getElementById('support-card');
        }
    }



    // INITIALIZATION
    ensureDynamicUI();
    renderDashboard();

});