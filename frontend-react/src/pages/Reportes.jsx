import { useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import './Clientes.css';
import './Reportes.css';

export default function Reportes() {
  const [reporte, setReporte] = useState(null);
  const [tipo, setTipo] = useState('transacciones');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const endpoints = {
    transacciones: '/reportes/transacciones',
    clientes: '/reportes/clientes',
    saldos: '/reportes/saldos',
  };

  const titulos = {
    transacciones: 'Reporte de Transacciones',
    clientes: 'Reporte de Clientes',
    saldos: 'Resumen de Saldos',
  };

  const fetchReporte = async () => {
    setError('');
    setLoading(true);
    setReporte(null);
    try {
      const { data } = await api.get(endpoints[tipo]);
      setReporte(data);
    } catch {
      setError('Error al generar el reporte');
    } finally {
      setLoading(false);
    }
  };

  const renderTabla = () => {
    if (!reporte) return null;
    const rows = Array.isArray(reporte) ? reporte : reporte.datos || reporte.data || [];
    if (rows.length === 0) return <p className="text-muted">No hay datos para mostrar.</p>;
    const cols = Object.keys(rows[0]);
    return (
      <table className="tabla">
        <thead>
          <tr>{cols.map(c => <th key={c}>{c}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {cols.map(c => <td key={c}>{row[c] ?? '-'}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="layout">
      <Navbar />
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1>Reportes</h1>
            <p>Consulta y exporta información del sistema</p>
          </div>
        </div>

        <div className="card">
          <div className="reporte-controles">
            <div className="tipo-tabs">
              {Object.entries(titulos).map(([key, label]) => (
                <button key={key} type="button"
                  className={`tipo-tab ${tipo === key ? 'active' : ''}`}
                  onClick={() => { setTipo(key); setReporte(null); }}>
                  {label}
                </button>
              ))}
            </div>
            <button className="btn-primary" onClick={fetchReporte} disabled={loading}>
              {loading ? 'Generando...' : 'Generar reporte'}
            </button>
          </div>
        </div>

        {error && <p className="form-error">{error}</p>}

        {reporte && (
          <div className="card">
            <h2 className="reporte-titulo">{titulos[tipo]}</h2>
            {renderTabla()}
          </div>
        )}

        {!reporte && !loading && !error && (
          <div className="card reporte-placeholder">
            <span>📊</span>
            <p>Selecciona un tipo de reporte y haz clic en <strong>Generar reporte</strong></p>
          </div>
        )}
      </main>
    </div>
  );
}