import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import './Dashboard.css';

export default function Dashboard() {
  const [stats, setStats] = useState({
    clientes: '-',
    cuentas: '-',
    transacciones: '-',
    bancos: '-',
    roles: '-',
    usuarios: '-',
  });

  const getCount = (data, key) => {
    if (Array.isArray(data)) return data.length;
    if (Array.isArray(data?.[key])) return data[key].length;
    if (typeof data?.total === 'number') return data.total;
    if (typeof data?.total_cuentas === 'number') return data.total_cuentas;
    return '-';
  };

  useEffect(() => {
    const fetchStats = async () => {
      const results = await Promise.allSettled([
        api.get('/clientes'),
        api.get('/cuentas'),
        api.get('/transacciones'),
        api.get('/bancos'),
        api.get('/roles'),
        api.get('/usuarios'),
      ]);

      const [
        clientes,
        cuentas,
        transacciones,
        bancos,
        roles,
        usuarios,
      ] = results;

      setStats({
        clientes: clientes.status === 'fulfilled' ? getCount(clientes.value.data, 'clientes') : '-',
        cuentas: cuentas.status === 'fulfilled' ? getCount(cuentas.value.data, 'cuentas') : '-',
        transacciones: transacciones.status === 'fulfilled' ? getCount(transacciones.value.data, 'transacciones') : '-',
        bancos: bancos.status === 'fulfilled' ? getCount(bancos.value.data, 'bancos') : '-',
        roles: roles.status === 'fulfilled' ? getCount(roles.value.data, 'roles') : '-',
        usuarios: usuarios.status === 'fulfilled' ? getCount(usuarios.value.data, 'usuarios') : '-',
      });
    };

    fetchStats();
  }, []);

  const usuario = (() => {
    try {
      return JSON.parse(localStorage.getItem('usuario') || '{}');
    } catch {
      return {};
    }
  })();

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

  const tokenData = decodeToken();

  const rol =
    usuario.rol ||
    usuario.nombre_rol ||
    tokenData.rol ||
    tokenData.nombre_rol ||
    (tokenData.id_rol === 1 ? 'ADMINISTRADOR' : tokenData.id_rol === 2 ? 'OPERADOR' : tokenData.id_rol === 3 ? 'CAJERO' : '');

  const modulos = [
    { path: '/clientes', label: 'Clientes', icon: '👤' },
    { path: '/cuentas', label: 'Cuentas', icon: '💳' },
    { path: '/cuentas-publicas', label: 'Cuentas públicas', icon: '🌐' },
    { path: '/transacciones', label: 'Transacciones', icon: '🔄' },
    { path: '/reportes', label: 'Reportes', icon: '📋' },
    { path: '/bancos', label: 'Bancos', icon: '🏦' },
    { path: '/permisos', label: 'Permisos', icon: '🔐' },
    { path: '/roles', label: 'Roles', icon: '🛡️' },
    { path: '/usuarios', label: 'Usuarios', icon: '👥' },
  ];

  const adminOnly = ['/usuarios', '/roles', '/permisos'];

  const modulosVisibles = modulos.filter((item) => {
    if (rol === 'ADMINISTRADOR') return true;
    if (adminOnly.includes(item.path)) return false;
    if (rol === 'CAJERO' && item.path === '/bancos') return false;
    return true;
  });

  return (
    <div className="layout">
      <Navbar />

      <main className="main-content">
        <div className="dashboard-header">
          <h1>Bienvenido, {usuario.nombre_completo || 'Usuario'} 👋</h1>
          <p>Resumen general del sistema bancario</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">👤</div>
            <div className="stat-info">
              <span className="stat-value">{stats.clientes}</span>
              <span className="stat-label">Clientes registrados</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">💳</div>
            <div className="stat-info">
              <span className="stat-value">{stats.cuentas}</span>
              <span className="stat-label">Cuentas activas</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🔄</div>
            <div className="stat-info">
              <span className="stat-value">{stats.transacciones}</span>
              <span className="stat-label">Transacciones</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🏦</div>
            <div className="stat-info">
              <span className="stat-value">{stats.bancos}</span>
              <span className="stat-label">Bancos registrados</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🛡️</div>
            <div className="stat-info">
              <span className="stat-value">{stats.roles}</span>
              <span className="stat-label">Roles del sistema</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-info">
              <span className="stat-value">{stats.usuarios}</span>
              <span className="stat-label">Usuarios registrados</span>
            </div>
          </div>
        </div>

        <div className="quick-actions">
          <h2>Módulos del sistema</h2>

          <div className="actions-grid">
          {modulosVisibles.map((item) => (
            <a key={item.path} href={item.path} className="action-card">
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </a>
          ))}
        </div>
        </div>
      </main>
    </div>
  );
}