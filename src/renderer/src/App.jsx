import Versions from './components/Versions'
import electronLogo from './assets/electron.svg'
import Login from './pages/auth/Login'
import { HashRouter, Route, Routes, useNavigate } from 'react-router-dom';
import ProtectedRoute from './routes/ProtectedRoute';
import Layout from './components/Layout';
import Dashboard from './pages/dashboard/Dashboard';
import Setting from './pages/setting/Setting';
import CustomerPage from './pages/customer/CustomerPage';
import MilkCollectionPage from './pages/milkCollection/MilkCollectionPage';
import MilkSalesPage from './pages/milSales/MilkSalesPage';
import RateChartPage from './pages/ratechart/RateChartPage';
import PaymentLedgerPage from './pages/paymetLedger/PaymentLedgerPage';
import ReportsPage from './pages/report/ReportsPage';
import InventoryPage from './pages/inventory/InventoryPage';
import AddCustomerPage from './pages/customer/AddCustomerPage';
import ChangePassword from './pages/auth/ChangePassword';
import SnfChartPage from './pages/snfchart/SnfChartPage';
import CategoreisPage from './pages/categories/CategoreisPage';
import AddCategoriesPage from './pages/categories/AddCategoriesPage';
import Register from './pages/auth/Register';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import SetForgotPasswordPage from './pages/auth/SetForgotPasswordPage';
import EditCustomerPage from './pages/customer/EditCustomerPage';
import EditMilkCollectionPage from './pages/milkCollection/EditMilkCollectionPage';
import MilkCollectionNewWin from './milkCollection/MilkCollectionNewWin';
import CustomerCollection from './pages/milkCollection/CustomerCollection';
import AddProductPage from './pages/inventory/AddProductPage';
import EditProductPage from './pages/inventory/editProductPage';
import NavigatorSetter from './helper/NavigatorSetter';
import AddStockPage from './pages/inventory/AddStockPage';
import EditeStockPage from './pages/inventory/EditeStockPage';
import { useEffect } from 'react';
import MilkDispatchPage from './pages/supliers/MilkDispatchPage';
import AddHeadDairy from './pages/headDairy/AddHeadDairy';
import EditHeadDairy from './pages/headDairy/EditHeadDairy';
import HeadDairyPage from './pages/headDairy/HeadDairyPage';
import SubscriptionPage from './pages/subscribe/SubscriptionPage';
import SubscriptionHistoryPage from './pages/subscribe/SubscriptionHistoryPage';

function App() {

useEffect(() => {
  const preloader = document.getElementById('preloader')
  if (preloader) {
    setTimeout(() => {
      preloader.style.opacity = '0'
      preloader.style.transition = 'opacity 0.3s ease'

      // Remove the element after the transition
      setTimeout(() => {
        preloader.remove()
      }, 300)
    }, 1000) // 3 seconds delay before starting fade-out
  }
}, [])


    return (
      <HashRouter>
        <NavigatorSetter /> {/* 👈 Set navigator once here */}
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot_password" element={<ForgotPasswordPage />} />
          <Route path="/set_forgot_password" element={<SetForgotPasswordPage />} />

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

            <Route path="category" element={<CategoreisPage />} />
            <Route path="addcategory" element={<AddCategoriesPage />} />
            <Route path="customer" element={<CustomerPage />} />
            <Route path="milkcollection" element={<MilkCollectionPage />} />
            <Route path="editMilkCollection" element={<EditMilkCollectionPage />} />
            <Route path="dailyMilkSale" element={<MilkSalesPage />} />
            <Route path="milkDispatch" element={<MilkDispatchPage />} />
            <Route path="ratechart" element={<RateChartPage />} />
            <Route path="paymentregister" element={<PaymentLedgerPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="settings" element={<Setting />} />
            <Route path="addCustomer" element={<AddCustomerPage />} />
            <Route path="editCustomer" element={<EditCustomerPage />} />
            <Route path="changePassword" element={<ChangePassword />} />
            <Route path="snfchart" element={<SnfChartPage />} />
            <Route path="AddProductPage" element={<AddProductPage />} />
            <Route path="editProduct" element={<EditProductPage />} />
            {/* product stock  */}
            <Route path="addStock" element={<AddStockPage />} />
            <Route path="editStock" element={<EditeStockPage />} />
            {/* Head Dairy  */}
            <Route path="headDairy" element={<AddHeadDairy />} />
            <Route path="alldairymaster" element={<HeadDairyPage />} />
            <Route path="editHeadDairy" element={<EditHeadDairy />} />
            <Route path="subscribe" element={<SubscriptionPage />} />
            <Route path="subscribe-history" element={<SubscriptionHistoryPage />} />

          </Route>

          <Route path="milk-collection" element={<MilkCollectionPage />} />
          <Route path="customer-collection" element={<CustomerCollection />} />
        </Routes>
      </HashRouter>
    );
  }

  export default App;
