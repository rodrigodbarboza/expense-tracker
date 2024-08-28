const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'your_mysql_username',
    password: 'your_mysql_password',
    database: 'expense_tracker'
});

db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('Connected to MySQL database');
    
    // Create transactions table if it doesn't exist
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS transactions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            description VARCHAR(255) NOT NULL,
            amount DECIMAL(10, 2) NOT NULL,
            type ENUM('income', 'expense') NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;
    db.query(createTableQuery, (err) => {
        if (err) throw err;
        console.log('Transactions table created or already exists');
    });
});

// Get all transactions
app.get('/transactions', (req, res) => {
    const query = 'SELECT * FROM transactions ORDER BY created_at DESC';
    db.query(query, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

// Add a new transaction
app.post('/transactions', (req, res) => {
    const { description, amount, type } = req.body;
    const query = 'INSERT INTO transactions (description, amount, type) VALUES (?, ?, ?)';
    db.query(query, [description, amount, type], (err, result) => {
        if (err) throw err;
        res.json({ id: result.insertId, description, amount, type });
    });
});

// Delete a transaction
app.delete('/transactions/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM transactions WHERE id = ?';
    db.query(query, [id], (err) => {
        if (err) throw err;
        res.json({ message: 'Transaction deleted successfully' });
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});