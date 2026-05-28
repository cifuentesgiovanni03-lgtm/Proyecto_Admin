-- ============================================================
-- Seed: Permisos y asignacion a roles
-- ============================================================

INSERT IGNORE INTO permisos (nombre, descripcion) VALUES
  ('VER_TRANSACCIONES', 'Ver listado de transacciones'),
  ('REALIZAR_DEPOSITO', 'Realizar depositos'),
  ('REALIZAR_RETIRO', 'Realizar retiros'),
  ('REALIZAR_TRANSFERENCIA_INTERNA', 'Realizar transferencias internas'),
  ('REALIZAR_TRANSFERENCIA_EXTERNA', 'Realizar transferencias externas'),
  ('VER_BANCOS', 'Ver listado de bancos'),
  ('GESTIONAR_BANCOS', 'Crear y editar bancos'),
  ('ELIMINAR_BANCOS', 'Eliminar bancos'),
  ('VER_CLIENTES', 'Ver listado de clientes'),
  ('GESTIONAR_CLIENTES', 'Crear y editar clientes'),
  ('ELIMINAR_CLIENTES', 'Eliminar clientes'),
  ('VER_CUENTAS', 'Ver listado de cuentas'),
  ('GESTIONAR_CUENTAS', 'Crear y editar cuentas'),
  ('ELIMINAR_CUENTAS', 'Eliminar cuentas'),
  ('VER_REPORTES', 'Ver reportes'),
  ('GESTIONAR_USUARIOS', 'Gestionar usuarios'),
  ('GESTIONAR_ROLES', 'Gestionar roles'),
  ('ASIGNAR_PERMISOS', 'Asignar permisos a roles'),
  ('GESTIONAR_PERMISOS', 'Gestionar permisos');

-- Asignar todos los permisos a ADMINISTRADOR (id_rol = 1)
INSERT IGNORE INTO rol_permiso (id_rol, id_permiso)
SELECT 1, id_permiso FROM permisos;

-- Asignar permisos a OPERADOR (id_rol = 2)
INSERT IGNORE INTO rol_permiso (id_rol, id_permiso)
SELECT 2, id_permiso FROM permisos
WHERE nombre IN (
  'VER_TRANSACCIONES', 'REALIZAR_DEPOSITO', 'REALIZAR_RETIRO',
  'REALIZAR_TRANSFERENCIA_INTERNA', 'REALIZAR_TRANSFERENCIA_EXTERNA',
  'VER_BANCOS', 'GESTIONAR_BANCOS',
  'VER_CLIENTES', 'GESTIONAR_CLIENTES',
  'VER_CUENTAS', 'GESTIONAR_CUENTAS',
  'VER_REPORTES'
);

-- Asignar permisos a CAJERO (id_rol = 3)
INSERT IGNORE INTO rol_permiso (id_rol, id_permiso)
SELECT 3, id_permiso FROM permisos
WHERE nombre IN (
  'VER_TRANSACCIONES', 'REALIZAR_DEPOSITO', 'REALIZAR_RETIRO',
  'VER_CLIENTES', 'VER_CUENTAS'
);
