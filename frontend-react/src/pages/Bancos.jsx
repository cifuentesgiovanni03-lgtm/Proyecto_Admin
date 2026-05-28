import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import './Bancos.css';

const initialForm = {
  nombre: '',
  codigo_banco: '',
  pais: 'Guatemala',
  api_url: '',
  api_token: '',
  api_json_template: '',
  api_auth_url: '',
  api_auth_email: '',
  api_auth_password: '',
  api_account_search_url: '',
  api_auth_header_name: '',
  api_auth_header_prefix: '',
};

export default function Bancos() {
  const [bancos, setBancos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(initialForm);

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

  const cleanPayload = () => {
    const payload = {
      nombre: form.nombre.trim(),
      codigo_banco: form.codigo_banco.trim(),
      pais: form.pais.trim() || 'Guatemala',
    };

    const optionalFields = [
      'api_url',
      'api_token',
      'api_json_template',
      'api_auth_url',
      'api_auth_email',
      'api_auth_password',
      'api_account_search_url',
      'api_auth_header_name',
      'api_auth_header_prefix',
    ];

    optionalFields.forEach((field) => {
      const value = form[field];

      if (typeof value === 'string' && value.trim() !== '') {
        payload[field] = value.trim();
      }
    });

    return payload;
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
    setFormError('');
    setShowForm(false);
  };

  const handleEdit = (banco) => {
    setEditingId(banco.id_banco);
    setForm({
      nombre: banco.nombre || '',
      codigo_banco: banco.codigo_banco || '',
      pais: banco.pais || 'Guatemala',
      api_url: banco.api_url || '',
      api_token: banco.api_token || '',
      api_json_template: banco.api_json_template || '',
      api_auth_url: banco.api_auth_url || '',
      api_auth_email: banco.api_auth_email || '',
      api_auth_password: banco.api_auth_password || '',
      api_account_search_url: banco.api_account_search_url || '',
      api_auth_header_name: banco.api_auth_header_name || '',
      api_auth_header_prefix: banco.api_auth_header_prefix || '',
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);

    try {
      if (editingId) {
        await api.put(`/bancos/${editingId}`, cleanPayload());
      } else {
        await api.post('/bancos', cleanPayload());
      }

      resetForm();
      fetchBancos();
    } catch (err) {
      setFormError(err.response?.data?.mensaje || 'Error al guardar banco');
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

          <button
            className="primary-btn"
            onClick={() => {
              if (showForm) resetForm();
              else setShowForm(true);
            }}
          >
            {showForm ? 'Cancelar' : '+ Nuevo banco'}
          </button>
        </div>

        {showForm && (
          <section className="form-card">
            <form onSubmit={handleSubmit} className="bancos-form">
              <div className="form-group">
                <label>Nombre del banco *</label>
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
                <label>Código del banco *</label>
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
                <label>País *</label>
                <input
                  type="text"
                  name="pais"
                  value={form.pais}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-divider">
                <h3>Configuración ACH / API externa</h3>
                <p>Campos usados para conectarse con otros bancos o grupos.</p>
              </div>

              <div className="form-group">
                <label>API URL transferencia</label>
                <input
                  type="url"
                  name="api_url"
                  value={form.api_url}
                  onChange={handleChange}
                  placeholder="Ej: https://api.grupo.com/transferencias"
                />
              </div>

              <div className="form-group">
                <label>API token</label>
                <input
                  type="text"
                  name="api_token"
                  value={form.api_token}
                  onChange={handleChange}
                  placeholder="Token si aplica"
                />
              </div>

              <div className="form-group">
                <label>Header auth name</label>
                <input
                  type="text"
                  name="api_auth_header_name"
                  value={form.api_auth_header_name}
                  onChange={handleChange}
                  placeholder="Ej: X-API-Key"
                />
              </div>

              <div className="form-group">
                <label>Header auth prefix</label>
                <input
                  type="text"
                  name="api_auth_header_prefix"
                  value={form.api_auth_header_prefix}
                  onChange={handleChange}
                  placeholder="Ej: Bearer o vacío"
                />
              </div>

              <div className="form-group">
                <label>URL login externo</label>
                <input
                  type="url"
                  name="api_auth_url"
                  value={form.api_auth_url}
                  onChange={handleChange}
                  placeholder="Ej: https://api.grupo.com/auth/login"
                />
              </div>

              <div className="form-group">
                <label>Email login externo</label>
                <input
                  type="email"
                  name="api_auth_email"
                  value={form.api_auth_email}
                  onChange={handleChange}
                  placeholder="Ej: bancoexterno@grupo.com"
                />
              </div>

              <div className="form-group">
                <label>Password login externo</label>
                <input
                  type="password"
                  name="api_auth_password"
                  value={form.api_auth_password}
                  onChange={handleChange}
                  placeholder={editingId ? 'Déjalo vacío si no quieres cambiarlo' : 'Password del banco externo'}
                />
              </div>

              <div className="form-group">
                <label>URL búsqueda cuenta</label>
                <input
                  type="text"
                  name="api_account_search_url"
                  value={form.api_account_search_url}
                  onChange={handleChange}
                  placeholder="Ej: https://api.grupo.com/cuentas/search/{{numero_cuenta}}"
                />
              </div>

              <div className="form-group textarea-full">
                <label>Template JSON</label>
                <textarea
                  name="api_json_template"
                  value={form.api_json_template}
                  onChange={handleChange}
                  placeholder='Ej: {"monto":"{{monto}}","cuenta":"{{cuenta_destino_externa}}"}'
                  rows="6"
                />
              </div>

              {formError && <p className="form-error textarea-full">{formError}</p>}

              <button className="primary-btn" type="submit" disabled={saving}>
                {saving ? 'Guardando...' : editingId ? 'Actualizar banco' : 'Guardar banco'}
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
                  <th>API</th>
                  <th>Auth</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {bancos.map((banco) => (
                  <tr key={banco.id_banco}>
                    <td>#{banco.id_banco}</td>
                    <td>{banco.nombre}</td>
                    <td>{banco.codigo_banco}</td>
                    <td>{banco.pais}</td>
                    <td>{banco.api_url ? 'Configurada' : 'No configurada'}</td>
                    <td>{banco.api_auth_url ? 'Con login' : 'Sin login'}</td>
                    <td>
                      <button className="edit-btn" onClick={() => handleEdit(banco)}>
                        Editar
                      </button>
                    </td>
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
