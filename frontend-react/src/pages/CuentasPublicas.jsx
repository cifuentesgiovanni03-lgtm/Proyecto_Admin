import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import './CuentasPublicas.css';

export default function CuentasPublicas() {
  const [banco, setBanco] = useState('');
  const [cuentas, setCuentas] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCuentasPublicas = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/public/cuentas-disponibles');

      setBanco(data.banco || 'Banco no especificado');
      setTotal(data.total_cuentas || 0);
      setCuentas(Array.isArray(data.cuentas) ? data.cuentas : []);
    } catch {
      setError('Error al cargar cuentas públicas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCuentasPublicas();
  }, []);

  return (
    <div className="app-layout">
      <Navbar />

      <main className="page-content">
        <div className="page-header">
          <div>
            <h1>Cuentas públicas</h1>
            <p>Cuentas disponibles para recibir transferencias externas</p>
          </div>

          <button className="primary-btn" onClick={fetchCuentasPublicas}>
            Actualizar
          </button>
        </div>

        <section className="summary-grid">
          <div className="summary-card">
            <span>Banco</span>
            <strong>{banco || '-'}</strong>
          </div>

          <div className="summary-card">
            <span>Total cuentas</span>
            <strong>{total}</strong>
          </div>
        </section>

        <section className="table-card">
          {loading ? (
            <p className="text-muted">Cargando cuentas públicas...</p>
          ) : error ? (
            <p className="form-error">{error}</p>
          ) : cuentas.length === 0 ? (
            <p className="text-muted">No hay cuentas públicas disponibles.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>ID cuenta</th>
                  <th>Número de cuenta</th>
                  <th>Titular</th>
                  <th>Tipo</th>
                  <th>Moneda</th>
                </tr>
              </thead>

              <tbody>
                {cuentas.map((cuenta) => (
                  <tr key={cuenta.id_cuenta}>
                    <td>#{cuenta.id_cuenta}</td>
                    <td>{cuenta.numero_cuenta}</td>
                    <td>{cuenta.titular}</td>
                    <td>{cuenta.tipo_cuenta}</td>
                    <td>{cuenta.moneda}</td>
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