import AdminDashboard from './AdminDashboard';
import CreateClientForm from '../components/CreateClientForm';
import ManualNavForm from '../components/ManualNavForm';
import UnifiedTransactionForm from '../components/UnifiedTransactionForm'; // 1. IMPORT the new unified form

const AdminHomePage = () => {
  return (
    <div>
      <AdminDashboard />

      <hr style={{ margin: '40px 0', border: '2px solid #ccc' }} />

      <h2>Admin Actions</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
        
        <div>
          {/* The new single form for all major transaction actions */}
          <UnifiedTransactionForm />
        </div>

        <div>
          {/* We keep the EOD Update and Create Client forms separate for clarity */}
          <ManualNavForm />
          <CreateClientForm />
        </div>
      </div>
    </div>
  );
};

export default AdminHomePage;

