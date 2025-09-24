const db = require('../config/db');

// @desc    Process a new unified transaction
// @route   POST /api/transactions
const createTransaction = async (req, res) => {
  const { type, clientId, amount, ticker, quantity } = req.body;

  // Use the pool for transactions, it's safer
  const client = await db.query('BEGIN'); 

  try {
    let resultData;
    
    // --- Logic for Cash Flow Transactions (Deposit/Withdrawal) ---
    if (type === 'DEPOSIT' || type === 'WITHDRAWAL') {
      if (!clientId || !amount) {
        throw new Error('Client ID and Amount are required for cash flows.');
      }

      const lastNavResult = await db.query('SELECT * FROM nav_history ORDER BY nav_date DESC LIMIT 1');
      
      // Handle withdrawal from an empty fund
      if (lastNavResult.rows.length === 0 && type === 'WITHDRAWAL') {
          throw new Error('No NAV history found. Cannot process withdrawal.');
      }

      // Set initial values if this is the first-ever transaction
      let latestNAV = lastNavResult.rows.length > 0 ? parseFloat(lastNavResult.rows[0].nav_value) : 10.0;
      let totalUnits = lastNavResult.rows.length > 0 ? parseFloat(lastNavResult.rows[0].total_units_outstanding) : 0;
      let totalValue = lastNavResult.rows.length > 0 ? parseFloat(lastNavResult.rows[0].total_portfolio_value) : 0;
      
      const unitsChanged = parseFloat(amount) / latestNAV;
      let newTotalUnits, newTotalValue;

      if (type === 'DEPOSIT') {
        newTotalUnits = totalUnits + unitsChanged;
        newTotalValue = totalValue + parseFloat(amount);
      } else { // WITHDRAWAL
        newTotalUnits = totalUnits - unitsChanged;
        newTotalValue = totalValue - parseFloat(amount);
      }
      
      const ledgerSql = 'INSERT INTO units_ledger (client_id, transaction_type, amount, units) VALUES ($1, $2, $3, $4)';
      await db.query(ledgerSql, [clientId, type, amount, unitsChanged]);
      
      const navSql = `
        INSERT INTO nav_history (nav_date, nav_value, total_portfolio_value, total_units_outstanding)
        VALUES (CURRENT_DATE, $1, $2, $3)
        ON CONFLICT (nav_date) DO UPDATE SET total_portfolio_value = $2, total_units_outstanding = $3
        RETURNING *;`;
      const { rows } = await db.query(navSql, [latestNAV, newTotalValue, newTotalUnits]);
      resultData = { navUpdate: rows[0] };
    } 
    
    // --- Logic for Asset Trades (Buy/Sell) ---
    else if (type === 'BUY' || type === 'SELL') {
      if (!ticker || !quantity) {
        throw new Error('Ticker and Quantity are required for trades.');
      }
      
      // For a SELL, the quantity sent to the DB should be negative
      const tradeQuantity = type === 'SELL' ? -Math.abs(parseFloat(quantity)) : parseFloat(quantity);

      const sql = `
        INSERT INTO master_holdings (ticker, quantity) VALUES ($1, $2)
        ON CONFLICT (ticker) DO UPDATE SET quantity = master_holdings.quantity + $2
        RETURNING *;
      `;
      const { rows } = await db.query(sql, [ticker.toUpperCase(), tradeQuantity]);
      resultData = { holdingUpdate: rows[0] };
    } 
    
    else {
      throw new Error('Invalid transaction type specified.');
    }

    await db.query('COMMIT'); // If everything above worked, save the changes
    res.status(201).json({ success: true, data: resultData });

  } catch (err) {
    await db.query('ROLLBACK'); // If any error occurred, undo all changes
    console.error('DB Error in createTransaction:', err.message);
    res.status(500).send('Server Error: Transaction rolled back.');
  }
};

module.exports = {
  createTransaction,
};

