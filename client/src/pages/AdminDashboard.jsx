import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

// 1. Import Pie Chart components from recharts
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import { 
    Box, 
    Card, 
    CardContent, 
    Typography, 
    Grid, 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow, 
    Paper,
    CircularProgress 
} from '@mui/material';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/dashboard');
        setDashboardData(response.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <CircularProgress />
        </Box>
    );
  }

  if (!dashboardData || !dashboardData.latestNav) {
    return <Typography variant="h6" color="text.secondary" sx={{mt: 4}}>No portfolio data found. Please log a client deposit to begin.</Typography>;
  }

  const { latestNav, clients, holdings } = dashboardData;

  const MetricCard = ({ title, value, formatAsCurrency = false }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography color="text.secondary" gutterBottom>{title}</Typography>
        <Typography variant="h5" component="div">
          {formatAsCurrency ? `₹${parseFloat(value).toLocaleString('en-IN')}` : parseFloat(value).toFixed(4)}
        </Typography>
      </CardContent>
    </Card>
  );

  // Colors for the pie chart slices
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom component="div">
        Admin Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}><MetricCard title="Current NAV" value={latestNav.nav_value} /></Grid>
        <Grid item xs={12} sm={4}><MetricCard title="Total Portfolio Value" value={latestNav.total_portfolio_value} formatAsCurrency /></Grid>
        <Grid item xs={12} sm={4}><MetricCard title="Total Units" value={latestNav.total_units_outstanding} /></Grid>
      </Grid>

      <Grid container spacing={4}>
        {/* Client Holdings Table */}
        <Grid item xs={12} md={8}>
          <Typography variant="h5" gutterBottom component="div">Client Holdings</Typography>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }}>
              <TableHead sx={{ backgroundColor: '#f5f5f5' }}><TableRow><TableCell>Client ID</TableCell><TableCell>Name (Click to View)</TableCell><TableCell align="right">Total Units</TableCell><TableCell align="right">Current Value</TableCell></TableRow></TableHead>
              <TableBody>
                {clients.map((client) => (
                  <TableRow key={client.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell>{client.id}</TableCell>
                    <TableCell><Link to={`/client/${client.id}`} style={{ textDecoration: 'none', color: '#1976d2', fontWeight: 'bold' }}>{client.name}</Link></TableCell>
                    <TableCell align="right">{client.totalUnits.toFixed(4)}</TableCell>
                    <TableCell align="right">₹{client.currentValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        {/* --- NEW: Portfolio Allocation Pie Chart --- */}
        <Grid item xs={12} md={4}>
          <Typography variant="h5" gutterBottom component="div">Portfolio Allocation</Typography>
          <Paper sx={{ height: 400, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={holdings} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} fill="#8884d8" label>
                  {holdings.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;

