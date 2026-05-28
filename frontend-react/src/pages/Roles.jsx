import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import './Roles.css';

export default function Roles() {
  const [roles, setRoles] = useState([]);
  const [permisos, setPermisos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [showPermisos, setShowPermisos] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [selectedPermisos, setSelectedPermisos] = useState([]);

  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);

      const [rolesRes, permisosRes] = await Promise.all([
        api.get('/roles'),
        api.get('/permisos'),
      ]);

      setRoles(Array.isArray(rolesRes.data) ? rolesRes.data : rolesRes.data.roles || []);
      setPermisos(Array.isArray(permisosRes.data) ? permisosRes.data : permisosRes.data.permisos || []);
    } catch {
      setError('Error al cargar roles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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

  const handleEdit = (rol) => {
    setForm({
      nombre: rol.nombre || '',
      descripcion: rol.descripcion || '',
    });

    setEditingId(rol.id_rol);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);

    try {
      if (editingId) {
        await api.put(`/roles/${editingId}`, form);
      } else {
        await api.post('/roles', form);
      }

      resetForm();
      fetchData();
    } catch (err) {
      setFormError(err.response?.data?.mensaje || 'Error al guardar rol');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmar = window.confirm('¿Seguro que deseas eliminar este rol?');

    if (!confirmar) return;

    try {
      await api.delete(`/roles/${id}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.mensaje || 'Error al eliminar rol');
    }
  };

  const openPermisosModal = (rol) => {
    setSelectedRoleId(rol.id_rol);

    const permisosActuales = Array.isArray(rol.permisos)
      ? rol.permisos.map((permiso) => permiso.id_permiso)
      : [];

    setSelectedPermisos(permisosActuales);
    setShowPermisos(true);
  };

  const togglePermiso = (idPermiso) => {
    setSelectedPermisos((prev) =>
      prev.includes(idPermiso)
        ? prev.filter((id) => id !== idPermiso)
        : [...prev, idPermiso]
    );
  };

  const guardarPermisosRol = async () => {
    try {
      setSaving(true);

      await api.post(`/roles/${selectedRoleId}/permisos`, {
        permisos: selectedPermisos,
      });

      setShowPermisos(false);
      setSelectedRoleId(null);
      setSelectedPermisos([]);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.mensaje || 'Error al asignar permisos');
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
            <h1>Roles</h1>
            <p>Gestión de roles y asignación de permisos</p>
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
            {showForm ? 'Cancelar' : '+ Nuevo rol'}
          </button>
        </div>

        {showForm && (
          <section className="form-card">
            <form onSubmit={handleSubmit} className="roles-form">
              <div className="form-group">
                <label>Nombre del rol</label>
                <input
                  type="text"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  placeholder="Ej: CAJERO"
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
                  placeholder="Ej: Registro de operaciones"
                  required
                />
              </div>

              {formError && <p className="form-error">{formError}</p>}

              <button className="primary-btn" type="submit" disabled={saving}>
                {saving ? 'Guardando...' : editingId ? 'Actualizar rol' : 'Guardar rol'}
              </button>
            </form>
          </section>
        )}

        <section className="table-card">
          {loading ? (
            <p className="text-muted">Cargando roles...</p>
          ) : error ? (
            <p className="form-error">{error}</p>
          ) : roles.length === 0 ? (
            <p className="text-muted">No hay roles registrados.</p>
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
                {roles.map((rol) => (
                  <tr key={rol.id_rol}>
                    <td>#{rol.id_rol}</td>
                    <td>{rol.nombre}</td>
                    <td>{rol.descripcion}</td>
                    <td>
                      <div className="actions">
                        <button className="secondary-btn" onClick={() => handleEdit(rol)}>
                          Editar
                        </button>

                        <button className="secondary-btn" onClick={() => openPermisosModal(rol)}>
                          Permisos
                        </button>

                        <button className="danger-btn" onClick={() => handleDelete(rol.id_rol)}>
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

        {showPermisos && (
          <div className="modal-backdrop">
            <div className="modal-card">
              <h2>Asignar permisos</h2>
              <p>Selecciona los permisos para este rol.</p>

              <div className="permisos-list">
                {permisos.map((permiso) => (
                  <label key={permiso.id_permiso} className="permiso-item">
                    <input
                      type="checkbox"
                      checked={selectedPermisos.includes(permiso.id_permiso)}
                      onChange={() => togglePermiso(permiso.id_permiso)}
                    />
                    <span>
                      <strong>{permiso.nombre}</strong>
                      <small>{permiso.descripcion}</small>
                    </span>
                  </label>
                ))}
              </div>

              <div className="modal-actions">
                <button className="secondary-btn" onClick={() => setShowPermisos(false)}>
                  Cancelar
                </button>

                <button className="primary-btn" onClick={guardarPermisosRol} disabled={saving}>
                  {saving ? 'Guardando...' : 'Guardar permisos'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}