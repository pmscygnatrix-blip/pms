import { useState } from 'react';
import axios from 'axios';
import { 
    Box, 
    FormControl, 
    InputLabel, 
    Select, 
    MenuItem, 
    TextField, 
    Button, 
    Typography,
    Paper
} from '@mui/material';

const UnifiedTransactionForm = () => {
  const [type, setType] = useState('DEPOSIT');
  const [formData, setFormData] = useState({
    clientId: '',
    amount: '',
    ticker: '',
    quantity: '',
  });

  const { clientId, amount, ticker, quantity } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const payload = { type };
    if (type === 'DEPOSIT' || type === 'WITHDRAWAL') {
      payload.clientId = clientId;
      payload.amount = amount;
    } else if (type === 'BUY' || type === 'SELL') {
      payload.ticker = ticker;
      payload.quantity = quantity;
    }

    try {
      await axios.post('http://localhost:5000/api/transactions', payload);
      alert(`Transaction (${type}) processed successfully!`);
      window.location.reload(); 
    } catch (error) {
      console.error('Transaction failed:', error);
      alert('An error occurred. Please check the console.');
    }
  };

  return (
    <Paper component="form" onSubmit={handleSubmit} sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h6" gutterBottom>New Transaction</Typography>
      
      {/* Transaction Type Dropdown */}
      <FormControl fullWidth>
        <InputLabel id="transaction-type-label">Transaction Type</InputLabel>
        <Select
          labelId="transaction-type-label"
          id="transaction-type-select"
          value={type}
          label="Transaction Type"
          onChange={(e) => setType(e.target.value)}
        >
          <MenuItem value="DEPOSIT">Deposit</MenuItem>
          <MenuItem value="WITHDRAWAL">Withdrawal</MenuItem>
          <MenuItem value="BUY">Buy Asset</MenuItem>
          <MenuItem value="SELL">Sell Asset</MenuItem>
        </Select>
      </FormControl>

      {/* Conditional Fields for Deposit/Withdrawal */}
      {(type === 'DEPOSIT' || type === 'WITHDRAWAL') && (
        <>
          <TextField
            fullWidth
            type="number"
            name="clientId"
            value={clientId}
            onChange={handleChange}
            label="Client ID"
            variant="outlined"
            required
          />
          <TextField
            fullWidth
            type="number"
            name="amount"
            value={amount}
            onChange={handleChange}
            label="Amount (₹)"
            variant="outlined"
            required
          />
        </>
      )}

      {/* Conditional Fields for Buy/Sell */}
      {(type === 'BUY' || type === 'SELL') && (
        <>
          <TextField
            fullWidth
            type="text"
            name="ticker"
            value={ticker}
            onChange={handleChange}
            label="Ticker Symbol"
            variant="outlined"
            required
          />
          <TextField
            fullWidth
            type="number"
            name="quantity"
            value={quantity}
            onChange={handleChange}
            label="Quantity"
            variant="outlined"
            required
          />
        </>
      )}

      <Button type="submit" variant="contained" color="primary" sx={{ mt: 2, py: 1.5 }}>
        Process Transaction
      </Button>
    </Paper>
  );
};

export default UnifiedTransactionForm;

