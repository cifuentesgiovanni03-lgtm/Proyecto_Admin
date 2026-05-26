import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import './Dashboard.css';

export default function Dashboard() {
  const [stats, setStats] = useState({
    clientes: '-',
    cuentas: '-',
    transacciones: '-',
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [clientes, cuentas, transacciones] = await Promise.all([
          api.get('/clientes'),
          api.get('/cuentas'),
          api.get('/transacciones'),
        ]);
        setStats({
          clientes: clientes.data?.length ?? clientes.data?.total ?? '-',
          cuentas: cuentas.data?.length ?? cuentas.data?.total ?? '-',
          transacciones: transacciones.data?.length ?? transacciones.data?.total ?? '-',
        });
      } catch {
        // Si falla, dejamos los guiones
      }
    };
    fetchStats();
  }, []);

const usuario = (() => { try { return JSON.parse(localStorage.getItem('usuario') || '{}'); } catch { return {}; } })();

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
        </div>

        <div className="quick-actions">
          <h2>Acciones rápidas</h2>
          <div className="actions-grid">
            <a href="/clientes" className="action-card">
              <span>👤</span>
              <span>Nuevo cliente</span>
            </a>
            <a href="/cuentas" className="action-card">
              <span>💳</span>
              <span>Nueva cuenta</span>
            </a>
            <a href="/transacciones" className="action-card">
              <span>💰</span>
              <span>Depósito</span>
            </a>
            <a href="/transacciones" className="action-card">
              <span>🔄</span>
              <span>Transferencia</span>
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
