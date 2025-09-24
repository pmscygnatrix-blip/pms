const express = require('express');
const cors = require('cors');

// Import all route handlers
const portfolioRoutes = require('./routes/portfolioRoutes');
const clientRoutes = require('./routes/clientRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const authRoutes = require('./routes/authRoutes');
const clientPortalRoutes = require('./routes/clientPortalRoutes');
const transactionRoutes = require('./routes/transactionRoutes'); // <-- 1. IMPORT new transaction routes

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Define All API Routes
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/portal', clientPortalRoutes);
app.use('/api/transactions', transactionRoutes); // <-- 2. USE the new transaction routes

// Simple test route to confirm the server is running
app.get('/', (req, res) => res.send('API is Running!'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

