import { useState } from 'react';
import axios from 'axios';
import { 
    TextField, 
    Button, 
    Typography,
    Paper
} from '@mui/material';

const CreateClientForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // NOTE: This admin form creates a client without a password.
      // The client would need to be given a password separately or use a "forgot password" flow.
      await axios.post('http://localhost:5000/api/clients', { name, email });
      alert('Client Created! You can now log transactions for them.');
      setName('');
      setEmail('');
      // Refresh to see the new client in the dashboard list
      window.location.reload(); 
    } catch (error) {
      console.error('Error creating client:', error);
      alert('Failed to create client. The email might already be in use.');
    }
  };

  return (
    <Paper component="form" onSubmit={handleSubmit} sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2, mt: { xs: 2, md: 0 } }}>
      <Typography variant="h6" gutterBottom>Create New Client</Typography>
      
      <TextField
        fullWidth
        type="text"
        name="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        label="Client Name"
        variant="outlined"
        required
      />
      
      <TextField
        fullWidth
        type="email"
        name="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        label="Client Email"
        variant="outlined"
        required
      />
      
      <Button type="submit" variant="contained" color="primary" sx={{ mt: 2, py: 1.5 }}>
        Create Client
      </Button>
    </Paper>
  );
};

export default CreateClientForm;
