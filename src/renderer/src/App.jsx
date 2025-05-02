import Versions from './components/Versions'
import electronLogo from './assets/electron.svg'
import Login from './pages/auth/Login'
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './routes/ProtectedRoute';
import Layout from './components/Layout';
import Dashboard from './pages/dashboard/Dashboard';
import Setting from './pages/setting/Setting';

function App() {


  return (
    <BrowserRouter>
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
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="settings" element={<Setting />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );


}

export default App
