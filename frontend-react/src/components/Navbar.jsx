import { NavLink, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import './Navbar.css';

const menu = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/clientes', label: 'Clientes', icon: '👤' },
  { path: '/cuentas', label: 'Cuentas', icon: '💳' },
  { path: '/cuentas-publicas', label: 'Cuentas públicas', icon: '🌐' },
  { path: '/transacciones', label: 'Transacciones', icon: '🔄' },
  //{ path: '/transferencia-entrante', label: 'Transferencia entrante', icon: '📥' },
  { path: '/reportes', label: 'Reportes', icon: '📋' },
  { path: '/bancos', label: 'Bancos', icon: '🏦' },
  { path: '/permisos', label: 'Permisos', icon: '🔐' },
  { path: '/roles', label: 'Roles', icon: '🛡️' },
  { path: '/usuarios', label: 'Usuarios', icon: '👥' },
];

export default function Navbar() {
  const navigate = useNavigate();
  const { dark, toggle } = useTheme();
  const decodeToken = () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return {};

      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch {
      return {};
    }
  };

  const usuario = (() => {
    try {
      const user = localStorage.getItem('usuario');
      if (!user || user === 'undefined') return {};
      return JSON.parse(user);
    } catch {
      return {};
    }
  })();

  const tokenData = decodeToken();

  const rol =
    usuario.rol ||
    usuario.nombre_rol ||
    tokenData.rol ||
    tokenData.nombre_rol ||
    (tokenData.id_rol === 1 ? 'ADMINISTRADOR' : tokenData.id_rol === 2 ? 'OPERADOR' : tokenData.id_rol === 3 ? 'CAJERO' : '');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    navigate('/login');
  };

  const adminOnly = ['/usuarios', '/roles', '/permisos'];

  const visibleMenu = menu.filter((item) => {
    if (rol === 'ADMINISTRADOR') return true;
    if (adminOnly.includes(item.path)) return false;
    if (rol === 'CAJERO' && item.path === '/bancos') return false;
    return true;
  });

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <span className="sidebar-logo">🏦</span>
        <span className="sidebar-title">ERP Bancario</span>
      </div>

      <nav className="sidebar-nav">
        {visibleMenu.slice(0, 4).map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 'sidebar-link' + (isActive ? ' active' : '')}
          >
            <span className="sidebar-icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
        {visibleMenu.slice(4).map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 'sidebar-link' + (isActive ? ' active' : '')}
          >
            <span className="sidebar-icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="theme-switch" onClick={toggle}>
          <span>{dark ? '🌙' : '☀️'}</span>
          <span className="theme-label">{dark ? 'Tema oscuro' : 'Tema claro'}</span>
          <div className={`toggle-track ${dark ? '' : 'on'}`}>
            <div className="toggle-thumb" />
          </div>
        </div>

        <div className="sidebar-user">
          <div className="sidebar-avatar">
            {usuario.nombre_completo?.[0] || 'U'}
          </div>
          <div className="sidebar-user-info">
            <span className="sidebar-user-name">{usuario.nombre_completo || 'Usuario'}</span>
            <span className="sidebar-user-role">{usuario.rol || ''}</span>
          </div>
        </div>
        <button className="sidebar-logout" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
