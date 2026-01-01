document.addEventListener('DOMContentLoaded', () => {
    const tabs = {
        "loan-list": "loans",
        "query-list": "queries"
    };
    
    document.querySelectorAll("input[name='list']").forEach(radio => {
        radio.addEventListener("change", () => {
            renderLoans();
            renderQueries();
            Object.values(tabs).forEach(id =>
                document.getElementById(id).classList.add("hidden")
            );
            document.getElementById(tabs[radio.id]).classList.remove("hidden");
        });
    });
    
    let adminAccess = sessionStorage.getItem('admin-access');
    if(adminAccess == '') window.location.href = 'login.html';
    let admin = JSON.parse(localStorage.getItem("admin"));
    let bank = new Bank(admin.users, admin.loanRequests, admin.customerQueries, admin.undoRequests);
    
    let loans = document.getElementById("loans");
    let queries = document.getElementById("queries");
    let logoutBtn = document.getElementById("logout-btn");

    renderLoans();
    renderQueries();

    if (logoutBtn) logoutBtn.addEventListener('click', () => {
        sessionStorage.setItem('admin-access', '');
        window.location.href = 'login.html';
    });

    function renderLoans() {
        if (!admin) return;
        loans.innerHTML = '';
        const arr = admin.loanRequests;
        if (arr.length === 0) {
            loans.innerHTML = '<p class="text-slate-500 text-center">No pending loan requests.</p>';
            return;
        }
        arr.forEach(tx => {
            const element = document.createElement('div');
            element.className = 'flex justify-between items-center p-3 rounded-lg bg-slate-50 border';
            element.innerHTML = `
                <div>
                    <p class="font-semibold capitalize">Reason: ${tx.note}</p>
                    <p class="font-semibold capitalize">Applicant Email: ${tx.applicantEmail}</p>
                    <p class="text-xs text-slate-500 p-1">${(new Date(tx.date).toLocaleString())}</p>
                </div>
                <p class="font-bold text-3xl text-green-600">
                    $${tx.amount.toFixed(2)}
                </p>
                <div>
                    <button id="accept" onclick="acceptLoan('${tx.applicantEmail}', '${tx.date}')" class="w-full bg-green-600 text-white font-bold py-2 my-[2px] rounded-lg hover:bg-green-700">Accept</button>
                    <button id="reject" onclick="rejectLoan('${tx.applicantEmail}', '${tx.date}')" class="w-full bg-red-600 text-white font-bold py-2 rounded-lg hover:bg-red-700">Reject</button>
                </div>
            `;
            loans.appendChild(element);
        });
    }

    window.acceptLoan =  function acceptLoan(applicantEmail, date) {
        admin.loanRequests = admin.loanRequests.filter(
            loan => !(loan.applicantEmail === applicantEmail && loan.date === date)
        );
        processLoan(applicantEmail, date, true);
        localStorage.setItem('admin', JSON.stringify(admin));
        renderLoans();
    }

    window.rejectLoan =  function rejectLoan(applicantEmail, date) {
        admin.loanRequests = admin.loanRequests.filter(
            loan => !(loan.applicantEmail === applicantEmail && loan.date === date)
        );
        processLoan(applicantEmail, date, false);
        localStorage.setItem('admin', JSON.stringify(admin));
        renderLoans();
    }

    function processLoan(email, date, accept) {
        let cust = findCustomerByAccountNumber(parseInt(JSON.parse(localStorage.getItem(email+'_')).accountNumber));
        cust = new Customer(cust.name, cust.email, cust.password, cust.accountNumber, cust.balance, cust.payees, cust.undoQueries, cust.tickets, cust.transactions, cust.loans);
        let loan = cust.loans.find(
            loan => (loan.req.date == date)   
        );
        if(accept == true){
            loan.req.status = 'approved';
            const node = cust.account.deposit(loan.req.amount, false, '', `Loan approved (` + loan.req.note.substring(0, 8) + '...)');
        }else{
            loan.req.status = 'rejected';
        }
        updateUserData(JSON.parse(localStorage.getItem(email+'_')), cust);
    }
    
    function renderQueries() {
        if (!admin) return;
        queries.innerHTML = '';
        const arr = admin.customerQueries;
        if (arr.length === 0) {
            queries.innerHTML = '<p class="text-slate-500 text-center">No pending Queries.</p>';
            return;
        }
        arr.forEach(tx => {
            const element = document.createElement('div');
            element.className = 'flex justify-between items-center p-3 rounded-lg bg-slate-50 border';
            element.innerHTML = `
                <div>
                    <p class="font-semibold capitalize">Applicant Email: ${tx.customerEmail}</p>
                    <p class="text-xs text-slate-500 p-1">Query: ${tx.message}</p>
                    <p class="text-xs text-slate-500 p-1">${(new Date(tx.createdAt).toLocaleString())}</p>
                </div>
                <div>
                    <button id="accept" onclick="solveQuery('${tx.customerEmail}', '${tx.createdAt}')" class="w-full bg-green-600 text-white font-bold p-2 my-2 rounded-lg hover:bg-green-700">Solve</button>
                </div>
            `;
            queries.appendChild(element);
        });
    }

    window.solveQuery =  function solveQuery(applicantEmail, date) {
        admin.customerQueries = admin.customerQueries.filter(
            queries => !(queries.customerEmail === applicantEmail && queries.createdAt === date)
        );
        processQuery(applicantEmail, date);
        localStorage.setItem('admin', JSON.stringify(admin));
        renderQueries();
    }

    function processQuery(email, date) {
        let cust = findCustomerByAccountNumber(parseInt(JSON.parse(localStorage.getItem(email+'_')).accountNumber));
        cust = new Customer(cust.name, cust.email, cust.password, cust.accountNumber, cust.balance, cust.payees, cust.undoQueries, cust.tickets, cust.transactions, cust.loans);
        let query = cust.tickets.find(
            query => (query.createdAt == date)   
        );
        query.status = 'solved';
        updateUserData(JSON.parse(localStorage.getItem(email+'_')), cust);
    }

    function findCustomerByAccountNumber(accountNumber) {
        let isThere = false;
        bank.customers.forEach(element => {
            if (element.accountNumber == accountNumber) {
                isThere = localStorage.getItem(element.email + '_');
                isThere = JSON.parse(isThere);
            }
        });
        return isThere;
    }
    
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

});