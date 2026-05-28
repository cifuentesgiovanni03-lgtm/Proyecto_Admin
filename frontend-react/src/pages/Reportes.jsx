import { useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import './Clientes.css';
import './Reportes.css';

export default function Reportes() {
  const [tipo, setTipo] = useState('transacciones');
  const [reporte, setReporte] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  const [nivel, setNivel] = useState('');
  const [modulo, setModulo] = useState('');
  const [entidad, setEntidad] = useState('');
  const [accion, setAccion] = useState('');
  const [tipoReporte, setTipoReporte] = useState('');
  const [limite, setLimite] = useState('20');

  const tabs = {
    transacciones: 'Transacciones',
    clientes: 'Clientes',
    saldos: 'Saldos',
    logs: 'Logs',
    auditoria: 'Auditoría',
    reportesGenerados: 'Reportes generados',
  };

  const endpoints = {
    transacciones: '/reportes/transacciones',
    clientes: '/reportes/clientes',
    saldos: '/reportes/saldos',
    logs: '/logs',
    auditoria: '/auditoria',
    reportesGenerados: '/reportes-generados',
  };

  const limpiarResultado = (nuevoTipo) => {
    setTipo(nuevoTipo);
    setReporte(null);
    setError('');
  };

  const getParams = () => {
    const params = {};

    if (['transacciones', 'clientes', 'saldos'].includes(tipo)) {
      if (fechaInicio) params.fecha_inicio = fechaInicio;
      if (fechaFin) params.fecha_fin = fechaFin;
    }

    if (tipo === 'logs') {
      if (nivel) params.nivel = nivel;
      if (modulo) params.modulo = modulo;
      if (limite) params.limite = limite;
    }

    if (tipo === 'auditoria') {
      if (entidad) params.entidad = entidad;
      if (accion) params.accion = accion;
      if (limite) params.limite = limite;
    }

    if (tipo === 'reportesGenerados') {
      if (tipoReporte) params.tipo_reporte = tipoReporte;
      if (limite) params.limite = limite;
    }

    return params;
  };

  const fetchReporte = async () => {
    setError('');
    setLoading(true);
    setReporte(null);

    try {
      const { data } = await api.get(endpoints[tipo], { params: getParams() });
      setReporte(data);
    } catch (err) {
      setError(err.response?.data?.mensaje || err.response?.data?.message || 'Error al generar el reporte');
    } finally {
      setLoading(false);
    }
  };

  const obtenerFilas = () => {
    if (!reporte) return [];

    if (Array.isArray(reporte)) return reporte;

    return (
      reporte.datos ||
      reporte.data ||
      reporte.logs ||
      reporte.auditoria ||
      reporte.reportes ||
      reporte.resultados ||
      []
    );
  };

  const formatValue = (value) => {
    if (value === null || value === undefined || value === '') return '-';

    if (typeof value === 'object') {
      return JSON.stringify(value);
    }

    return String(value);
  };

  const renderFiltros = () => {
    if (['transacciones', 'clientes', 'saldos'].includes(tipo)) {
      return (
        <div className="reporte-filtros">
          <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
          <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
        </div>
      );
    }

    if (tipo === 'logs') {
      return (
        <div className="reporte-filtros">
          <input placeholder="Nivel: INFO, ERROR..." value={nivel} onChange={(e) => setNivel(e.target.value)} />
          <input placeholder="Módulo: TRANSACCIONES..." value={modulo} onChange={(e) => setModulo(e.target.value)} />
          <input type="number" placeholder="Límite" value={limite} onChange={(e) => setLimite(e.target.value)} />
        </div>
      );
    }

    if (tipo === 'auditoria') {
      return (
        <div className="reporte-filtros">
          <input placeholder="Entidad: bancos, TRANSACCIONES..." value={entidad} onChange={(e) => setEntidad(e.target.value)} />
          <input placeholder="Acción: CREAR, EDITAR..." value={accion} onChange={(e) => setAccion(e.target.value)} />
          <input type="number" placeholder="Límite" value={limite} onChange={(e) => setLimite(e.target.value)} />
        </div>
      );
    }

    if (tipo === 'reportesGenerados') {
      return (
        <div className="reporte-filtros">
          <input placeholder="Tipo reporte: CLIENTES..." value={tipoReporte} onChange={(e) => setTipoReporte(e.target.value)} />
          <input type="number" placeholder="Límite" value={limite} onChange={(e) => setLimite(e.target.value)} />
        </div>
      );
    }

    return null;
  };

  const renderTabla = () => {
    const rows = obtenerFilas();

    if (!reporte) return null;

    if (!Array.isArray(rows) || rows.length === 0) {
      return <p className="text-muted">No hay datos para mostrar.</p>;
    }

    const cols = Object.keys(rows[0]);

    return (
      <div className="tabla-scroll">
        <table className="tabla">
          <thead>
            <tr>
              {cols.map((col) => (
                <th key={col}>{col}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((row, index) => (
              <tr key={index}>
                {cols.map((col) => (
                  <td key={col}>{formatValue(row[col])}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="layout">
      <Navbar />

      <main className="main-content">
        <div className="page-header">
          <div>
            <h1>Reportes</h1>
            <p>Consulta reportes, logs, auditoría y bitácora del sistema</p>
          </div>
        </div>

        <div className="card">
          <div className="tipo-tabs reportes-tabs">
            {Object.entries(tabs).map(([key, label]) => (
              <button
                key={key}
                type="button"
                className={`tipo-tab ${tipo === key ? 'active' : ''}`}
                onClick={() => limpiarResultado(key)}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="reportes-panel">
            {renderFiltros()}

            <button className="btn-primary" onClick={fetchReporte} disabled={loading}>
              {loading ? 'Generando...' : 'Generar'}
            </button>
          </div>
        </div>

        {error && <p className="form-error">{error}</p>}

        {reporte && (
          <div className="card">
            <h2 className="reporte-titulo">{tabs[tipo]}</h2>
            {renderTabla()}
          </div>
        )}

        {!reporte && !loading && !error && (
          <div className="card reporte-placeholder">
            <span>📊</span>
            <p>Selecciona una pestaña, aplica filtros si deseas y haz clic en <strong>Generar</strong></p>
          </div>
        )}
      </main>
    </div>
  );
}
