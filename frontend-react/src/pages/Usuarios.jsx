import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import './Usuarios.css';

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordUserId, setPasswordUserId] = useState(null);
  const [newPassword, setNewPassword] = useState('');

  const [form, setForm] = useState({
    username: '',
    password: '',
    nombre_completo: '',
    correo: '',
    id_rol: '',
    estado: 'ACTIVO',
  });

  const fetchData = async () => {
    try {
      setLoading(true);

      const [usuariosRes, rolesRes] = await Promise.all([
        api.get('/usuarios'),
        api.get('/roles'),
      ]);

      setUsuarios(Array.isArray(usuariosRes.data) ? usuariosRes.data : usuariosRes.data.usuarios || []);
      setRoles(Array.isArray(rolesRes.data) ? rolesRes.data : rolesRes.data.roles || []);
    } catch {
      setError('Error al cargar usuarios');
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
      username: '',
      password: '',
      nombre_completo: '',
      correo: '',
      id_rol: '',
      estado: 'ACTIVO',
    });
    setEditingId(null);
    setFormError('');
    setShowForm(false);
  };

  const handleEdit = (usuario) => {
    setForm({
      username: usuario.username || '',
      password: '',
      nombre_completo: usuario.nombre_completo || '',
      correo: usuario.correo || '',
      id_rol: usuario.id_rol || '',
      estado: usuario.estado || 'ACTIVO',
    });

    setEditingId(usuario.id_usuario);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);

    try {
      if (editingId) {
        await api.put(`/usuarios/${editingId}`, {
          nombre_completo: form.nombre_completo,
          correo: form.correo,
          id_rol: Number(form.id_rol),
          estado: form.estado,
        });
      } else {
        await api.post('/usuarios', {
          username: form.username,
          password: form.password,
          nombre_completo: form.nombre_completo,
          correo: form.correo,
          id_rol: Number(form.id_rol),
        });
      }

      resetForm();
      fetchData();
    } catch (err) {
      setFormError(err.response?.data?.mensaje || 'Error al guardar usuario');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmar = window.confirm('¿Seguro que deseas eliminar este usuario?');

    if (!confirmar) return;

    try {
      await api.delete(`/usuarios/${id}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.mensaje || 'Error al eliminar usuario');
    }
  };

  const openPasswordForm = (usuario) => {
    setPasswordUserId(usuario.id_usuario);
    setNewPassword('');
    setShowPasswordForm(true);
  };

  const handleChangePassword = async () => {
    if (!newPassword.trim()) {
      alert('Ingresa una nueva contraseña');
      return;
    }

    try {
      setSaving(true);

      await api.put(`/usuarios/${passwordUserId}/password`, {
        password: newPassword,
      });

      setShowPasswordForm(false);
      setPasswordUserId(null);
      setNewPassword('');
      alert('Contraseña actualizada correctamente');
    } catch (err) {
      alert(err.response?.data?.mensaje || 'Error al cambiar contraseña');
    } finally {
      setSaving(false);
    }
  };

  const getRolNombre = (usuario) => {
    if (usuario.rol) return usuario.rol;
    if (usuario.nombre_rol) return usuario.nombre_rol;

    const rol = roles.find((r) => r.id_rol === usuario.id_rol);
    return rol ? rol.nombre : 'Sin rol';
  };

  return (
    <div className="app-layout">
      <Navbar />

      <main className="page-content">
        <div className="page-header">
          <div>
            <h1>Usuarios</h1>
            <p>Gestión de usuarios del sistema bancario</p>
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
            {showForm ? 'Cancelar' : '+ Nuevo usuario'}
          </button>
        </div>

        {showForm && (
          <section className="form-card">
            <form onSubmit={handleSubmit} className="usuarios-form">
              {!editingId && (
                <>
                  <div className="form-group">
                    <label>Usuario</label>
                    <input
                      type="text"
                      name="username"
                      value={form.username}
                      onChange={handleChange}
                      placeholder="Ej: operador1"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Contraseña</label>
                    <input
                      type="password"
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Ej: Pass1234"
                      required
                    />
                  </div>
                </>
              )}

              <div className="form-group">
                <label>Nombre completo</label>
                <input
                  type="text"
                  name="nombre_completo"
                  value={form.nombre_completo}
                  onChange={handleChange}
                  placeholder="Ej: Operador Uno"
                  required
                />
              </div>

              <div className="form-group">
                <label>Correo</label>
                <input
                  type="email"
                  name="correo"
                  value={form.correo}
                  onChange={handleChange}
                  placeholder="Ej: operador@email.com"
                  required
                />
              </div>

              <div className="form-group">
                <label>Rol</label>
                <select name="id_rol" value={form.id_rol} onChange={handleChange} required>
                  <option value="">Selecciona un rol</option>
                  {roles.map((rol) => (
                    <option key={rol.id_rol} value={rol.id_rol}>
                      {rol.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {editingId && (
                <div className="form-group">
                  <label>Estado</label>
                  <select name="estado" value={form.estado} onChange={handleChange}>
                    <option value="ACTIVO">ACTIVO</option>
                    <option value="INACTIVO">INACTIVO</option>
                  </select>
                </div>
              )}

              {formError && <p className="form-error">{formError}</p>}

              <button className="primary-btn" type="submit" disabled={saving}>
                {saving ? 'Guardando...' : editingId ? 'Actualizar usuario' : 'Guardar usuario'}
              </button>
            </form>
          </section>
        )}

        <section className="table-card">
          {loading ? (
            <p className="text-muted">Cargando usuarios...</p>
          ) : error ? (
            <p className="form-error">{error}</p>
          ) : usuarios.length === 0 ? (
            <p className="text-muted">No hay usuarios registrados.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Usuario</th>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {usuarios.map((usuario) => (
                  <tr key={usuario.id_usuario}>
                    <td>#{usuario.id_usuario}</td>
                    <td>{usuario.username}</td>
                    <td>{usuario.nombre_completo}</td>
                    <td>{usuario.correo}</td>
                    <td>{getRolNombre(usuario)}</td>
                    <td>
                      <span className={`status-badge ${usuario.estado === 'ACTIVO' ? 'active' : 'inactive'}`}>
                        {usuario.estado || 'ACTIVO'}
                      </span>
                    </td>
                    <td>
                      <div className="actions">
                        <button className="secondary-btn" onClick={() => handleEdit(usuario)}>
                          Editar
                        </button>

                        <button className="secondary-btn" onClick={() => openPasswordForm(usuario)}>
                          Contraseña
                        </button>

                        <button className="danger-btn" onClick={() => handleDelete(usuario.id_usuario)}>
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

        {showPasswordForm && (
          <div className="modal-backdrop">
            <div className="modal-card">
              <h2>Cambiar contraseña</h2>
              <p>Ingresa la nueva contraseña del usuario.</p>

              <div className="form-group">
                <label>Nueva contraseña</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Ej: NuevaPass123"
                />
              </div>

              <div className="modal-actions">
                <button className="secondary-btn" onClick={() => setShowPasswordForm(false)}>
                  Cancelar
                </button>

                <button className="primary-btn" onClick={handleChangePassword} disabled={saving}>
                  {saving ? 'Guardando...' : 'Guardar contraseña'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}