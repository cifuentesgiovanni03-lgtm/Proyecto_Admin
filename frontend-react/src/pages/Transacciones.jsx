import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import './Clientes.css';
import './Transacciones.css';

export default function Transacciones() {
  const [transacciones, setTransacciones] = useState([]);
  const [cuentas, setCuentas] = useState([]);
  const [bancos, setBancos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tipo, setTipo] = useState('deposito'); // deposito | retiro | interna | externa
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState({
    id_cuenta_origen: '', id_cuenta_destino: '', monto: '',
    descripcion: '', cuenta_destino_externa: '', api_externa_nombre: '', id_banco_destino: '', titular_destino: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [txRes, cuentasRes, bancosRes] = await Promise.all([
        api.get('/transacciones'),
        api.get('/cuentas'),
        api.get('/bancos'),
      ]);
      setTransacciones(Array.isArray(txRes.data) ? txRes.data : txRes.data.transacciones || []);
      setCuentas(Array.isArray(cuentasRes.data) ? cuentasRes.data : cuentasRes.data.cuentas || []);
      setBancos(Array.isArray(bancosRes.data) ? bancosRes.data : bancosRes.data.bancos || []);
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
      const endpoints = {
        deposito: '/transacciones/deposito',
        retiro: '/transacciones/retiro',
        interna: '/transacciones/transferencia-interna',
        externa: '/transacciones/transferencia-externa',
      };

      let payload = {
        monto: Number(form.monto),
        descripcion: form.descripcion,
      };

      if (tipo === 'deposito') {
        payload.id_cuenta_destino = Number(form.id_cuenta_destino);
      }

      if (tipo === 'retiro') {
        payload.id_cuenta_origen = Number(form.id_cuenta_origen);
      }

      if (tipo === 'interna') {
        payload.id_cuenta_origen = Number(form.id_cuenta_origen);
        payload.id_cuenta_destino = Number(form.id_cuenta_destino);
      }

      if (tipo === 'externa') {
        payload.id_cuenta_origen = Number(form.id_cuenta_origen);
        payload.api_externa_nombre = form.api_externa_nombre;
        payload.id_banco_destino = Number(form.id_banco_destino);
        payload.cuenta_destino_externa = form.cuenta_destino_externa;
        payload.titular_destino = form.titular_destino;
      }

      await api.post(endpoints[tipo], payload);

      setShowForm(false);

      setForm({
        id_cuenta_origen: '',
        id_cuenta_destino: '',
        monto: '',
        descripcion: '',
        cuenta_destino_externa: '',
        api_externa_nombre: '',
        id_banco_destino: '',
        titular_destino: ''
      });

      fetchData();
    } catch (err) {
      setFormError(err.response?.data?.mensaje || 'Error al procesar transacción');
    } finally {
      setSaving(false);
    }
  };

  const estadoColor = {
    COMPLETADA: 'badge-green', PENDIENTE: 'badge-yellow',
    RECHAZADA: 'badge-red', REVERSADA: 'badge-red', PROCESANDO: 'badge-yellow'
  };

  const tipoLabels = {
    deposito: 'Depósito', retiro: 'Retiro',
    interna: 'Transferencia interna', externa: 'Transferencia externa'
  };

  return (
    <div className="layout">
      <Navbar />
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1>Transacciones</h1>
            <p>Depósitos, retiros y transferencias</p>
          </div>
          <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancelar' : '+ Nueva transacción'}
          </button>
        </div>

        {showForm && (
          <form className="card form-card" onSubmit={handleSubmit}>
            <div className="tipo-tabs">
              {Object.entries(tipoLabels).map(([key, label]) => (
                <button key={key} type="button"
                  className={`tipo-tab ${tipo === key ? 'active' : ''}`}
                  onClick={() => setTipo(key)}>
                  {label}
                </button>
              ))}
            </div>

            <div className="form-grid" style={{ marginTop: '20px' }}>
              {/* Depósito */}
              {tipo === 'deposito' && (
                <div className="form-group">
                  <label>Cuenta destino *</label>
                  <select name="id_cuenta_destino" value={form.id_cuenta_destino} onChange={handleChange} required>
                    <option value="">Selecciona cuenta</option>
                    {cuentas.map(c => <option key={c.id_cuenta} value={c.id_cuenta}>{c.numero_cuenta}</option>)}
                  </select>
                </div>
              )}

              {/* Retiro */}
              {tipo === 'retiro' && (
                <div className="form-group">
                  <label>Cuenta origen *</label>
                  <select name="id_cuenta_origen" value={form.id_cuenta_origen} onChange={handleChange} required>
                    <option value="">Selecciona cuenta</option>
                    {cuentas.map(c => <option key={c.id_cuenta} value={c.id_cuenta}>{c.numero_cuenta}</option>)}
                  </select>
                </div>
              )}

              {/* Interna */}
              {tipo === 'interna' && (<>
                <div className="form-group">
                  <label>Cuenta origen *</label>
                  <select name="id_cuenta_origen" value={form.id_cuenta_origen} onChange={handleChange} required>
                    <option value="">Selecciona cuenta</option>
                    {cuentas.map(c => <option key={c.id_cuenta} value={c.id_cuenta}>{c.numero_cuenta}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Cuenta destino *</label>
                  <select name="id_cuenta_destino" value={form.id_cuenta_destino} onChange={handleChange} required>
                    <option value="">Selecciona cuenta</option>
                    {cuentas.map(c => <option key={c.id_cuenta} value={c.id_cuenta}>{c.numero_cuenta}</option>)}
                  </select>
                </div>
              </>)}

              {/* Externa */}
              {tipo === 'externa' && (<>
                <div className="form-group">
                  <label>Cuenta origen *</label>
                  <select name="id_cuenta_origen" value={form.id_cuenta_origen} onChange={handleChange} required>
                    <option value="">Selecciona cuenta</option>
                    {cuentas.map(c => <option key={c.id_cuenta} value={c.id_cuenta}>{c.numero_cuenta}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>API externa / Banco grupo</label>
                  <input
                    type="text"
                    name="api_externa_nombre"
                    value={form.api_externa_nombre}
                    onChange={handleChange}
                    placeholder="Ej: BANCO_GRUPO2"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Banco destino</label>
                  <select
                    name="id_banco_destino"
                    value={form.id_banco_destino}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Selecciona un banco</option>
                    {bancos.map((banco) => (
                      <option key={banco.id_banco} value={banco.id_banco}>
                        {banco.nombre} {banco.codigo_banco ? `(${banco.codigo_banco})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Cuenta destino externa</label>
                  <input
                    type="text"
                    name="cuenta_destino_externa"
                    value={form.cuenta_destino_externa}
                    onChange={handleChange}
                    placeholder="Ej: 998877"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Titular destino</label>
                  <input
                    type="text"
                    name="titular_destino"
                    value={form.titular_destino}
                    onChange={handleChange}
                    placeholder="Ej: Maria Lopez"
                    required
                  />
                </div>
              </>)}

              <div className="form-group">
                <label>Monto *</label>
                <input type="number" name="monto" value={form.monto} onChange={handleChange} min="0.01" step="0.01" required />
              </div>
              <div className="form-group">
                <label>Descripción</label>
                <input name="descripcion" value={form.descripcion} onChange={handleChange} />
              </div>
            </div>

            {formError && <p className="form-error">{formError}</p>}
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Procesando...' : 'Confirmar transacción'}
            </button>
          </form>
        )}

        <div className="card">
          {loading ? (
            <p className="text-muted">Cargando transacciones...</p>
          ) : error ? (
            <p className="form-error">{error}</p>
          ) : transacciones.length === 0 ? (
            <p className="text-muted">No hay transacciones registradas.</p>
          ) : (
            <table className="tabla">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tipo</th>
                  <th>Monto</th>
                  <th>Moneda</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {transacciones.map((t) => (
                  <tr key={t.id_transaccion}>
                    <td>#{t.id_transaccion}</td>
                    <td>{t.tipo_transaccion || t.id_tipo_transaccion}</td>
                    <td>{parseFloat(t.monto).toLocaleString('es-GT', { minimumFractionDigits: 2 })}</td>
                    <td>{t.moneda}</td>
                    <td>
                      <span className={`badge ${estadoColor[t.estado] || 'badge-yellow'}`}>
                        {t.estado}
                      </span>
                    </td>
                    <td>{new Date(t.fecha_transaccion).toLocaleDateString('es-GT')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
