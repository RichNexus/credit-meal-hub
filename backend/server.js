const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// --- CLIENTS ENDPOINTS ---

app.get('/api/clients', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM clients ORDER BY full_name');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/clients', async (req, res) => {
  const { fullName, staffId, companyName, department, dailyLimit, monthlyLimit } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO clients (full_name, staff_id, company_name, department, daily_credit_limit, monthly_credit_limit) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [fullName, staffId, companyName, department, dailyLimit, monthlyLimit]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- ORDERS ENDPOINTS ---

app.get('/api/orders', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT o.*, c.full_name, c.company_name, c.department 
      FROM orders o 
      JOIN clients c ON o.client_id = c.id 
      ORDER BY order_date DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/orders', async (req, res) => {
  const { clientId, amount, items } = req.body;
  const client = await pool.query('SELECT * FROM clients WHERE id = $1', [clientId]);
  
  if (client.rows.length === 0) return res.status(404).json({ message: 'Client not found' });

  // BUSINESS LOGIC: Daily & Monthly Checks
  const today = new Date().toISOString().split('T')[0];
  const dailyTotalRes = await pool.query(
    "SELECT SUM(amount) FROM orders WHERE client_id = $1 AND status = 'Approved' AND order_date::date = $2",
    [clientId, today]
  );
  
  const monthlyTotalRes = await pool.query(
    "SELECT SUM(amount) FROM orders WHERE client_id = $1 AND status = 'Approved' AND date_trunc('month', order_date) = date_trunc('month', current_date)",
    [clientId]
  );

  const dailyUsed = parseFloat(dailyTotalRes.rows[0].sum || 0);
  const monthlyUsed = parseFloat(monthlyTotalRes.rows[0].sum || 0);

  let status = 'Approved';
  let reason = null;

  if (dailyUsed + amount > client.rows[0].daily_credit_limit) {
    status = 'Rejected';
    reason = 'Daily limit exceeded';
  } else if (monthlyUsed + amount > client.rows[0].monthly_credit_limit) {
    status = 'Rejected';
    reason = 'Monthly limit exceeded';
  }

  try {
    const result = await pool.query(
      'INSERT INTO orders (client_id, amount, items, status, rejection_reason) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [clientId, amount, items, status, reason]
    );
    res.status(201).json({ order: result.rows[0], success: status === 'Approved', message: reason || 'Order processed successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- REPORTS ENDPOINTS ---

app.get('/api/reports/monthly', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        c.company_name, 
        c.department, 
        c.full_name, 
        c.staff_id, 
        SUM(o.amount) as total_deduction,
        COUNT(o.id) as order_count
      FROM clients c
      JOIN orders o ON c.id = o.client_id
      WHERE o.status = 'Approved' 
        AND date_trunc('month', o.order_date) = date_trunc('month', current_date)
      GROUP BY c.company_name, c.department, c.full_name, c.staff_id
      ORDER BY c.company_name, c.department
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => console.log(`Server running on port ${port}`));