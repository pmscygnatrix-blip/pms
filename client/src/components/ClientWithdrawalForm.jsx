import { useState } from 'react';
import axios from 'axios';

const ClientWithdrawalForm = ({ clientId: propClientId, onTransactionSuccess }) => {
    // We use internal state for the form fields, same as the deposit form
    const [internalClientId, setInternalClientId] = useState('');
    const [amount, setAmount] = useState('');

    // Determine which client ID to use: the one from props or the one from the input field
    const clientId = propClientId || internalClientId;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!amount || !clientId) {
        alert('Client ID and Withdrawal Amount are required.');
        return;
        }
        try {
        await axios.post('http://localhost:5000/api/clients/withdraw', {
            clientId: parseInt(clientId),
            amount: parseFloat(amount),
        });
        alert('Withdrawal successful!');
        setAmount('');
        setInternalClientId(''); // Clear the internal ID field as well

        if (onTransactionSuccess) {
            onTransactionSuccess();
        }

        } catch (error) {
        console.error('Error processing withdrawal:', error);
        alert('Failed to process withdrawal.');
        }
    };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '5px', marginTop: '20px', flex: 1 }}>
      <h4>Log Withdrawal</h4>
      <form onSubmit={handleSubmit}>
        {/* Conditionally render the Client ID input */}
        {/* If a clientId is passed as a prop, we hide this field. */}
        {!propClientId && (
            <div>
                <label>Client ID: </label>
                <input
                    type="number"
                    value={internalClientId}
                    onChange={(e) => setInternalClientId(e.target.value)}
                    placeholder="Enter Client ID"
                    style={{width: '100%', padding: '8px', boxSizing: 'border-box'}}
                />
            </div>
        )}
        <div style={{ marginTop: '10px' }}>
          <label>Withdrawal Amount: </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g., 10000"
            style={{width: '100%', padding: '8px', boxSizing: 'border-box'}}
          />
        </div>
        <button type="submit" style={{ marginTop: '15px', padding: '10px 15px' }}>
          Log Withdrawal
        </button>
      </form>
    </div>
  );
};

export default ClientWithdrawalForm;

