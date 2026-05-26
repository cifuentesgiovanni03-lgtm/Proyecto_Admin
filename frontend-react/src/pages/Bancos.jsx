import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import './Bancos.css';

export default function Bancos() {
  const [bancos, setBancos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    nombre: '',
    codigo_banco: '',
    pais: 'Guatemala',
  });

  const fetchBancos = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/bancos');
      setBancos(Array.isArray(data) ? data : data.bancos || []);
    } catch {
      setError('Error al cargar bancos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBancos();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);

    try {
      await api.post('/bancos', form);

      setForm({
        nombre: '',
        codigo_banco: '',
        pais: 'Guatemala',
      });

      setShowForm(false);
      fetchBancos();
    } catch (err) {
      setFormError(err.response?.data?.mensaje || 'Error al crear banco');
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
            <h1>Bancos</h1>
            <p>Gestión de bancos disponibles para transferencias externas</p>
          </div>

          <button className="primary-btn" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancelar' : '+ Nuevo banco'}
          </button>
        </div>

        {showForm && (
          <section className="form-card">
            <form onSubmit={handleSubmit} className="bancos-form">
              <div className="form-group">
                <label>Nombre del banco</label>
                <input
                  type="text"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  placeholder="Ej: Banco Demo"
                  required
                />
              </div>

              <div className="form-group">
                <label>Código del banco</label>
                <input
                  type="text"
                  name="codigo_banco"
                  value={form.codigo_banco}
                  onChange={handleChange}
                  placeholder="Ej: BDEMO"
                  required
                />
              </div>

              <div className="form-group">
                <label>País</label>
                <input
                  type="text"
                  name="pais"
                  value={form.pais}
                  onChange={handleChange}
                  required
                />
              </div>

              {formError && <p className="form-error">{formError}</p>}

              <button className="primary-btn" type="submit" disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar banco'}
              </button>
            </form>
          </section>
        )}

        <section className="table-card">
          {loading ? (
            <p className="text-muted">Cargando bancos...</p>
          ) : error ? (
            <p className="form-error">{error}</p>
          ) : bancos.length === 0 ? (
            <p className="text-muted">No hay bancos registrados.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Código</th>
                  <th>País</th>
                </tr>
              </thead>
              <tbody>
                {bancos.map((banco) => (
                  <tr key={banco.id_banco}>
                    <td>#{banco.id_banco}</td>
                    <td>{banco.nombre}</td>
                    <td>{banco.codigo_banco}</td>
                    <td>{banco.pais}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </main>
    </div>
  );
}