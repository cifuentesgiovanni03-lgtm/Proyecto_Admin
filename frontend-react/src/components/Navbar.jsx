import { NavLink, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import './Navbar.css';

const menu = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/clientes', label: 'Clientes', icon: '👤' },
  { path: '/cuentas', label: 'Cuentas', icon: '💳' },
  { path: '/transacciones', label: 'Transacciones', icon: '🔄' },
  { path: '/reportes', label: 'Reportes', icon: '📋' },
  { path: '/bancos', label: 'Bancos', icon: '🏦' },
  { path: '/permisos', label: 'Permisos', icon: '🔐' },
  { path: '/roles', label: 'Roles', icon: '🛡️' },
  { path: '/usuarios', label: 'Usuarios', icon: '👥' },
];

export default function Navbar() {
  const navigate = useNavigate();
  const { dark, toggle } = useTheme();
  const usuario = (() => { try { return JSON.parse(localStorage.getItem('usuario') || '{}'); } catch { return {}; } })();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <span className="sidebar-logo">🏦</span>
        <span className="sidebar-title">ERP Bancario</span>
      </div>

      <nav className="sidebar-nav">
        {menu.map((item) => (
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
