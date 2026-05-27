import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import './TransferenciaEntrante.css';

export default function TransferenciaEntrante() {
  const [cuentas, setCuentas] = useState([]);
  const [bancos, setBancos] = useState([]);
  const [saving, setSaving] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    id_cuenta_destino: '',
    monto: '',
    id_banco_origen: '',
    cuenta_origen_externa: '',
    titular_origen: '',
    codigo_referencia_externa: '',
  });

  const fetchData = async () => {
    try {
      const [cuentasRes, bancosRes] = await Promise.all([
        api.get('/cuentas'),
        api.get('/bancos'),
      ]);

      setCuentas(Array.isArray(cuentasRes.data) ? cuentasRes.data : cuentasRes.data.cuentas || []);
      setBancos(Array.isArray(bancosRes.data) ? bancosRes.data : bancosRes.data.bancos || []);
    } catch {
      setError('Error al cargar datos');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMensaje('');
    setError('');

    try {
      await api.post('/transacciones/transferencia-entrante', {
        id_cuenta_destino: Number(form.id_cuenta_destino),
        monto: Number(form.monto),
        id_banco_origen: Number(form.id_banco_origen),
        cuenta_origen_externa: form.cuenta_origen_externa,
        titular_origen: form.titular_origen,
        codigo_referencia_externa: form.codigo_referencia_externa,
      });

      setMensaje('Transferencia entrante registrada correctamente');

      setForm({
        id_cuenta_destino: '',
        monto: '',
        id_banco_origen: '',
        cuenta_origen_externa: '',
        titular_origen: '',
        codigo_referencia_externa: '',
      });
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al registrar transferencia entrante');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="app-layout">
      <Navbar />

      <main className="page-content">
        <div className="page-header">
          <div>
            <h1>Transferencia entrante</h1>
            <p>Simula una transferencia recibida desde otro banco o grupo</p>
          </div>
        </div>

        <section className="form-card">
          <form onSubmit={handleSubmit} className="transferencia-form">
            <div className="form-group">
              <label>Cuenta destino</label>
              <select
                name="id_cuenta_destino"
                value={form.id_cuenta_destino}
                onChange={handleChange}
                required
              >
                <option value="">Selecciona una cuenta</option>
                {cuentas.map((cuenta) => (
                  <option key={cuenta.id_cuenta} value={cuenta.id_cuenta}>
                    {cuenta.numero_cuenta} - {cuenta.titular || cuenta.cliente || 'Sin titular'}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Monto</label>
              <input
                type="number"
                name="monto"
                value={form.monto}
                onChange={handleChange}
                placeholder="Ej: 500"
                min="1"
                required
              />
            </div>

            <div className="form-group">
              <label>Banco origen</label>
              <select
                name="id_banco_origen"
                value={form.id_banco_origen}
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
              <label>Cuenta origen externa</label>
              <input
                type="text"
                name="cuenta_origen_externa"
                value={form.cuenta_origen_externa}
                onChange={handleChange}
                placeholder="Ej: 123456"
                required
              />
            </div>

            <div className="form-group">
              <label>Titular origen</label>
              <input
                type="text"
                name="titular_origen"
                value={form.titular_origen}
                onChange={handleChange}
                placeholder="Ej: Juan Perez"
                required
              />
            </div>

            <div className="form-group">
              <label>Código referencia externa</label>
              <input
                type="text"
                name="codigo_referencia_externa"
                value={form.codigo_referencia_externa}
                onChange={handleChange}
                placeholder="Ej: REF-UNICO-001"
                required
              />
            </div>

            {mensaje && <p className="success-message">{mensaje}</p>}
            {error && <p className="form-error">{error}</p>}

            <button className="primary-btn" type="submit" disabled={saving}>
              {saving ? 'Registrando...' : 'Registrar transferencia'}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}