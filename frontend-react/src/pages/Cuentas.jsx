import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import './Clientes.css';
import './Cuentas.css';

export default function Cuentas() {
  const [cuentas, setCuentas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ numero_cuenta: '', id_cliente: '', id_tipo_cuenta: '', saldo: 0 });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [cuentaSeleccionada, setCuentaSeleccionada] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [estadoCuenta, setEstadoCuenta] = useState(null);
  const [loadingEstado, setLoadingEstado] = useState(false);
  const [errorEstado, setErrorEstado] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [cuentasRes, clientesRes] = await Promise.all([
        api.get('/cuentas'),
        api.get('/clientes'),
      ]);
      setCuentas(Array.isArray(cuentasRes.data) ? cuentasRes.data : cuentasRes.data.cuentas || []);
      setClientes(Array.isArray(clientesRes.data) ? clientesRes.data : clientesRes.data.clientes || []);
    } catch {
      setError('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      await api.post('/cuentas', form);
      setShowForm(false);
      setForm({ numero_cuenta: '', id_cliente: '', id_tipo_cuenta: '', saldo: 0 });
      fetchData();
    } catch (err) {
      setFormError(err.response?.data?.mensaje || 'Error al crear cuenta');
    } finally {
      setSaving(false);
    }
  };

  const fetchEstadoCuenta = async (e) => {
    e.preventDefault();
    setErrorEstado('');
    setEstadoCuenta(null);
    setLoadingEstado(true);
    try {
      const { data } = await api.get(
        `/cuentas/${cuentaSeleccionada}/estado-cuenta?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`
      );
      setEstadoCuenta(data);
    } catch {
      setErrorEstado('Error al obtener estado de cuenta');
    } finally {
      setLoadingEstado(false);
    }
  };

  const estadoColor = { ACTIVA: 'badge-green', INACTIVA: 'badge-red', BLOQUEADA: 'badge-yellow', CERRADA: 'badge-red' };

  return (
    <div className="layout">
      <Navbar />
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1>Cuentas</h1>
            <p>Gestión de cuentas bancarias</p>
          </div>
          <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancelar' : '+ Nueva cuenta'}
          </button>
        </div>

        {showForm && (
          <form className="card form-card" onSubmit={handleSubmit}>
            <h2>Nueva cuenta</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Número de cuenta *</label>
                <input name="numero_cuenta" value={form.numero_cuenta} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Cliente *</label>
                <select name="id_cliente" value={form.id_cliente} onChange={handleChange} required>
                  <option value="">Selecciona un cliente</option>
                  {clientes.map((c) => (
                    <option key={c.id_cliente} value={c.id_cliente}>
                      {c.nombres} {c.apellidos}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Tipo de cuenta *</label>
                <select name="id_tipo_cuenta" value={form.id_tipo_cuenta} onChange={handleChange} required>
                  <option value="">Selecciona tipo</option>
                  <option value="1">AHORRO</option>
                  <option value="2">MONETARIA</option>
                </select>
              </div>
              <div className="form-group">
                <label>Saldo inicial</label>
                <input type="number" name="saldo" value={form.saldo} onChange={handleChange} min="0" step="0.01" />
              </div>
            </div>
            {formError && <p className="form-error">{formError}</p>}
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Guardando...' : 'Crear cuenta'}
            </button>
          </form>
        )}

        <div className="card">
          {loading ? (
            <p className="text-muted">Cargando cuentas...</p>
          ) : error ? (
            <p className="form-error">{error}</p>
          ) : cuentas.length === 0 ? (
            <p className="text-muted">No hay cuentas registradas.</p>
          ) : (
            <table className="tabla">
              <thead>
                <tr>
                  <th>Número de cuenta</th>
                  <th>Cliente</th>
                  <th>Tipo</th>
                  <th>Saldo</th>
                  <th>Moneda</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {cuentas.map((c) => (
                  <tr key={c.id_cuenta}>
                    <td><code>{c.numero_cuenta}</code></td>
                    <td>{c.nombres ? `${c.nombres} ${c.apellidos}` : c.id_cliente}</td>
                    <td>{c.tipo_cuenta || c.id_tipo_cuenta}</td>
                    <td>{parseFloat(c.saldo).toLocaleString('es-GT', { minimumFractionDigits: 2 })}</td>
                    <td>{c.moneda}</td>
                    <td>
                      <span className={`badge ${estadoColor[c.estado] || 'badge-red'}`}>
                        {c.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card form-card">
          <h2>Estado de cuenta</h2>
          <form onSubmit={fetchEstadoCuenta}>
            <div className="form-grid">
              <div className="form-group">
                <label>Cuenta *</label>
                <select value={cuentaSeleccionada} onChange={e => setCuentaSeleccionada(e.target.value)} required>
                  <option value="">Selecciona una cuenta</option>
                  {cuentas.map(c => (
                    <option key={c.id_cuenta} value={c.id_cuenta}>{c.numero_cuenta}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Fecha inicio *</label>
                <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Fecha fin *</label>
                <input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} required />
              </div>
            </div>
            <button type="submit" className="btn-primary" disabled={loadingEstado}>
              {loadingEstado ? 'Consultando...' : 'Consultar estado de cuenta'}
            </button>
          </form>

          {errorEstado && <p className="form-error" style={{ marginTop: '16px' }}>{errorEstado}</p>}

          {estadoCuenta && (
            <div className="estado-resultado">
              <div className="estado-resumen">
                <div className="estado-item">
                  <span>Saldo inicial</span>
                  <strong>{estadoCuenta.saldo_inicial ?? '-'}</strong>
                </div>
                <div className="estado-item">
                  <span>Saldo final</span>
                  <strong>{estadoCuenta.saldo_final ?? estadoCuenta.saldo_actual ?? '-'}</strong>
                </div>
                <div className="estado-item">
                  <span>Total movimientos</span>
                  <strong>{estadoCuenta.total_movimientos ?? estadoCuenta.movimientos?.length ?? '-'}</strong>
                </div>
              </div>
              {estadoCuenta.movimientos?.length > 0 && (
                <table className="tabla" style={{ marginTop: '16px' }}>
                  <thead>
                    <tr>
                      <th>Tipo</th>
                      <th>Monto</th>
                      <th>Saldo anterior</th>
                      <th>Saldo nuevo</th>
                      <th>Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {estadoCuenta.movimientos.map((m, i) => (
                      <tr key={i}>
                        <td>
                          <span className={`badge ${m.tipo_movimiento === 'CREDITO' ? 'badge-green' : 'badge-red'}`}>
                            {m.tipo_movimiento}
                          </span>
                        </td>
                        <td>{parseFloat(m.monto).toLocaleString('es-GT', { minimumFractionDigits: 2 })}</td>
                        <td>{parseFloat(m.saldo_anterior).toLocaleString('es-GT', { minimumFractionDigits: 2 })}</td>
                        <td>{parseFloat(m.saldo_nuevo).toLocaleString('es-GT', { minimumFractionDigits: 2 })}</td>
                        <td>{new Date(m.fecha_movimiento).toLocaleDateString('es-GT')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}