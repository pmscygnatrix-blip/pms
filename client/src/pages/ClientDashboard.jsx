import { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// 1. Import Material-UI components for the redesign
import {
    Box,
    Typography,
    Paper,
    Grid,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Card,
    CardContent
} from '@mui/material';

const ClientDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClientData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      const config = { headers: { Authorization: `Bearer ${token}` } };

      try {
        const response = await axios.get('http://localhost:5000/api/portal/me', config);
        setData(response.data);
      } catch (error) {
        console.error('Error fetching client data:', error);
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            window.location.reload();
        }
      } finally {
        setLoading(false);
      }
    };
    fetchClientData();
  }, []);
  
  const calculateAbsoluteReturn = () => {
    if (!data || !data.transactionHistory || data.transactionHistory.length === 0) return "N/A";
    let netInvestment = 0;
    data.transactionHistory.forEach(tx => {
        if(tx.transaction_type === 'DEPOSIT') netInvestment += parseFloat(tx.amount);
        else if (tx.transaction_type === 'WITHDRAWAL') netInvestment -= parseFloat(tx.amount);
    });
    if (netInvestment <= 0) return "N/A";
    const absoluteReturn = ((data.currentValue - netInvestment) / netInvestment) * 100;
    return absoluteReturn.toFixed(2);
  };
  
  const getChartData = () => {
    if (!data || !data.navHistory || !data.transactionHistory) return [];
    let unitsHeld = 0;
    const chartData = data.navHistory.map(historyPoint => {
        const transactionsUpToDate = data.transactionHistory.filter(tx => new Date(tx.transaction_date) <= new Date(historyPoint.nav_date));
        unitsHeld = 0;
        transactionsUpToDate.forEach(tx => {
            if(tx.transaction_type === 'DEPOSIT') unitsHeld += parseFloat(tx.units);
            if(tx.transaction_type === 'WITHDRAWAL') unitsHeld -= parseFloat(tx.units);
        });
        return {
            date: new Date(historyPoint.nav_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
            value: unitsHeld * parseFloat(historyPoint.nav_value)
        };
    });
    return chartData.filter(point => point.value > 0.0001);
  };

  if (loading) {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
            <CircularProgress />
        </Box>
    );
  }

  if (!data) {
    return <Typography variant="h6" color="text.secondary" sx={{mt: 4}}>Could not load data. Please log out and back in.</Typography>;
  }

  const { clientName, totalUnits, currentValue, latestNav, transactionHistory } = data;
  const absoluteReturn = calculateAbsoluteReturn();
  const chartData = getChartData();

  const MetricCard = ({ title, value, subtext = '' }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h5" component="div">
          {value}
        </Typography>
        {subtext && <Typography sx={{ fontSize: 12, mt: 1 }} color="text.secondary">{subtext}</Typography>}
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ flexGrow: 1, padding: { xs: 1, md: 2 } }}>
      <Typography variant="h4" gutterBottom>Welcome, {clientName}!</Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
            <MetricCard title="Your Current Value" value={`₹${currentValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
            <MetricCard title="Your Total Units" value={totalUnits.toFixed(4)} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
            <MetricCard title="Current NAV" value={`₹${parseFloat(latestNav).toFixed(4)}`} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
            <MetricCard title="Absolute Return" value={`${absoluteReturn}%`} />
        </Grid>
      </Grid>

      <Paper sx={{ p: { xs: 1, md: 3 }, mb: 4 }}>
        <Typography variant="h5" gutterBottom>Your Portfolio Performance</Typography>
        <Box sx={{ height: 400 }}>
            {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis width={80} tickFormatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
                        <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
                        <Legend />
                        <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} activeDot={{ r: 8 }} name="Portfolio Value" />
                    </LineChart>
                </ResponsiveContainer>
            ) : (
                <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%'}}>
                    <Typography color="text.secondary">Not enough data to display a performance chart.</Typography>
                </Box>
            )}
        </Box>
      </Paper>
      
      <Paper sx={{ p: { xs: 1, md: 3 } }}>
        <Typography variant="h5" gutterBottom>Your Transaction History</Typography>
        <TableContainer>
            <Table sx={{ minWidth: 650 }}>
                <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell align="right">Amount</TableCell>
                        <TableCell align="right">Units</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                {transactionHistory.map((tx, index) => (
                    <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        <TableCell>{new Date(tx.transaction_date).toLocaleDateString('en-IN')}</TableCell>
                        <TableCell>{tx.transaction_type}</TableCell>
                        <TableCell align="right">₹{parseFloat(tx.amount).toLocaleString('en-IN')}</TableCell>
                        <TableCell align="right">{parseFloat(tx.units).toFixed(4)}</TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default ClientDashboard;

