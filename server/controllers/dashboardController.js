const db = require('../config/db');

// @desc    Get all data for the admin dashboard
// @route   GET /api/dashboard
const getDashboardData = async (req, res) => {
  try {
    // 1. Get the most recent NAV and portfolio value
    const navResult = await db.query(
      'SELECT * FROM nav_history ORDER BY nav_date DESC LIMIT 1'
    );
    const latestNav = navResult.rows.length > 0 ? navResult.rows[0] : null;

    // --- NEW LOGIC TO CALCULATE HOLDING VALUES FOR PIE CHART ---
    let holdingsWithValue = [];
    if (latestNav) {
        const holdingsResult = await db.query('SELECT ticker, quantity FROM master_holdings WHERE quantity > 0');
        const totalPortfolioValue = parseFloat(latestNav.total_portfolio_value);
        
        // Find the value of all non-cash assets.
        const cashResult = await db.query("SELECT quantity FROM master_holdings WHERE ticker = 'CASH'");
        const cashValue = cashResult.rows.length > 0 ? parseFloat(cashResult.rows[0].quantity) : 0;
        const nonCashValue = totalPortfolioValue - cashValue;

        // Calculate the total quantity of all non-cash assets
        const totalNonCashQuantity = holdingsResult.rows
            .filter(h => h.ticker !== 'CASH')
            .reduce((sum, h) => sum + parseFloat(h.quantity), 0);
        
        holdingsWithValue = holdingsResult.rows.map(holding => {
            let value = 0;
            if (holding.ticker === 'CASH') {
                value = cashValue;
            } else if (totalNonCashQuantity > 0) {
                // Distribute the non-cash value proportionally based on quantity
                const proportion = parseFloat(holding.quantity) / totalNonCashQuantity;
                value = nonCashValue * proportion;
            }
            return {
                name: holding.ticker,
                value: parseFloat(value.toFixed(2)) // Use 'name' and 'value' for the chart
            };
        });
    }
    // --- END OF NEW LOGIC ---

    // 2. Get all clients and their details (this logic remains the same)
    const clientsResult = await db.query('SELECT * FROM clients ORDER BY name');
    const clients = clientsResult.rows;
    const ledgerResult = await db.query('SELECT * FROM units_ledger');
    const ledgerEntries = ledgerResult.rows;
    const clientUnitHoldings = {};
    for (const entry of ledgerEntries) {
      const clientId = entry.client_id;
      const units = parseFloat(entry.units);
      if (!clientUnitHoldings[clientId]) clientUnitHoldings[clientId] = 0;
      if (entry.transaction_type === 'DEPOSIT') clientUnitHoldings[clientId] += units;
      else if (entry.transaction_type === 'WITHDRAWAL') clientUnitHoldings[clientId] -= units;
    }
    const clientsWithDetails = clients.map(client => {
      const totalUnits = clientUnitHoldings[client.id] || 0;
      const currentValue = latestNav ? totalUnits * parseFloat(latestNav.nav_value) : 0;
      return { ...client, totalUnits, currentValue };
    });

    // 3. Send all the data in one response, including the new holdings data
    res.json({
      latestNav,
      clients: clientsWithDetails,
      holdings: holdingsWithValue, // <-- ADDED THIS to the response
    });

  } catch (err) {
    console.error('DB Error in getDashboardData:', err.message);
    res.status(500).send('Server Error');
  }
};

module.exports = {
  getDashboardData,
};
