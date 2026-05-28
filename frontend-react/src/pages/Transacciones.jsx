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
  const [tipo, setTipo] = useState('deposito');
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [validatingAccount, setValidatingAccount] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const initialForm = {
    id_cuenta_origen: '',
    id_cuenta_destino: '',
    monto: '',
    descripcion: '',
    cuenta_destino_externa: '',
    id_cuenta_destino_externa: '',
    api_externa_nombre: '',
    id_banco_destino: '',
    titular_destino: '',
  };

  const [form, setForm] = useState(initialForm);

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

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'cuenta_destino_externa') {
      setForm({ ...form, cuenta_destino_externa: value, id_cuenta_destino_externa: '' });
      setFormSuccess('');
      return;
    }

    setForm({ ...form, [name]: value });
  };

  const getSelectedBanco = () => {
    return bancos.find((banco) => String(banco.id_banco) === String(form.id_banco_destino));
  };

  const getTokenFromResponse = (data) => {
    return (
      data?.token ||
      data?.access_token ||
      data?.data?.token ||
      data?.data?.access_token ||
      ''
    );
  };

  const validarCuentaExterna = async () => {
    setFormError('');
    setFormSuccess('');

    if (!form.id_banco_destino) {
      setFormError('Selecciona un banco destino primero');
      return;
    }

    if (!form.cuenta_destino_externa) {
      setFormError('Ingresa la cuenta destino externa primero');
      return;
    }

    try {
      setValidatingAccount(true);

      const { data: resp } = await api.post('/transacciones/validar-cuenta-externa', {
        id_banco_destino: Number(form.id_banco_destino),
        cuenta_externa: form.cuenta_destino_externa,
      });

      const cuenta = resp?.cuenta || resp?.data || resp;
      const idCuentaDestino =
        resp?.id_cuenta_destino ||
        cuenta?.id ||
        cuenta?.id_cuenta ||
        cuenta?.idCuenta ||
        null;

      const updates = {};

      if (idCuentaDestino) {
        updates.id_cuenta_destino_externa = String(idCuentaDestino);
      }

      if (!form.titular_destino) {
        updates.titular_destino =
          cuenta?.titular ||
          cuenta?.nombreTitular ||
          cuenta?.cliente?.nombres ||
          cuenta?.cliente?.nombre ||
          cuenta?.nombre ||
          '';
      }

      setForm(prev => ({ ...prev, ...updates }));

      setFormSuccess(
        'Cuenta validada correctamente' +
        (idCuentaDestino ? `. ID destino: ${idCuentaDestino}` : '')
      );
    } catch (err) {
      setFormError(
        err.response?.data?.mensaje ||
        err.response?.data?.message ||
        err.message ||
        'Error al validar cuenta externa'
      );
    } finally {
      setValidatingAccount(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
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
        payload.id_cuenta_destino = form.id_cuenta_destino_externa
          ? Number(form.id_cuenta_destino_externa)
          : null;
        payload.titular_destino = form.titular_destino;
      }

      await api.post(endpoints[tipo], payload);

      setShowForm(false);
      setForm(initialForm);
      fetchData();
    } catch (err) {
      setFormError(err.response?.data?.mensaje || 'Error al procesar transacción');
    } finally {
      setSaving(false);
    }
  };

  const estadoColor = {
    COMPLETADA: 'badge-green',
    PENDIENTE: 'badge-yellow',
    RECHAZADA: 'badge-red',
    REVERSADA: 'badge-red',
    PROCESANDO: 'badge-yellow',
  };

  const tipoLabels = {
    deposito: 'Depósito',
    retiro: 'Retiro',
    interna: 'Transferencia interna',
    externa: 'Transferencia externa',
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
                <button
                  key={key}
                  type="button"
                  className={`tipo-tab ${tipo === key ? 'active' : ''}`}
                  onClick={() => setTipo(key)}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="form-grid" style={{ marginTop: '20px' }}>
              {tipo === 'deposito' && (
                <div className="form-group">
                  <label>Cuenta destino *</label>
                  <select name="id_cuenta_destino" value={form.id_cuenta_destino} onChange={handleChange} required>
                    <option value="">Selecciona cuenta</option>
                    {cuentas.map(c => <option key={c.id_cuenta} value={c.id_cuenta}>{c.numero_cuenta}</option>)}
                  </select>
                </div>
              )}

              {tipo === 'retiro' && (
                <div className="form-group">
                  <label>Cuenta origen *</label>
                  <select name="id_cuenta_origen" value={form.id_cuenta_origen} onChange={handleChange} required>
                    <option value="">Selecciona cuenta</option>
                    {cuentas.map(c => <option key={c.id_cuenta} value={c.id_cuenta}>{c.numero_cuenta}</option>)}
                  </select>
                </div>
              )}

              {tipo === 'interna' && (
                <>
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
                </>
              )}

              {tipo === 'externa' && (
                <>
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
                      placeholder="Ej: URBANK"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Banco destino</label>
                    <select name="id_banco_destino" value={form.id_banco_destino} onChange={handleChange} required>
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
                      placeholder="Ej: 00000000000000"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>ID cuenta destino</label>
                    <input
                      type="number"
                      name="id_cuenta_destino_externa"
                      value={form.id_cuenta_destino_externa}
                      onChange={handleChange}
                      placeholder="Se autocompleta al validar"
                    />
                  </div>

                  <div className="form-group">
                    <label>Titular destino</label>
                    <input
                      type="text"
                      name="titular_destino"
                      value={form.titular_destino}
                      onChange={handleChange}
                      placeholder="Ej: pruebas interbancarias"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Validación externa</label>
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={validarCuentaExterna}
                      disabled={validatingAccount}
                    >
                      {validatingAccount ? 'Validando...' : 'Validar cuenta'}
                    </button>
                  </div>
                </>
              )}

              <div className="form-group">
                <label>Monto *</label>
                <input
                  type="number"
                  name="monto"
                  value={form.monto}
                  onChange={handleChange}
                  min="0.01"
                  step="0.01"
                  required
                />
              </div>

              <div className="form-group">
                <label>Descripción</label>
                <input name="descripcion" value={form.descripcion} onChange={handleChange} />
              </div>
            </div>

            {formError && <p className="form-error">{formError}</p>}
            {formSuccess && <p style={{ color: '#16a34a', fontWeight: 700 }}>{formSuccess}</p>}

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
            <table className="tabla movimientos-tabla">
              <thead>
                <tr>
                  <th>Movimiento</th>
                  <th>Monto</th>
                  <th>Saldo final</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                </tr>
              </thead>

              <tbody>
                {transacciones.map((t) => {
                  const fecha = t.fecha_transaccion || t.fecha || t.created_at;
                  const monto = Number(t.monto || 0);
                  const tipoId = Number(t.id_tipo_transaccion || 0);
                  const tipoTexto = String(t.tipo_transaccion || '').toLowerCase();

                  let movimiento = t.tipo_transaccion || `Tipo ${tipoId}`;
                  let signo = '';
                  let montoClass = 'monto-neutral';

                  if (tipoId === 1 || tipoTexto.includes('deposito') || tipoTexto.includes('depósito')) {
                    movimiento = 'Depósito';
                    signo = '+';
                    montoClass = 'monto-positivo';
                  } else if (tipoId === 2 || tipoTexto.includes('retiro')) {
                    movimiento = 'Retiro';
                    signo = '-';
                    montoClass = 'monto-negativo';
                  } else if (tipoId === 3 || tipoTexto.includes('interna')) {
                    movimiento = 'Transferencia interna';
                    signo = '-';
                    montoClass = 'monto-negativo';
                  } else if (tipoId === 4 || tipoTexto.includes('externa')) {
                    movimiento = 'ACH enviada';
                    signo = '-';
                    montoClass = 'monto-negativo';
                  } else if (tipoId === 5 || tipoTexto.includes('entrante') || tipoTexto.includes('recibida')) {
                    movimiento = 'ACH recibida';
                    signo = '+';
                    montoClass = 'monto-positivo';
                  }

                  const referencia =
                    t.codigo_referencia ||
                    t.codigo_referencia_interna ||
                    t.referencia ||
                    t.descripcion ||
                    `TRX-${t.id_transaccion}`;

                  const saldoFinal =
                    t.saldo_final ||
                    t.saldo_nuevo ||
                    t.saldo_origen_nuevo ||
                    t.saldo_destino_nuevo ||
                    null;

                  const cuentaOrigen =
                    t.numero_cuenta_origen ||
                    t.cuenta_origen ||
                    t.cuenta_origen_interna ||
                    '';

                  const cuentaDestino =
                    t.numero_cuenta_destino ||
                    t.cuenta_destino ||
                    t.cuenta_destino_interna ||
                    '';

                  const cuentaExterna =
                    t.cuenta_destino_externa ||
                    t.cuenta_externa ||
                    t.numeroCuentaDestino ||
                    t.numero_cuenta_externa ||
                    '';

                  const cuentaAfectada =
                    t.cuenta_afectada ||
                    t.numero_cuenta_afectada ||
                    t.numero_cuenta ||
                    '';

                  let detalleCuenta = '';

                  if (tipoId === 1) {
                    detalleCuenta = `Cuenta acreditada: ${cuentaDestino || cuentaAfectada || '-'}`;
                  } else if (tipoId === 2) {
                    detalleCuenta = `Cuenta debitada: ${cuentaOrigen || cuentaAfectada || '-'}`;
                  } else if (tipoId === 3) {
                    detalleCuenta = `Origen: ${cuentaOrigen || '-'} → Destino: ${cuentaDestino || '-'}`;
                  } else if (tipoId === 4) {
                    detalleCuenta = `Origen: ${cuentaOrigen || cuentaAfectada || '-'} → Externa: ${cuentaExterna || cuentaDestino || '-'}`;
                  } else if (tipoId === 5) {
                    detalleCuenta = `Cuenta acreditada: ${cuentaDestino || cuentaAfectada || '-'}`;
                  }

                  return (
                    <tr key={t.id_transaccion}>
                      <td>
                        <div className="movimiento-info">
                          <strong>{movimiento}</strong>
                          <span>{referencia}</span>
                          {detalleCuenta && <span>{detalleCuenta}</span>}
                        </div>
                      </td>

                      <td className={montoClass}>
                        {signo}Q {monto.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                      </td>

                      <td>
                        {saldoFinal !== null
                          ? `Q ${Number(saldoFinal).toLocaleString('es-GT', { minimumFractionDigits: 2 })}`
                          : '-'}
                      </td>

                      <td>
                        <span className={`badge ${estadoColor[t.estado] || 'badge-yellow'}`}>
                          {t.estado}
                        </span>
                      </td>

                      <td>{fecha ? new Date(fecha).toLocaleString('es-GT') : '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
