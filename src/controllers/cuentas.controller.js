const cuentaModel = require("../models/cuenta.model");

async function listarCuentas(req, res) {
  try {
    const rows = await cuentaModel.findAll();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function obtenerCuenta(req, res) {
  try {
    const { id_cuenta } = req.params;

    const cuenta = await cuentaModel.findByIdSimple(id_cuenta);
    if (!cuenta) {
      return res.status(404).json({ message: "Cuenta no encontrada" });
    }

    res.json(cuenta);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function crearCuenta(req, res) {
  try {
    const { numero_cuenta, id_cliente, id_tipo_cuenta, saldo, moneda } = req.body;

    const id_cuenta = await cuentaModel.create({
      numero_cuenta, id_cliente, id_tipo_cuenta, saldo, moneda
    });

    res.status(201).json({
      message: "Cuenta creada correctamente",
      id_cuenta
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function actualizarCuenta(req, res) {
  try {
    const { id_cuenta } = req.params;

    const existe = await cuentaModel.findByIdSimple(id_cuenta);
    if (!existe) {
      return res.status(404).json({ message: "Cuenta no encontrada" });
    }

    const { numero_cuenta, id_tipo_cuenta, moneda, estado } = req.body;
    await cuentaModel.updateDatos(id_cuenta, {
      numero_cuenta,
      id_tipo_cuenta: id_tipo_cuenta || existe.id_tipo_cuenta,
      moneda: moneda || existe.moneda,
      estado: estado || existe.estado
    });

    res.json({ message: "Cuenta actualizada correctamente" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function eliminarCuenta(req, res) {
  try {
    const { id_cuenta } = req.params;

    const eliminado = await cuentaModel.deleteById(id_cuenta);
    if (!eliminado) {
      return res.status(404).json({ message: "Cuenta no encontrada" });
    }

    res.json({ message: "Cuenta eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function obtenerMovimientosCuenta(req, res) {
  try {
    const { id_cuenta } = req.params;

    if (!id_cuenta) {
      return res.status(400).json({ message: "El id_cuenta es obligatorio" });
    }

    const cuenta = await cuentaModel.findById(id_cuenta);

    if (!cuenta) {
      return res.status(404).json({ message: "La cuenta no existe" });
    }

    const movimientos = await cuentaModel.getMovimientos(id_cuenta);

    res.json({
      cuenta,
      total_movimientos: movimientos.length,
      movimientos
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function obtenerEstadoCuenta(req, res) {
  try {
    const { id_cuenta } = req.params;
    const { fecha_inicio, fecha_fin } = req.query;

    if (!id_cuenta) {
      return res.status(400).json({ message: "El id_cuenta es obligatorio" });
    }

    if (!fecha_inicio || !fecha_fin) {
      return res.status(400).json({
        message: "fecha_inicio y fecha_fin son obligatorios"
      });
    }

    const cuenta = await cuentaModel.findById(id_cuenta);

    if (!cuenta) {
      return res.status(404).json({ message: "La cuenta no existe" });
    }

    const movimientos = await cuentaModel.getMovimientosByDateRange(
      id_cuenta, fecha_inicio, fecha_fin
    );

    let totalCreditos = 0;
    let totalDebitos = 0;

    for (const mov of movimientos) {
      if (mov.tipo_movimiento === "CREDITO") {
        totalCreditos += Number(mov.monto);
      } else if (mov.tipo_movimiento === "DEBITO") {
        totalDebitos += Number(mov.monto);
      }
    }

    const saldoInicial =
      movimientos.length > 0 ? Number(movimientos[0].saldo_anterior) : Number(cuenta.saldo);

    const saldoFinal =
      movimientos.length > 0
        ? Number(movimientos[movimientos.length - 1].saldo_nuevo)
        : Number(cuenta.saldo);

    res.json({
      cuenta: {
        id_cuenta: cuenta.id_cuenta,
        numero_cuenta: cuenta.numero_cuenta,
        tipo_cuenta: cuenta.tipo_cuenta,
        moneda: cuenta.moneda,
        estado: cuenta.estado,
        fecha_apertura: cuenta.fecha_apertura,
        saldo_actual: cuenta.saldo
      },
      cliente: {
        id_cliente: cuenta.id_cliente,
        nombres: cuenta.nombres,
        apellidos: cuenta.apellidos,
        dpi: cuenta.dpi
      },
      periodo: { fecha_inicio, fecha_fin },
      resumen: {
        saldo_inicial: saldoInicial,
        total_creditos: totalCreditos,
        total_debitos: totalDebitos,
        saldo_final: saldoFinal,
        total_movimientos: movimientos.length
      },
      movimientos
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
  listarCuentas,
  obtenerCuenta,
  crearCuenta,
  actualizarCuenta,
  eliminarCuenta,
  obtenerMovimientosCuenta,
  obtenerEstadoCuenta
};
