import Versions from './components/Versions'
import electronLogo from './assets/electron.svg'
import Login from './pages/auth/Login'
import { HashRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './routes/ProtectedRoute';
import Layout from './components/Layout';
import Dashboard from './pages/dashboard/Dashboard';
import Setting from './pages/setting/Setting';
import CustomerPage from './pages/customer/CustomerPage';
import MilkCollectionPage from './pages/milkCollection/MilkCollectionPage';
import MilkSalesPage from './pages/milSales/MilkSalesPage';
import SupliersPage from './pages/supliers/SupliersPage';
import RateChartPage from './pages/ratechart/RateChartPage';
import PaymentLedgerPage from './pages/paymetLedger/PaymentLedgerPage';
import ReportsPage from './pages/report/ReportsPage';
import InventoryPage from './pages/inventory/InventoryPage';
import AddCustomerPage from './pages/customer/AddCustomerPage';
import ChangePassword from './pages/auth/ChangePassword';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="customer" element={<CustomerPage />} />
          <Route path="milkcollection" element={<MilkCollectionPage />} />
          <Route path="milksales" element={<MilkSalesPage />} />
          <Route path="suppliers" element={<SupliersPage />} />
          <Route path="ratechart" element={<RateChartPage />} />
          <Route path="ledger" element={<PaymentLedgerPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="settings" element={<Setting />} />
          <Route path="addCustomer" element={<AddCustomerPage />} />
          <Route path="changePassword" element={<ChangePassword />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
