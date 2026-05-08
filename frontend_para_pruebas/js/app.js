const API = "http://localhost:3000/api";

let token = localStorage.getItem("token");

// ===== UTILITIES =====

function show(el) {
  el.classList.remove("hidden");
}

function hide(el) {
  el.classList.add("hidden");
}

function showMessage(el, msg, type = "success") {
  el.textContent = msg;
  el.className = "message " + type;
  show(el);
  el.style.background = type === "error" ? "#f8d7da" : "#d4edda";
  el.style.color = type === "error" ? "#721c24" : "#155724";
  el.style.padding = "12px 16px";
  el.style.borderRadius = "6px";
  el.style.marginTop = "15px";
  setTimeout(() => hide(el), 5000);
}

function renderTable(containerId, headers, rows) {
  const container = document.getElementById(containerId);
  if (!rows || rows.length === 0) {
    container.innerHTML = "<p style='color:#999'>Sin datos</p>";
    return;
  }

  let html = "<table><thead><tr>";
  headers.forEach(h => {
    html += "<th>" + h + "</th>";
  });
  html += "</tr></thead><tbody>";

  rows.forEach(r => {
    html += "<tr>";
    headers.forEach(h => {
      const key = h.toLowerCase().replace(/ /g, "_");
      const val = r[key] !== undefined ? r[key] : (r[key.replace(/_/g, "")] !== undefined ? r[key.replace(/_/g, "")] : "");
      html += "<td>" + (val !== null && val !== undefined ? val : "-") + "</td>";
    });
    html += "</tr>";
  });

  html += "</tbody></table>";
  container.innerHTML = html;
}

async function apiFetch(path, options = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = "Bearer " + token;
  }

  const res = await fetch(API + path, {
    ...options,
    headers: { ...headers, ...options.headers }
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Error en la peticion");
  }

  return data;
}

// ===== AUTH =====

document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const errEl = document.getElementById("login-error");
  errEl.textContent = "";

  const username = document.getElementById("login-username").value;
  const password = document.getElementById("login-password").value;

  try {
    const data = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password })
    });

    token = data.token;
    localStorage.setItem("token", token);
    showDashboard();
  } catch (err) {
    showMessage(msgEl, err.message, "error");
  }
});

// ===== ROLES =====

async function loadRoles() {
  try {
    const data = await apiFetch("/roles");
    renderRolesConPermisos(data);
  } catch (err) {
    document.getElementById("roles-list").innerHTML = "<p class='error'>" + err.message + "</p>";
  }
}

function renderRolesConPermisos(rows) {
  const container = document.getElementById("roles-list");
  if (!rows || rows.length === 0) {
    container.innerHTML = "<p style='color:#999'>Sin datos</p>";
    return;
  }
  let html = "<table><thead><tr><th>ID</th><th>Nombre</th><th>Descripcion</th><th>Permisos</th><th>Acciones</th></tr></thead><tbody>";
  rows.forEach(r => {
    const permisos = (r.permisos || []).map(p => p.nombre).join(", ") || "-";
    html += "<tr>";
    html += "<td>" + (r.id_rol ?? "-") + "</td>";
    html += "<td>" + (r.nombre ?? "-") + "</td>";
    html += "<td>" + (r.descripcion ?? "-") + "</td>";
    html += "<td style='font-size:12px'>" + permisos + "</td>";
    html += `<td>
      <button onclick="editarRol(${r.id_rol})" style="background:#f39c12;color:#fff;padding:4px 10px;font-size:12px">Editar</button>
      <button onclick="asignarPermisosRol(${r.id_rol})" style="background:#3498db;color:#fff;padding:4px 10px;font-size:12px">Permisos</button>
      <button onclick="eliminarRol(${r.id_rol})" style="background:#e74c3c;color:#fff;padding:4px 10px;font-size:12px">Eliminar</button>
    </td>`;
    html += "</tr>";
  });
  html += "</tbody></table>";
  container.innerHTML = html;
}

async function editarRol(id) {
  const msgEl = document.getElementById("global-message");
  const nombre = prompt("Nuevo nombre:");
  if (!nombre) return;
  const descripcion = prompt("Nueva descripcion:") || "";
  try {
    await apiFetch("/roles/" + id, {
      method: "PUT",
      body: JSON.stringify({ nombre, descripcion })
    });
    showMessage(msgEl, "Rol actualizado");
    loadRoles();
  } catch (err) {
    showMessage(msgEl, err.message, "error");
  }
}

async function asignarPermisosRol(id) {
  const msgEl = document.getElementById("global-message");
  const ids = prompt("IDs de permisos separados por coma (ej: 1,2,3):");
  if (ids === null) return;
  const permisos = ids.split(",").map(s => Number(s.trim())).filter(n => !isNaN(n));
  try {
    await apiFetch("/roles/" + id + "/permisos", {
      method: "POST",
      body: JSON.stringify({ permisos })
    });
    showMessage(msgEl, "Permisos asignados al rol");
    loadRoles();
  } catch (err) {
    showMessage(msgEl, err.message, "error");
  }
}

async function eliminarRol(id) {
  if (!confirm("Eliminar rol ID " + id + "?")) return;
  const msgEl = document.getElementById("global-message");
  try {
    await apiFetch("/roles/" + id, { method: "DELETE" });
    showMessage(msgEl, "Rol eliminado");
    loadRoles();
  } catch (err) {
    showMessage(msgEl, err.message, "error");
  }
}

document.getElementById("form-rol").addEventListener("submit", async (e) => {
  e.preventDefault();
  const msgEl = document.getElementById("global-message");
  try {
    await apiFetch("/roles", {
      method: "POST",
      body: JSON.stringify({
        nombre: document.getElementById("rol-nombre").value,
        descripcion: document.getElementById("rol-desc").value
      })
    });
    showMessage(msgEl, "Rol creado correctamente");
    e.target.reset();
    loadRoles();
  } catch (err) {
    showMessage(msgEl, err.message, "error");
  }
});

// ===== PERMISOS =====

async function loadPermisos() {
  try {
    const data = await apiFetch("/permisos");
    renderPermisosConAcciones(data);
  } catch (err) {
    document.getElementById("permisos-list").innerHTML = "<p class='error'>" + err.message + "</p>";
  }
}

function renderPermisosConAcciones(rows) {
  const container = document.getElementById("permisos-list");
  if (!rows || rows.length === 0) {
    container.innerHTML = "<p style='color:#999'>Sin datos</p>";
    return;
  }
  let html = "<table><thead><tr><th>ID</th><th>Nombre</th><th>Descripcion</th><th>Acciones</th></tr></thead><tbody>";
  rows.forEach(r => {
    html += "<tr>";
    html += "<td>" + (r.id_permiso ?? "-") + "</td>";
    html += "<td>" + (r.nombre ?? "-") + "</td>";
    html += "<td>" + (r.descripcion ?? "-") + "</td>";
    html += `<td>
      <button onclick="editarPermiso(${r.id_permiso})" style="background:#f39c12;color:#fff;padding:4px 10px;font-size:12px">Editar</button>
      <button onclick="eliminarPermiso(${r.id_permiso})" style="background:#e74c3c;color:#fff;padding:4px 10px;font-size:12px">Eliminar</button>
    </td>`;
    html += "</tr>";
  });
  html += "</tbody></table>";
  container.innerHTML = html;
}

async function editarPermiso(id) {
  const msgEl = document.getElementById("global-message");
  const nombre = prompt("Nuevo nombre:");
  if (!nombre) return;
  const descripcion = prompt("Nueva descripcion:") || "";
  try {
    await apiFetch("/permisos/" + id, {
      method: "PUT",
      body: JSON.stringify({ nombre, descripcion })
    });
    showMessage(msgEl, "Permiso actualizado");
    loadPermisos();
  } catch (err) {
    showMessage(msgEl, err.message, "error");
  }
}

async function eliminarPermiso(id) {
  if (!confirm("Eliminar permiso ID " + id + "?")) return;
  const msgEl = document.getElementById("global-message");
  try {
    await apiFetch("/permisos/" + id, { method: "DELETE" });
    showMessage(msgEl, "Permiso eliminado");
    loadPermisos();
  } catch (err) {
    showMessage(msgEl, err.message, "error");
  }
}

document.getElementById("form-permiso").addEventListener("submit", async (e) => {
  e.preventDefault();
  const msgEl = document.getElementById("global-message");
  try {
    await apiFetch("/permisos", {
      method: "POST",
      body: JSON.stringify({
        nombre: document.getElementById("perm-nombre").value,
        descripcion: document.getElementById("perm-desc").value
      })
    });
    showMessage(msgEl, "Permiso creado correctamente");
    e.target.reset();
    loadPermisos();
  } catch (err) {
    showMessage(msgEl, err.message, "error");
  }
});

document.getElementById("logout-btn").addEventListener("click", () => {
  token = null;
  localStorage.removeItem("token");
  document.getElementById("login-screen").classList.remove("hidden");
  document.getElementById("dashboard-screen").classList.add("hidden");
});

function showDashboard() {
  hide(document.getElementById("login-screen"));
  show(document.getElementById("dashboard-screen"));
  document.getElementById("user-info").textContent = "Sesion activa";
  loadBancos();
}

if (token) {
  showDashboard();
}

// ===== NAVIGATION =====

document.querySelectorAll(".nav-link").forEach(link => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const section = e.target.dataset.section;

    document.querySelectorAll(".nav-link").forEach(l => l.classList.remove("active"));
    e.target.classList.add("active");

    document.querySelectorAll(".section").forEach(s => s.classList.add("hidden"));
    document.getElementById("sec-" + section).classList.remove("hidden");
  });
});

// ===== TABS =====

document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const parent = btn.parentElement;
    const tabId = btn.dataset.tab;

    parent.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    const section = parent.closest(".section");
    section.querySelectorAll(".tab-content").forEach(t => t.classList.add("hidden"));
    document.getElementById("tab-" + tabId).classList.remove("hidden");
  });
});

// ===== BANCOS =====

async function loadBancos() {
  try {
    const data = await apiFetch("/bancos");
    renderTable("bancos-list", ["ID Banco", "Nombre", "Codigo banco", "Pais", "Estado"], data);
  } catch (err) {
    document.getElementById("bancos-list").innerHTML = "<p class='error'>" + err.message + "</p>";
  }
}

document.getElementById("form-banco").addEventListener("submit", async (e) => {
  e.preventDefault();
  const msgEl = document.getElementById("global-message");
  try {
    await apiFetch("/bancos", {
      method: "POST",
      body: JSON.stringify({
        nombre: document.getElementById("banco-nombre").value,
        codigo_banco: document.getElementById("banco-codigo").value,
        pais: document.getElementById("banco-pais").value
      })
    });
    showMessage(msgEl, "Banco creado correctamente");
    e.target.reset();
    loadBancos();
  } catch (err) {
    showMessage(msgEl, err.message, "error");
  }
});

// ===== CLIENTES =====

async function loadClientes() {
  try {
    const data = await apiFetch("/clientes");
    renderTable("clientes-list", ["ID Cliente", "Nombres", "Apellidos", "DPI", "Telefono", "Correo"], data);
  } catch (err) {
    document.getElementById("clientes-list").innerHTML = "<p class='error'>" + err.message + "</p>";
  }
}

document.getElementById("form-cliente").addEventListener("submit", async (e) => {
  e.preventDefault();
  const msgEl = document.getElementById("global-message");
  try {
    await apiFetch("/clientes", {
      method: "POST",
      body: JSON.stringify({
        nombres: document.getElementById("cliente-nombres").value,
        apellidos: document.getElementById("cliente-apellidos").value,
        dpi: document.getElementById("cliente-dpi").value,
        nit: document.getElementById("cliente-nit").value,
        fecha_nacimiento: null,
        telefono: document.getElementById("cliente-telefono").value,
        correo: document.getElementById("cliente-correo").value,
        direccion: document.getElementById("cliente-direccion").value
      })
    });
    showMessage(msgEl, "Cliente creado correctamente");
    e.target.reset();
    loadClientes();
  } catch (err) {
    showMessage(msgEl, err.message, "error");
  }
});

// ===== CUENTAS =====

async function loadCuentas() {
  try {
    const data = await apiFetch("/cuentas");
    renderTable("cuentas-list", ["ID Cuenta", "Numero cuenta", "Saldo", "Moneda", "Estado", "Nombres", "Tipo cuenta"], data);
  } catch (err) {
    document.getElementById("cuentas-list").innerHTML = "<p class='error'>" + err.message + "</p>";
  }
}

document.getElementById("form-cuenta").addEventListener("submit", async (e) => {
  e.preventDefault();
  const msgEl = document.getElementById("global-message");
  try {
    await apiFetch("/cuentas", {
      method: "POST",
      body: JSON.stringify({
        numero_cuenta: document.getElementById("cuenta-numero").value,
        id_cliente: Number(document.getElementById("cuenta-id-cliente").value),
        id_tipo_cuenta: Number(document.getElementById("cuenta-tipo").value),
        saldo: Number(document.getElementById("cuenta-saldo").value),
        moneda: document.getElementById("cuenta-moneda").value
      })
    });
    showMessage(msgEl, "Cuenta creada correctamente");
    e.target.reset();
    loadCuentas();
  } catch (err) {
    showMessage(msgEl, err.message, "error");
  }
});

document.getElementById("form-movimientos").addEventListener("submit", async (e) => {
  e.preventDefault();
  const idCuenta = document.getElementById("mov-id-cuenta").value;
  const container = document.getElementById("movimientos-result");

  try {
    const data = await apiFetch("/cuentas/" + idCuenta + "/movimientos");
    renderTable("movimientos-result", [
      "ID Movimiento", "Tipo movimiento", "Monto", "Saldo anterior", "Saldo nuevo", "Fecha movimiento", "Descripcion"
    ], data.movimientos);
  } catch (err) {
    container.innerHTML = "<p class='error'>" + err.message + "</p>";
  }
});

// ===== TRANSACCIONES =====

// Deposito
document.getElementById("form-deposito").addEventListener("submit", async (e) => {
  e.preventDefault();
  const msgEl = document.getElementById("dep-result");
  try {
    const data = await apiFetch("/transacciones/deposito", {
      method: "POST",
      body: JSON.stringify({
        id_cuenta_destino: Number(document.getElementById("dep-cuenta").value),
        monto: Number(document.getElementById("dep-monto").value),
        descripcion: document.getElementById("dep-desc").value
      })
    });
    showMessage(msgEl, "Deposito realizado - ID Transaccion: " + data.id_transaccion);
    e.target.reset();
  } catch (err) {
    showMessage(msgEl, err.message, "error");
  }
});

// Retiro
document.getElementById("form-retiro").addEventListener("submit", async (e) => {
  e.preventDefault();
  const msgEl = document.getElementById("ret-result");
  try {
    const data = await apiFetch("/transacciones/retiro", {
      method: "POST",
      body: JSON.stringify({
        id_cuenta_origen: Number(document.getElementById("ret-cuenta").value),
        monto: Number(document.getElementById("ret-monto").value),
        descripcion: document.getElementById("ret-desc").value
      })
    });
    showMessage(msgEl, "Retiro realizado - Saldo nuevo: " + data.saldo_nuevo);
    e.target.reset();
  } catch (err) {
    showMessage(msgEl, err.message, "error");
  }
});

// Transferencia Interna
document.getElementById("form-transferencia").addEventListener("submit", async (e) => {
  e.preventDefault();
  const msgEl = document.getElementById("trans-result");
  try {
    const data = await apiFetch("/transacciones/transferencia-interna", {
      method: "POST",
      body: JSON.stringify({
        id_cuenta_origen: Number(document.getElementById("trans-origen").value),
        id_cuenta_destino: Number(document.getElementById("trans-destino").value),
        monto: Number(document.getElementById("trans-monto").value),
        descripcion: document.getElementById("trans-desc").value
      })
    });
    showMessage(msgEl, "Transferencia realizada - Origen: " + data.saldo_origen_nuevo + " | Destino: " + data.saldo_destino_nuevo);
    e.target.reset();
  } catch (err) {
    showMessage(msgEl, err.message, "error");
  }
});

// Transferencia Externa
document.getElementById("form-transferencia-ext").addEventListener("submit", async (e) => {
  e.preventDefault();
  const msgEl = document.getElementById("ext-result");
  try {
    const data = await apiFetch("/transacciones/transferencia-externa", {
      method: "POST",
      body: JSON.stringify({
        id_cuenta_origen: Number(document.getElementById("ext-origen").value),
        monto: Number(document.getElementById("ext-monto").value),
        api_externa_nombre: document.getElementById("ext-api").value,
        id_banco_destino: Number(document.getElementById("ext-banco").value),
        cuenta_destino_externa: document.getElementById("ext-cuenta-dest").value,
        titular_destino: document.getElementById("ext-titular").value
      })
    });
    showMessage(msgEl, "Transferencia externa: " + data.estado + " - " + data.mensaje_respuesta);
    e.target.reset();
  } catch (err) {
    showMessage(msgEl, err.message, "error");
  }
});

// Transferencia Entrante
document.getElementById("form-transferencia-ent").addEventListener("submit", async (e) => {
  e.preventDefault();
  const msgEl = document.getElementById("ent-result");
  try {
    const data = await apiFetch("/transacciones/transferencia-entrante", {
      method: "POST",
      body: JSON.stringify({
        id_cuenta_destino: Number(document.getElementById("ent-destino").value),
        monto: Number(document.getElementById("ent-monto").value),
        id_banco_origen: Number(document.getElementById("ent-banco").value),
        cuenta_origen_externa: document.getElementById("ent-cuenta-orig").value,
        codigo_referencia_externa: document.getElementById("ent-ref").value,
        titular_origen: document.getElementById("ent-titular").value
      })
    });
    showMessage(msgEl, "Transferencia entrante registrada - Saldo nuevo: " + data.saldo_nuevo);
    e.target.reset();
  } catch (err) {
    showMessage(msgEl, err.message, "error");
  }
});

// ===== REPORTES =====

// Reporte Transacciones
document.getElementById("form-rep-transacciones").addEventListener("submit", async (e) => {
  e.preventDefault();
  const msgEl = document.getElementById("rep-trans-result");
  try {
    const inicio = document.getElementById("rep-trans-inicio").value;
    const fin = document.getElementById("rep-trans-fin").value;
    const data = await apiFetch("/reportes/transacciones?fecha_inicio=" + inicio + "&fecha_fin=" + fin);
    renderTable("rep-trans-result", ["ID Transaccion", "Monto", "Moneda", "Descripcion", "Estado", "Tipo transaccion", "Fecha transaccion"], data);
  } catch (err) {
    showMessage(msgEl, err.message, "error");
  }
});

async function loadReporteClientes() {
  const msgEl = document.getElementById("rep-clientes-result");
  try {
    const data = await apiFetch("/reportes/clientes");
    renderTable("rep-clientes-result", ["ID Cliente", "Nombres", "Apellidos", "DPI", "Correo", "Total cuentas"], data);
  } catch (err) {
    msgEl.innerHTML = "<p class='error'>" + err.message + "</p>";
  }
}

async function loadReporteSaldos() {
  const msgEl = document.getElementById("rep-saldos-result");
  try {
    const data = await apiFetch("/reportes/saldos");
    renderTable("rep-saldos-result", ["ID Cuenta", "Numero cuenta", "Saldo", "Moneda", "Estado", "Nombres", "Apellidos"], data);
  } catch (err) {
    msgEl.innerHTML = "<p class='error'>" + err.message + "</p>";
  }
}

// ===== CLIENTES CRUD EXTRA =====

async function editarCliente(id) {
  const msgEl = document.getElementById("global-message");
  const nuevos = prompt("Nuevos nombres:");
  if (!nuevos) return;
  const apellidos = prompt("Nuevos apellidos:");
  if (!apellidos) return;
  const dpi = prompt("Nuevo DPI:");
  if (!dpi) return;
  const telefono = prompt("Telefono:") || "";
  const correo = prompt("Correo:") || "";

  try {
    await apiFetch("/clientes/" + id, {
      method: "PUT",
      body: JSON.stringify({ nombres: nuevos, apellidos, dpi, telefono, correo, nit: "", fecha_nacimiento: null, direccion: "" })
    });
    showMessage(msgEl, "Cliente actualizado");
    loadClientes();
  } catch (err) {
    showMessage(msgEl, err.message, "error");
  }
}

async function eliminarCliente(id) {
  if (!confirm("Eliminar cliente ID " + id + "?")) return;
  const msgEl = document.getElementById("global-message");
  try {
    await apiFetch("/clientes/" + id, { method: "DELETE" });
    showMessage(msgEl, "Cliente eliminado");
    loadClientes();
  } catch (err) {
    showMessage(msgEl, err.message, "error");
  }
}

function renderClientesConAcciones(rows) {
  const container = document.getElementById("clientes-list");
  if (!rows || rows.length === 0) {
    container.innerHTML = "<p style='color:#999'>Sin datos</p>";
    return;
  }
  let html = "<table><thead><tr><th>ID</th><th>Nombres</th><th>Apellidos</th><th>DPI</th><th>Telefono</th><th>Correo</th><th>Acciones</th></tr></thead><tbody>";
  rows.forEach(r => {
    html += "<tr>";
    html += "<td>" + (r.id_cliente ?? "-") + "</td>";
    html += "<td>" + (r.nombres ?? "-") + "</td>";
    html += "<td>" + (r.apellidos ?? "-") + "</td>";
    html += "<td>" + (r.dpi ?? "-") + "</td>";
    html += "<td>" + (r.telefono ?? "-") + "</td>";
    html += "<td>" + (r.correo ?? "-") + "</td>";
    html += `<td><button onclick="editarCliente(${r.id_cliente})" style="background:#f39c12;color:#fff;padding:4px 10px;font-size:12px">Editar</button> <button onclick="eliminarCliente(${r.id_cliente})" style="background:#e74c3c;color:#fff;padding:4px 10px;font-size:12px">Eliminar</button></td>`;
    html += "</tr>";
  });
  html += "</tbody></table>";
  container.innerHTML = html;
}

async function loadClientes() {
  try {
    const data = await apiFetch("/clientes");
    renderClientesConAcciones(data);
  } catch (err) {
    document.getElementById("clientes-list").innerHTML = "<p class='error'>" + err.message + "</p>";
  }
}

// ===== CUENTAS CRUD EXTRA =====

async function editarCuenta(id) {
  const msgEl = document.getElementById("global-message");
  const estado = prompt("Estado (ACTIVA/INACTIVA/BLOQUEADA):");
  if (!estado) return;
  const moneda = prompt("Moneda (GTQ/USD):");
  if (!moneda) return;

  try {
    await apiFetch("/cuentas/" + id, {
      method: "PUT",
      body: JSON.stringify({ estado, moneda, numero_cuenta: "", id_tipo_cuenta: null })
    });
    showMessage(msgEl, "Cuenta actualizada");
    loadCuentas();
  } catch (err) {
    showMessage(msgEl, err.message, "error");
  }
}

async function eliminarCuenta(id) {
  if (!confirm("Eliminar cuenta ID " + id + "?")) return;
  const msgEl = document.getElementById("global-message");
  try {
    await apiFetch("/cuentas/" + id, { method: "DELETE" });
    showMessage(msgEl, "Cuenta eliminada");
    loadCuentas();
  } catch (err) {
    showMessage(msgEl, err.message, "error");
  }
}

function renderCuentasConAcciones(rows) {
  const container = document.getElementById("cuentas-list");
  if (!rows || rows.length === 0) {
    container.innerHTML = "<p style='color:#999'>Sin datos</p>";
    return;
  }
  let html = "<table><thead><tr><th>ID</th><th>Numero</th><th>Saldo</th><th>Moneda</th><th>Estado</th><th>Cliente</th><th>Tipo</th><th>Acciones</th></tr></thead><tbody>";
  rows.forEach(r => {
    html += "<tr>";
    html += "<td>" + (r.id_cuenta ?? "-") + "</td>";
    html += "<td>" + (r.numero_cuenta ?? "-") + "</td>";
    html += "<td>" + (r.saldo ?? "-") + "</td>";
    html += "<td>" + (r.moneda ?? "-") + "</td>";
    html += "<td>" + (r.estado ?? "-") + "</td>";
    html += "<td>" + (r.nombres ?? "-") + " " + (r.apellidos ?? "") + "</td>";
    html += "<td>" + (r.tipo_cuenta ?? "-") + "</td>";
    html += `<td><button onclick="editarCuenta(${r.id_cuenta})" style="background:#f39c12;color:#fff;padding:4px 10px;font-size:12px">Editar</button> <button onclick="eliminarCuenta(${r.id_cuenta})" style="background:#e74c3c;color:#fff;padding:4px 10px;font-size:12px">Eliminar</button></td>`;
    html += "</tr>";
  });
  html += "</tbody></table>";
  container.innerHTML = html;
}

async function loadCuentas() {
  try {
    const data = await apiFetch("/cuentas");
    renderCuentasConAcciones(data);
  } catch (err) {
    document.getElementById("cuentas-list").innerHTML = "<p class='error'>" + err.message + "</p>";
  }
}

// ===== USUARIOS =====

async function loadUsuarios() {
  try {
    const data = await apiFetch("/usuarios");
    renderUsuariosConAcciones(data);
  } catch (err) {
    document.getElementById("usuarios-list").innerHTML = "<p class='error'>" + err.message + "</p>";
  }
}

function renderUsuariosConAcciones(rows) {
  const container = document.getElementById("usuarios-list");
  if (!rows || rows.length === 0) {
    container.innerHTML = "<p style='color:#999'>Sin datos</p>";
    return;
  }
  let html = "<table><thead><tr><th>ID</th><th>Username</th><th>Nombre</th><th>Correo</th><th>Rol</th><th>Estado</th><th>Fecha creacion</th><th>Acciones</th></tr></thead><tbody>";
  rows.forEach(r => {
    html += "<tr>";
    html += "<td>" + (r.id_usuario ?? "-") + "</td>";
    html += "<td>" + (r.username ?? "-") + "</td>";
    html += "<td>" + (r.nombre_completo ?? "-") + "</td>";
    html += "<td>" + (r.correo ?? "-") + "</td>";
    html += "<td>" + (r.rol ?? "-") + "</td>";
    html += "<td>" + (r.estado ?? "-") + "</td>";
    html += "<td>" + (r.fecha_creacion ? r.fecha_creacion.substring(0, 10) : "-") + "</td>";
    html += `<td>
      <button onclick="editarUsuario(${r.id_usuario})" style="background:#f39c12;color:#fff;padding:4px 10px;font-size:12px">Editar</button>
      <button onclick="cambiarPasswordUsuario(${r.id_usuario})" style="background:#3498db;color:#fff;padding:4px 10px;font-size:12px">Password</button>
      <button onclick="eliminarUsuario(${r.id_usuario})" style="background:#e74c3c;color:#fff;padding:4px 10px;font-size:12px">Eliminar</button>
    </td>`;
    html += "</tr>";
  });
  html += "</tbody></table>";
  container.innerHTML = html;
}

async function editarUsuario(id) {
  const msgEl = document.getElementById("global-message");
  const nombre_completo = prompt("Nombre completo:");
  if (!nombre_completo) return;
  const correo = prompt("Correo:");
  if (!correo) return;
  const rolId = prompt("ID Rol (1=ADMIN, 2=OPERADOR, 3=CAJERO):");
  if (!rolId) return;
  const estado = prompt("Estado (ACTIVO/INACTIVO):") || "ACTIVO";

  try {
    await apiFetch("/usuarios/" + id, {
      method: "PUT",
      body: JSON.stringify({ nombre_completo, correo, id_rol: Number(rolId), estado })
    });
    showMessage(msgEl, "Usuario actualizado");
    loadUsuarios();
  } catch (err) {
    showMessage(msgEl, err.message, "error");
  }
}

async function cambiarPasswordUsuario(id) {
  const msgEl = document.getElementById("global-message");
  const password = prompt("Nueva contrasena:");
  if (!password || password.length < 4) return;

  try {
    await apiFetch("/usuarios/" + id + "/password", {
      method: "PUT",
      body: JSON.stringify({ password })
    });
    showMessage(msgEl, "Password actualizada");
  } catch (err) {
    showMessage(msgEl, err.message, "error");
  }
}

async function eliminarUsuario(id) {
  if (!confirm("Eliminar usuario ID " + id + "?")) return;
  const msgEl = document.getElementById("global-message");
  try {
    await apiFetch("/usuarios/" + id, { method: "DELETE" });
    showMessage(msgEl, "Usuario eliminado");
    loadUsuarios();
  } catch (err) {
    showMessage(msgEl, err.message, "error");
  }
}

document.getElementById("form-usuario").addEventListener("submit", async (e) => {
  e.preventDefault();
  const msgEl = document.getElementById("global-message");
  try {
    await apiFetch("/usuarios", {
      method: "POST",
      body: JSON.stringify({
        username: document.getElementById("user-username").value,
        password: document.getElementById("user-password").value,
        nombre_completo: document.getElementById("user-nombre").value,
        correo: document.getElementById("user-correo").value,
        id_rol: Number(document.getElementById("user-rol").value)
      })
    });
    showMessage(msgEl, "Usuario creado correctamente");
    e.target.reset();
    loadUsuarios();
  } catch (err) {
    showMessage(msgEl, err.message, "error");
  }
});
