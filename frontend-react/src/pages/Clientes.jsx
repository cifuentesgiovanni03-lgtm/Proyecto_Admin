import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import './Clientes.css';

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    nombres: '', apellidos: '', dpi: '', nit: '',
    fecha_nacimiento: '', telefono: '', correo: '', direccion: ''
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchClientes = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/clientes');
      setClientes(Array.isArray(data) ? data : data.clientes || []);
    } catch {
      setError('Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchClientes(); }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      await api.post('/clientes', form);
      setShowForm(false);
      setForm({ nombres: '', apellidos: '', dpi: '', nit: '',
        fecha_nacimiento: '', telefono: '', correo: '', direccion: '' });
      fetchClientes();
    } catch (err) {
      setFormError(err.response?.data?.mensaje || 'Error al crear cliente');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="layout">
      <Navbar />
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1>Clientes</h1>
            <p>Gestión de clientes registrados</p>
          </div>
          <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancelar' : '+ Nuevo cliente'}
          </button>
        </div>

        {showForm && (
          <form className="card form-card" onSubmit={handleSubmit}>
            <h2>Nuevo cliente</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Nombres *</label>
                <input name="nombres" value={form.nombres} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Apellidos *</label>
                <input name="apellidos" value={form.apellidos} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>DPI *</label>
                <input name="dpi" value={form.dpi} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>NIT</label>
                <input name="nit" value={form.nit} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Fecha de nacimiento</label>
                <input type="date" name="fecha_nacimiento" value={form.fecha_nacimiento} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Teléfono</label>
                <input name="telefono" value={form.telefono} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Correo</label>
                <input type="email" name="correo" value={form.correo} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Dirección</label>
                <input name="direccion" value={form.direccion} onChange={handleChange} />
              </div>
            </div>
            {formError && <p className="form-error">{formError}</p>}
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar cliente'}
            </button>
          </form>
        )}

        <div className="card">
          {loading ? (
            <p className="text-muted">Cargando clientes...</p>
          ) : error ? (
            <p className="form-error">{error}</p>
          ) : clientes.length === 0 ? (
            <p className="text-muted">No hay clientes registrados.</p>
          ) : (
            <table className="tabla">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>DPI</th>
                  <th>Teléfono</th>
                  <th>Correo</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {clientes.map((c) => (
                  <tr key={c.id_cliente}>
                    <td>{c.nombres} {c.apellidos}</td>
                    <td>{c.dpi}</td>
                    <td>{c.telefono || '-'}</td>
                    <td>{c.correo || '-'}</td>
                    <td>
                      <span className={`badge ${c.estado === 'ACTIVO' ? 'badge-green' : 'badge-red'}`}>
                        {c.estado}
                      </span>
                    </td>
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