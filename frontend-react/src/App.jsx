import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import Cuentas from './pages/Cuentas';
import Transacciones from './pages/Transacciones';
import Reportes from './pages/Reportes';
import Bancos from './pages/Bancos';
import Permisos from './pages/Permisos';
import Roles from './pages/Roles';
import Usuarios from './pages/Usuarios';
import CuentasPublicas from './pages/CuentasPublicas';
import TransferenciaEntrante from './pages/TransferenciaEntrante';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/clientes" element={<PrivateRoute><Clientes /></PrivateRoute>} />
        <Route path="/cuentas" element={<PrivateRoute><Cuentas /></PrivateRoute>} />
        <Route path="/transacciones" element={<PrivateRoute><Transacciones /></PrivateRoute>} />
        <Route path="/reportes" element={<PrivateRoute><Reportes /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/login" />} />
        <Route path="/bancos" element={<PrivateRoute><Bancos /></PrivateRoute>} />
        <Route path="/permisos" element={<PrivateRoute><Permisos /></PrivateRoute>} />
        <Route path="/roles" element={<PrivateRoute><Roles /></PrivateRoute>} />
        <Route path="/usuarios" element={<PrivateRoute><Usuarios /></PrivateRoute>} />
        <Route path="/cuentas-publicas" element={<PrivateRoute><CuentasPublicas /></PrivateRoute>} />
        <Route path="/transferencia-entrante" element={<PrivateRoute><TransferenciaEntrante /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  );
}