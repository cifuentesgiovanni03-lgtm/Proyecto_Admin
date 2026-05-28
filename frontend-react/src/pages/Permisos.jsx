import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import './Permisos.css';

export default function Permisos() {
  const [permisos, setPermisos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
  });

  const fetchPermisos = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/permisos');
      setPermisos(Array.isArray(data) ? data : data.permisos || []);
    } catch {
      setError('Error al cargar permisos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermisos();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({
      nombre: '',
      descripcion: '',
    });
    setEditingId(null);
    setFormError('');
    setShowForm(false);
  };

  const handleEdit = (permiso) => {
    setForm({
      nombre: permiso.nombre || '',
      descripcion: permiso.descripcion || '',
    });
    setEditingId(permiso.id_permiso);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);

    try {
      if (editingId) {
        await api.put(`/permisos/${editingId}`, form);
      } else {
        await api.post('/permisos', form);
      }

      resetForm();
      fetchPermisos();
    } catch (err) {
      setFormError(err.response?.data?.mensaje || 'Error al guardar permiso');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmar = window.confirm('¿Seguro que deseas eliminar este permiso?');

    if (!confirmar) return;

    try {
      await api.delete(`/permisos/${id}`);
      fetchPermisos();
    } catch (err) {
      alert(err.response?.data?.mensaje || 'Error al eliminar permiso');
    }
  };

  return (
    <div className="app-layout">
      <Navbar />

      <main className="page-content">
        <div className="page-header">
          <div>
            <h1>Permisos</h1>
            <p>Gestión de permisos disponibles para los roles del sistema</p>
          </div>

          <button
            className="primary-btn"
            onClick={() => {
              if (showForm) {
                resetForm();
              } else {
                setShowForm(true);
              }
            }}
          >
            {showForm ? 'Cancelar' : '+ Nuevo permiso'}
          </button>
        </div>

        {showForm && (
          <section className="form-card">
            <form onSubmit={handleSubmit} className="permisos-form">
              <div className="form-group">
                <label>Nombre del permiso</label>
                <input
                  type="text"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  placeholder="Ej: ELIMINAR_CUENTA"
                  required
                />
              </div>

              <div className="form-group">
                <label>Descripción</label>
                <input
                  type="text"
                  name="descripcion"
                  value={form.descripcion}
                  onChange={handleChange}
                  placeholder="Ej: Permite eliminar cuentas"
                  required
                />
              </div>

              {formError && <p className="form-error">{formError}</p>}

              <button className="primary-btn" type="submit" disabled={saving}>
                {saving ? 'Guardando...' : editingId ? 'Actualizar permiso' : 'Guardar permiso'}
              </button>
            </form>
          </section>
        )}

        <section className="table-card">
          {loading ? (
            <p className="text-muted">Cargando permisos...</p>
          ) : error ? (
            <p className="form-error">{error}</p>
          ) : permisos.length === 0 ? (
            <p className="text-muted">No hay permisos registrados.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Descripción</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {permisos.map((permiso) => (
                  <tr key={permiso.id_permiso}>
                    <td>#{permiso.id_permiso}</td>
                    <td>{permiso.nombre}</td>
                    <td>{permiso.descripcion}</td>
                    <td>
                      <div className="actions">
                        <button className="secondary-btn" onClick={() => handleEdit(permiso)}>
                          Editar
                        </button>
                        <button className="danger-btn" onClick={() => handleDelete(permiso.id_permiso)}>
                          Eliminar
                        </button>
                      </div>
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