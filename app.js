// Initialize transactions array
let transactions = [];

// DOM elements
const transactionForm = document.getElementById('transactionForm');
const transactionList = document.getElementById('transactionList');
const totalIncome = document.getElementById('totalIncome');
const totalExpenses = document.getElementById('totalExpenses');
const remainingBalance = document.getElementById('remainingBalance');
const generateReportBtn = document.getElementById('generateReport');

// Fetch all transactions from the server
function fetchTransactions() {
    fetch('http://localhost:3000/transactions')
        .then(response => response.json())
        .then(data => {
            transactions = data;
            renderTransactions();
            updateSummary();
        })
        .catch(error => console.error('Error fetching transactions:', error));
}

// Add transaction
transactionForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const description = document.getElementById('description').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const type = document.getElementById('type').value;
    
    const transaction = {
        description,
        amount,
        type
    };
    
    fetch('http://localhost:3000/transactions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(transaction),
    })
    .then(response => response.json())
    .then(data => {
        transactions.push(data);
        renderTransactions();
        updateSummary();
        transactionForm.reset();
    })
    .catch(error => console.error('Error adding transaction:', error));
});

// Render transactions
function renderTransactions() {
    transactionList.innerHTML = '';
    transactions.forEach(transaction => {
        const li = document.createElement('li');
        li.classList.add(transaction.type);
        li.innerHTML = `
            ${transaction.description} - $${parseFloat(transaction.amount).toFixed(2)}
            <button class="delete-btn" onclick="deleteTransaction(${transaction.id})">Delete</button>
        `;
        transactionList.appendChild(li);
    });
}

// Delete transaction
function deleteTransaction(id) {
    fetch(`http://localhost:3000/transactions/${id}`, {
        method: 'DELETE',
    })
    .then(() => {
        transactions = transactions.filter(transaction => transaction.id !== id);
        renderTransactions();
        updateSummary();
    })
    .catch(error => console.error('Error deleting transaction:', error));
}

// Update summary
function updateSummary() {
    const income = transactions
        .filter(transaction => transaction.type === 'income')
        .reduce((total, transaction) => total + parseFloat(transaction.amount), 0);
    
    const expenses = transactions
        .filter(transaction => transaction.type === 'expense')
        .reduce((total, transaction) => total + parseFloat(transaction.amount), 0);
    
    const balance = income - expenses;
    
    totalIncome.textContent = `$${income.toFixed(2)}`;
    totalExpenses.textContent = `$${expenses.toFixed(2)}`;
    remainingBalance.textContent = `$${balance.toFixed(2)}`;
}

// Generate monthly report
generateReportBtn.addEventListener('click', function() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    doc.text('Monthly Financial Report', 20, 20);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 30);
    
    doc.text('Income:', 20, 50);
    let yPos = 60;
    transactions.filter(t => t.type === 'income').forEach(t => {
        doc.text(`${t.description}: $${parseFloat(t.amount).toFixed(2)}`, 30, yPos);
        yPos += 10;
    });
    
    doc.text('Expenses:', 20, yPos + 10);
    yPos += 20;
    transactions.filter(t => t.type === 'expense').forEach(t => {
        doc.text(`${t.description}: $${parseFloat(t.amount).toFixed(2)}`, 30, yPos);
        yPos += 10;
    });
    
    const income = transactions
        .filter(t => t.type === 'income')
        .reduce((total, t) => total + parseFloat(t.amount), 0);
    const expenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((total, t) => total + parseFloat(t.amount), 0);
    const balance = income - expenses;
    
    doc.text(`Total Income: $${income.toFixed(2)}`, 20, yPos + 10);
    doc.text(`Total Expenses: $${expenses.toFixed(2)}`, 20, yPos + 20);
    doc.text(`Remaining Balance: $${balance.toFixed(2)}`, 20, yPos + 30);
    
    doc.save('monthly_report.pdf');
});

// Initial fetch
fetchTransactions();