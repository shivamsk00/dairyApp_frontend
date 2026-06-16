import Versions from './components/Versions'
import electronLogo from './assets/electron.svg'
import { useEffect,lazy, Suspense } from 'react';
import Login from './pages/auth/Login'
import { HashRouter, Route, Routes, useNavigate } from 'react-router-dom';
import ProtectedRoute from './routes/ProtectedRoute';
import NavigatorSetter from './helper/NavigatorSetter';
// import Layout from './components/Layout';
const Layout = lazy(() => import('./components/Layout'));
// import Dashboard from './pages/dashboard/Dashboard';

// import Setting from './pages/setting/Setting';
// import CustomerPage from './pages/customer/CustomerPage';
// import MilkCollectionPage from './pages/milkCollection/MilkCollectionPage';
// import MilkSalesPage from './pages/milSales/MilkSalesPage';
// import RateChartPage from './pages/ratechart/RateChartPage';
// import PaymentLedgerPage from './pages/paymetLedger/PaymentLedgerPage';
// import ReportsPage from './pages/report/ReportsPage';
// import InventoryPage from './pages/inventory/InventoryPage';
// import AddCustomerPage from './pages/customer/AddCustomerPage';
// import ChangePassword from './pages/auth/ChangePassword';
// import SnfChartPage from './pages/snfchart/SnfChartPage';
// import CategoreisPage from './pages/categories/CategoreisPage';
// import AddCategoriesPage from './pages/categories/AddCategoriesPage';
// import Register from './pages/auth/Register';
// import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
// import SetForgotPasswordPage from './pages/auth/SetForgotPasswordPage';
// import EditCustomerPage from './pages/customer/EditCustomerPage';
// import EditMilkCollectionPage from './pages/milkCollection/EditMilkCollectionPage';
// import MilkCollectionNewWin from './milkCollection/MilkCollectionNewWin';
// import CustomerCollection from './pages/milkCollection/CustomerCollection';
// import AddProductPage from './pages/inventory/AddProductPage';
// import EditProductPage from './pages/inventory/editProductPage';

// import AddStockPage from './pages/inventory/AddStockPage';
// import EditeStockPage from './pages/inventory/EditeStockPage';
// import MilkDispatchPage from './pages/supliers/MilkDispatchPage';
// import AddHeadDairy from './pages/headDairy/AddHeadDairy';
// import EditHeadDairy from './pages/headDairy/EditHeadDairy';
// import HeadDairyPage from './pages/headDairy/HeadDairyPage';
// import CashEntryPage from './pages/cashentry/CashEntryPage';
// import MilkCorrectionPage from './pages/milkCorrection/MilkCorrectionPage';
// import UpdateHistoryPage from './pages/updatehistory/UpdateHistoryPage';
// import LastMonthAccounting from './pages/lastMonthAccounting/LastMonthAccounting';
// import CmSubsidyList from './pages/cmSubsidyList/CmSubsidyList';
// import EditCashEntryModal from './pages/cashentry/EditCashEntry';
// import CashEntryNewWin from './pages/cashentry/CashEntryNewWin';
// import ProductCorrection from './pages/productCorrection/ProductCorrection';
// import CashCorrection from './pages/cashCorrection/CashCorrection';
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'));
const Setting = lazy(()=>import('./pages/setting/Setting'))
const CustomerPage = lazy(() => import('./pages/customer/CustomerPage'))
const MilkCollectionPage = lazy(() => import('./pages/milkCollection/MilkCollectionPage'))
const MilkSalesPage = lazy(() => import('./pages/milSales/MilkSalesPage'))
const RateChartPage = lazy(() => import('./pages/ratechart/RateChartPage'))
const PaymentLedgerPage = lazy(() => import('./pages/paymetLedger/PaymentLedgerPage'))
const ReportsPage = lazy(() => import('./pages/report/ReportsPage'))
const InventoryPage = lazy(() => import('./pages/inventory/InventoryPage'))
const AddCustomerPage = lazy(() => import('./pages/customer/AddCustomerPage'))
const ChangePassword = lazy(() => import('./pages/auth/ChangePassword'))
const SnfChartPage = lazy(() => import('./pages/snfchart/SnfChartPage'))
const CategoreisPage = lazy(() => import('./pages/categories/CategoreisPage'))
const AddCategoriesPage = lazy(() => import('./pages/categories/AddCategoriesPage'))
const Register = lazy(() => import('./pages/auth/Register'))
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'))
const SetForgotPasswordPage = lazy(() => import('./pages/auth/SetForgotPasswordPage'))
const EditCustomerPage = lazy(() => import('./pages/customer/EditCustomerPage'))
const EditMilkCollectionPage = lazy(() => import('./pages/milkCollection/EditMilkCollectionPage'))
const MilkCollectionNewWin = lazy(() => import('./milkCollection/MilkCollectionNewWin'))
const CustomerCollection = lazy(() => import('./pages/milkCollection/CustomerCollection'))
const AddProductPage = lazy(() => import('./pages/inventory/AddProductPage'))
const EditProductPage = lazy(() => import('./pages/inventory/editProductPage'))
const AddStockPage = lazy(() => import('./pages/inventory/AddStockPage'))
const EditeStockPage = lazy(() => import('./pages/inventory/EditeStockPage'))
const MilkDispatchPage = lazy(() => import('./pages/supliers/MilkDispatchPage'))
const AddHeadDairy = lazy(() => import('./pages/headDairy/AddHeadDairy'))
const EditHeadDairy = lazy(() => import('./pages/headDairy/EditHeadDairy'))
const HeadDairyPage = lazy(() => import('./pages/headDairy/HeadDairyPage'))
const CashEntryPage = lazy(() => import('./pages/cashentry/CashEntryPage'))
const MilkCorrectionPage = lazy(() => import('./pages/milkCorrection/MilkCorrectionPage'))
const UpdateHistoryPage = lazy(() => import('./pages/updatehistory/UpdateHistoryPage'))
const LastMonthAccounting = lazy(() => import('./pages/lastMonthAccounting/LastMonthAccounting'))
const CmSubsidyList = lazy(() => import('./pages/cmSubsidyList/CmSubsidyList'))
const EditCashEntryModal = lazy(() => import('./pages/cashentry/EditCashEntry'))
const CashEntryNewWin = lazy(() => import('./pages/cashentry/CashEntryNewWin'))
const ProductCorrection = lazy(() => import('./pages/productCorrection/ProductCorrection'))
const CashCorrection = lazy(() => import('./pages/cashCorrection/CashCorrection'))
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
      <Suspense fallback={<div>Loading...</div>}>
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
          <Route path="cashentry" element={<CashEntryPage />} />
          <Route path="editCashEntry" element={<EditCashEntryModal />} />
          <Route path="milkCorrection" element={<MilkCorrectionPage />} />
          <Route path="productCorrection" element={<ProductCorrection />} />
          <Route path="cashCorrection" element={<CashCorrection />} />
          <Route path="update-history" element={<UpdateHistoryPage />} />

          {/* Last Month Accounting */}
          <Route path="lastmonthaccounting" element={<LastMonthAccounting />} />

          {/* Cm Subsidy */}
          <Route path="cmsubsidylist" element={<CmSubsidyList />} />

        </Route>

        <Route path="milk-collection" element={<MilkCollectionPage />} />
        <Route path="customer-collection" element={<CustomerCollection />} />
        <Route path="cash-entry-win" element={<CashEntryNewWin />} />
      </Routes>
      </Suspense>
    </HashRouter>
  );
}

export default App;
