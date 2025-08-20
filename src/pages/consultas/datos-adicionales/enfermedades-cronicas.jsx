"use client";

/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { showCustomAlert } from "../../../utils/alertas";

/* ---------- Chips & Pills ---------- */
const StatusPill = ({ value }) => {
  const v = String(value || "").toUpperCase();
  const map = {
    CUMPLIDA: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    INCUMPLIDA: "bg-yellow-50 text-yellow-700 ring-yellow-200",
    "SIN CALIFICAR": "bg-rose-50 text-rose-700 ring-rose-200",
  };
  const styles = map[v] || "bg-gray-50 text-gray-700 ring-gray-200";
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ring-1 ${styles}`}>
      {v || "—"}
    </span>
  );
};

const Chip = ({ children, color = "indigo" }) => {
  const styles =
    color === "emerald"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : color === "rose"
      ? "bg-rose-50 text-rose-700 ring-rose-200"
      : "bg-indigo-50 text-indigo-700 ring-indigo-200";
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ring-1 ${styles}`}>
      {children}
    </span>
  );
};

/* ---------- Modal base accesible ---------- */
function BaseModal({ open, onClose, title, children }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev || "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] grid place-items-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="absolute inset-0 bg-black/55" onClick={onClose} />
      <div
        ref={ref}
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex items-center justify-between">
          <h3 className="font-bold text-[clamp(16px,3.8vw,18px)] truncate">{title}</h3>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-sm font-semibold"
          >
            Cerrar
          </button>
        </div>
        <div className="p-4 sm:p-5 max-h-[80vh] overflow-auto">{children}</div>
      </div>
    </div>
  );
}

/* ---------- Hook viewport para items por página ---------- */
const useItemsPerPage = () => {
  const [n, setN] = useState(5);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(min-width: 768px)");
    const up = () => setN(mq.matches ? 8 : 5);
    up();
    const add = mq.addEventListener ? mq.addEventListener : mq.addListener;
    const rm = mq.removeEventListener ? mq.removeEventListener : mq.removeListener;
    add.call(mq, "change", up);
    return () => rm.call(mq, "change", up);
  }, []);
  return n;
};

const EnfermedadesCronicas = ({ clavenomina, clavepaciente }) => {
  /* ---------- State ---------- */
  const [catalogoEnfermedades, setCatalogoEnfermedades] = useState([]);
  const [enfermedad, setEnfermedad] = useState("");

  const [padecimientos, setPadecimientos] = useState([]);
  const [isLoadingPadecimientos, setIsLoadingPadecimientos] = useState(true);

  const [historialKPI, setHistorialKPI] = useState([]);
  const [isLoadingHistorial, setIsLoadingHistorial] = useState(true);

  const [catalogoKPIs, setCatalogoKPIs] = useState([]);
  const [nuevoKPI, setNuevoKPI] = useState({
    id_enf_cronica: "",
    id_kpi: "",
    kpi: "",
    valorActual: "",
    valorObjetivo: "",
  });

  // Motivo (agregar enfermedad)
  const [mostrarMotivo, setMostrarMotivo] = useState(false);
  const [motivo, setMotivo] = useState("");

  // Calificación KPI
  const [mostrarVentanaKPI, setMostrarVentanaKPI] = useState(false);
  const [editKPIDetails, setEditKPIDetails] = useState(null);
  const [valorAlcanzado, setValorAlcanzado] = useState("");
  const [calificacion, setCalificacion] = useState("");
  const [observaciones, setObservaciones] = useState("");

  // Paginación historial KPI
  const itemsPerPage = useItemsPerPage();
  const [paginaActual, setPaginaActual] = useState(1);
  const totalPaginas = Math.max(1, Math.ceil((historialKPI?.length || 0) / itemsPerPage));
  const historialPaginado = useMemo(() => {
    const start = (paginaActual - 1) * itemsPerPage;
    return (historialKPI || []).slice(start, start + itemsPerPage);
  }, [historialKPI, paginaActual, itemsPerPage]);
  useEffect(() => {
    if (paginaActual > totalPaginas) setPaginaActual(totalPaginas);
  }, [totalPaginas, paginaActual]);

  /* ---------- Fetch: cat. enfermedades ---------- */
  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        const r = await fetch("/api/enfermedades-kpis/enfermedadesCronicas", { signal: ac.signal });
        const data = await r.json();
        setCatalogoEnfermedades(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Error al cargar las enfermedades crónicas:", e);
        await showCustomAlert("error", "Error al cargar datos", "No se pudo cargar la información.", "Aceptar");
      }
    })();
    return () => ac.abort();
  }, []);

  /* ---------- Fetch: padecimientos actuales ---------- */
  const fetchPadecimientos = useCallback(async () => {
    setIsLoadingPadecimientos(true);
    try {
      const r = await fetch(
        `/api/enfermedades-kpis/padecimientosActuales?clavenomina=${clavenomina}&clavepaciente=${clavepaciente}`
      );
      const data = await r.json();
      setPadecimientos(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Error al cargar los padecimientos actuales:", e);
      await showCustomAlert("error", "Error al cargar datos", "No se pudo cargar los padecimientos.", "Aceptar");
    } finally {
      setIsLoadingPadecimientos(false);
    }
  }, [clavenomina, clavepaciente]);

  useEffect(() => {
    if (!clavenomina || !clavepaciente) {
      setPadecimientos([]);
      setIsLoadingPadecimientos(false);
      return;
    }
    fetchPadecimientos();
  }, [clavenomina, clavepaciente, fetchPadecimientos]);

  /* ---------- Fetch: historial KPI ---------- */
  const fetchHistorialKPI = useCallback(async () => {
    setIsLoadingHistorial(true);
    try {
      if (!clavenomina && !clavepaciente) {
        setHistorialKPI([]);
        return;
      }
      const queryParams = new URLSearchParams({
        clavenomina: clavenomina || "",
        clavepaciente: clavepaciente || "",
      }).toString();
      const response = await fetch(`/api/enfermedades-kpis/obtenerHistorialKPI?${queryParams}`);
      if (!response.ok) throw new Error("Error al cargar historial KPIs");
      const data = await response.json();
      setHistorialKPI(Array.isArray(data) ? data : []);
      setPaginaActual(1);
    } catch (e) {
      console.error("Error historial KPIs:", e);
      setHistorialKPI([]);
    } finally {
      setIsLoadingHistorial(false);
    }
  }, [clavenomina, clavepaciente]);

  useEffect(() => {
    fetchHistorialKPI();
  }, [fetchHistorialKPI]);

  /* ---------- Agregar enfermedad + motivo ---------- */
  const handleAgregarEnfermedad = async () => {
    if (!enfermedad) {
      await showCustomAlert("info", "Enfermedad requerida", "Selecciona una enfermedad.", "Aceptar");
      return;
    }
    setMostrarMotivo(true);
  };

  const handleGuardarMotivo = async () => {
    if (!motivo) {
      await showCustomAlert("warning", "Motivo requerido", "Especifica un motivo.", "Aceptar");
      return;
    }
    const enfermedadSeleccionada = catalogoEnfermedades.find((e) => e.cronica === enfermedad);
    if (!enfermedadSeleccionada) {
      await showCustomAlert("error", "Enfermedad no válida", "Selecciona otra y vuelve a intentar.", "Aceptar");
      return;
    }
    const fechaRegistro = new Date().toISOString().split("T")[0];
    const payload = {
      id_enf_cronica: enfermedadSeleccionada.id_enf_cronica,
      clavenomina,
      clavepaciente,
      observaciones_cronica: motivo,
      fecha_registro: fechaRegistro,
    };

    try {
      const r = await fetch("/api/enfermedades-kpis/guardarEnfermedadCronica", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!r.ok) throw new Error("Error al guardar en BD");
      await fetchPadecimientos();
      setMostrarMotivo(false);
      setMotivo("");
      await showCustomAlert("success", "Enfermedad registrada", "Se guardó correctamente.", "Aceptar");
    } catch (e) {
      console.error("Error guardar enfermedad:", e);
      await showCustomAlert("error", "Error del sistema", "Intenta nuevamente más tarde.", "Aceptar");
    }
  };

  /* ---------- KPIs: alta ---------- */
  const handleGuardarKPI = async () => {
    if (!nuevoKPI.id_enf_cronica || !nuevoKPI.id_kpi || !nuevoKPI.valorActual || !nuevoKPI.valorObjetivo) {
      await showCustomAlert("error", "Campos incompletos", "Completa todos los campos.", "Aceptar");
      return;
    }
    const kpiData = {
      id_kpi: parseInt(nuevoKPI.id_kpi, 10),
      id_enf_cronica: parseInt(nuevoKPI.id_enf_cronica, 10),
      clavenomina,
      clavepaciente,
      valor_actual: nuevoKPI.valorActual,
      valor_objetivo: nuevoKPI.valorObjetivo,
      calificacion: null,
      observaciones: nuevoKPI.kpi || "",
      valor_alcanzado: false,
    };
    try {
      const r = await fetch("/api/enfermedades-kpis/registrarKPI", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(kpiData),
      });
      if (!r.ok) throw new Error("Error al guardar KPI.");
      // refrescar
      await fetchHistorialKPI();
      setNuevoKPI({ id_enf_cronica: "", id_kpi: "", kpi: "", valorActual: "", valorObjetivo: "" });
      setCatalogoKPIs([]);
      await showCustomAlert("success", "KPI registrado", "Se guardó correctamente.", "Aceptar");
    } catch (e) {
      console.error("Error guardar KPI:", e);
      await showCustomAlert("error", "Error", "No se pudo guardar el KPI.", "Aceptar");
    }
  };

  /* ---------- KPIs: calificar (abrir modal con fetch detalle por fila) ---------- */
  const handleRowClick = async (kpi) => {
    if (String(kpi.calificacion).toUpperCase() !== "SIN CALIFICAR") return;

    try {
      const qs = new URLSearchParams({
        idRegistro: kpi.idRegistro,
        clavenomina: kpi.clavenomina,
        clavepaciente: kpi.clavepaciente || "",
      }).toString();

      const r = await fetch(`/api/enfermedades-kpis/obtenerHistorialKPI?${qs}`);
      if (!r.ok) throw new Error("Error al obtener detalle KPI");
      const data = await r.json();
      if (!Array.isArray(data) || !data.length) {
        await showCustomAlert("error", "Sin detalles", "No se encontró información para este KPI.", "Aceptar");
        return;
      }
      const seleccionado = data.find((it) => it.idRegistro === kpi.idRegistro);
      if (!seleccionado) {
        await showCustomAlert("error", "Sin detalles", "No se encontró información para este KPI.", "Aceptar");
        return;
      }
      setEditKPIDetails({ ...seleccionado, id_registro_kpi: seleccionado.idRegistro });
      setValorAlcanzado("");
      setCalificacion("");
      setObservaciones("");
      setMostrarVentanaKPI(true);
    } catch (e) {
      console.error("Error detalle KPI:", e);
      await showCustomAlert("error", "Error", "No se pudo cargar el detalle del KPI.", "Aceptar");
    }
  };

  const handleGuardarKPIDetalles = async () => {
    const fechaEvaluacion = new Date().toISOString().split("T")[0];
    if (!valorAlcanzado || !calificacion || !observaciones) {
      await showCustomAlert("warning", "Campos incompletos", "Completa todos los campos.", "Aceptar");
      return;
    }
    const payload = {
      id_registro_kpi: editKPIDetails.id_registro_kpi,
      valor_alcanzado: valorAlcanzado,
      valor_actual: editKPIDetails.valor_actual,
      valor_objetivo: editKPIDetails.valor_objetivo,
      calificacion,
      observaciones,
      fecha_evaluacion: fechaEvaluacion,
    };
    try {
      const qs = new URLSearchParams({
        clavenomina: clavenomina || "",
        clavepaciente: clavepaciente || "",
      }).toString();
      const r = await fetch(`/api/enfermedades-kpis/actualizarKPIDetalles?${qs}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        throw new Error(err.message || "Error al actualizar el KPI.");
      }
      setMostrarVentanaKPI(false);
      await showCustomAlert("success", "KPI actualizado", "Se guardó correctamente.", "Aceptar");
      await fetchHistorialKPI();
    } catch (e) {
      console.error("Error actualizar KPI:", e);
      await showCustomAlert("error", "Error", e.message || "No se pudo actualizar el KPI.", "Aceptar");
    }
  };

  /* ---------- UI ---------- */
  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-md overflow-hidden">
      {/* Header principal */}
      <div className="px-4 sm:px-5 md:px-6 py-3.5 sm:py-4 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
          <h1 className="text-base sm:text-lg md:text-xl font-bold text-white">Enfermedades Crónicas</h1>
          <span className="px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold bg-white/20 text-white">
            {padecimientos.length} padecimiento{padecimientos.length === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      <div className="p-4 sm:p-5 md:p-6 space-y-6">
        {/* Selección de Enfermedad */}
        <section className="rounded-xl border border-gray-100 bg-white p-4 sm:p-5 shadow-sm">
          <label className="block text-sm font-semibold text-gray-800">Enfermedad</label>
          <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]">
            <select
              value={enfermedad}
              onChange={(e) => setEnfermedad(e.target.value)}
              className="h-11 rounded-xl bg-white border border-gray-300 text-gray-800 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Selecciona una enfermedad...</option>
              {catalogoEnfermedades.map((enf) => (
                <option key={enf.id_enf_cronica} value={enf.cronica}>
                  {enf.cronica}
                </option>
              ))}
            </select>
            <button
              onClick={handleAgregarEnfermedad}
              className="h-11 rounded-xl bg-indigo-600 text-white font-semibold px-4 hover:bg-indigo-500"
            >
              Agregar
            </button>
          </div>
        </section>

        {/* Padecimientos actuales */}
        <section className="rounded-xl border border-gray-100 bg-white p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Padecimientos actuales</h2>
            <Chip>{padecimientos.length} registro{padecimientos.length === 1 ? "" : "s"}</Chip>
          </div>

          {/* Tabla ≥ md */}
          <div className="hidden md:block mt-3">
            <div className="overflow-x-auto rounded-xl ring-1 ring-indigo-100">
              <table className="w-full table-auto">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-900 text-[13px]">
                    <th className="py-3 px-4 text-left font-semibold">Fecha</th>
                    <th className="py-3 px-4 text-left font-semibold">Enfermedad</th>
                    <th className="py-3 px-4 text-left font-semibold">Observaciones</th>
                  </tr>
                </thead>
                <tbody className="text-[13px]">
                  {isLoadingPadecimientos ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i} className={i % 2 ? "bg-white" : "bg-indigo-50/40"}>
                        {Array.from({ length: 3 }).map((_, j) => (
                          <td key={j} className="py-3 px-4">
                            <div className="h-4 w-full bg-indigo-100 rounded animate-pulse" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : padecimientos.length ? (
                    padecimientos.map((p, i) => (
                      <tr key={i} className={i % 2 ? "bg-white" : "bg-indigo-50/40"}>
                        <td className="py-3 px-4 text-gray-700 whitespace-nowrap">
                          {p.fecha ? new Date(p.fecha).toISOString().split("T")[0] : "—"}
                        </td>
                        <td className="py-3 px-4 text-gray-700">{p.enfermedad || "—"}</td>
                        <td className="py-3 px-4 text-gray-700 max-w-[36rem]">
                          <span className="block overflow-hidden text-ellipsis whitespace-nowrap" title={p.observaciones || ""}>
                            {p.observaciones || "Sin observaciones"}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="text-center py-8 text-gray-500 bg-gradient-to-r from-indigo-50 via-white to-indigo-50">
                        No se encontraron registros de padecimientos.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cards móvil */}
          <div className="md:hidden mt-3">
            {isLoadingPadecimientos ? (
              <div className="grid grid-cols-1 min-[480px]:grid-cols-2 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-28 bg-indigo-50/60 border border-indigo-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : padecimientos.length ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {padecimientos.map((p, i) => (
                  <div key={i} className="rounded-xl border border-indigo-100 bg-white shadow-sm p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold text-gray-800 pr-2 text-[clamp(14px,3.6vw,16px)] truncate">
                        {p.enfermedad || "—"}
                      </h4>
                      <Chip>{p.fecha ? new Date(p.fecha).toISOString().split("T")[0] : "—"}</Chip>
                    </div>
                    <p className="mt-2 text-[clamp(12px,3.4vw,14px)] text-gray-700 line-clamp-2 break-words">
                      {p.observaciones || "Sin observaciones"}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">No se encontraron registros de padecimientos.</div>
            )}
          </div>
        </section>

        {/* Registro de KPIs */}
        <section className="rounded-xl border border-gray-100 bg-white p-4 sm:p-5 shadow-sm">
          <h2 className="font-semibold text-gray-900">Registrar KPI</h2>

          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Enfermedad</label>
              <select
                value={nuevoKPI.id_enf_cronica || ""}
                onChange={async (e) => {
                  const selectedId = e.target.value;
                  setNuevoKPI((s) => ({ ...s, id_enf_cronica: selectedId, id_kpi: "", kpi: "" }));
                  if (selectedId) {
                    try {
                      const r = await fetch(`/api/enfermedades-kpis/obtenerKPIs?id_enf_cronica=${selectedId}`);
                      if (!r.ok) throw new Error("Error al obtener los KPIs");
                      const data = await r.json();
                      setCatalogoKPIs(Array.isArray(data) ? data : []);
                    } catch (err) {
                      console.error("Error al obtener los KPIs:", err);
                      setCatalogoKPIs([]);
                    }
                  } else {
                    setCatalogoKPIs([]);
                  }
                }}
                className="mt-2 h-11 w-full rounded-xl bg-white border border-gray-300 text-gray-800 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Selecciona una enfermedad...</option>
                {padecimientos.map((p) => (
                  <option key={p.id_enf_cronica} value={p.id_enf_cronica}>
                    {p.enfermedad || "Sin nombre"}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">KPI a evaluar</label>
              <select
                value={nuevoKPI.id_kpi || ""}
                onChange={(e) => {
                  const id = parseInt(e.target.value, 10);
                  const found = catalogoKPIs.find((k) => k.id_kpi === id);
                  setNuevoKPI((s) => ({ ...s, id_kpi: id || "", kpi: found ? found.kpi : "" }));
                }}
                className="mt-2 h-11 w-full rounded-xl bg-white border border-gray-300 text-gray-800 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Selecciona un KPI...</option>
                {catalogoKPIs.map((k) => (
                  <option key={k.id_kpi} value={k.id_kpi}>
                    {k.kpi}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Valor actual</label>
              <input
                type="number"
                value={nuevoKPI.valorActual}
                onChange={(e) => setNuevoKPI((s) => ({ ...s, valorActual: e.target.value }))}
                className="mt-2 h-11 w-full rounded-xl bg-white border border-gray-300 text-gray-800 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Ej. 110"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Valor objetivo</label>
              <input
                type="number"
                value={nuevoKPI.valorObjetivo}
                onChange={(e) => setNuevoKPI((s) => ({ ...s, valorObjetivo: e.target.value }))}
                className="mt-2 h-11 w-full rounded-xl bg-white border border-gray-300 text-gray-800 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Ej. 90"
              />
            </div>
          </div>

          <div className="mt-4 text-right">
            <button
              onClick={handleGuardarKPI}
              className="h-11 rounded-xl bg-emerald-600 text-white font-semibold px-5 hover:bg-emerald-500"
            >
              Agregar KPI
            </button>
          </div>
        </section>

        {/* Historial KPIs */}
        <section className="rounded-xl border border-gray-100 bg-white p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Historial de KPIs</h2>
            <Chip>{historialKPI.length} registro{historialKPI.length === 1 ? "" : "s"}</Chip>
          </div>

          {/* Tabla ≥ md */}
          <div className="hidden md:block mt-3">
            <div className="overflow-x-auto rounded-xl ring-1 ring-indigo-100">
              <table className="w-full table-auto">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-900 text-[13px]">
                    <th className="py-3 px-4 text-left font-semibold">Registro</th>
                    <th className="py-3 px-4 text-left font-semibold">Enfermedad</th>
                    <th className="py-3 px-4 text-left font-semibold">KPI</th>
                    <th className="py-3 px-4 text-left font-semibold">Meta</th>
                    <th className="py-3 px-4 text-left font-semibold">Alcanzado</th>
                    <th className="py-3 px-4 text-left font-semibold">Evaluación</th>
                    <th className="py-3 px-4 text-left font-semibold">Fecha eval.</th>
                    <th className="py-3 px-4 text-left font-semibold">Estado</th>
                  </tr>
                </thead>
                <tbody className="text-[13px]">
                  {isLoadingHistorial ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i} className={i % 2 ? "bg-white" : "bg-indigo-50/40"}>
                        {Array.from({ length: 8 }).map((_, j) => (
                          <td key={j} className="py-3 px-4">
                            <div className="h-4 w-full bg-indigo-100 rounded animate-pulse" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : historialPaginado.length ? (
                    historialPaginado.map((kpi, idx) => {
                      const isPending = String(kpi.calificacion).toUpperCase() === "SIN CALIFICAR";
                      return (
                        <tr
                          key={`${kpi.idRegistro ?? idx}-${idx}`}
                          className={`${idx % 2 ? "bg-white" : "bg-indigo-50/40"} ${
                            isPending ? "hover:bg-indigo-50 cursor-pointer" : "opacity-70"
                          } transition-colors`}
                          onClick={() => isPending && handleRowClick(kpi)}
                          tabIndex={isPending ? 0 : -1}
                          onKeyDown={(e) => {
                            if (!isPending) return;
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              handleRowClick(kpi);
                            }
                          }}
                        >
                          <td className="py-3 px-4 text-gray-700 whitespace-nowrap">
                            {kpi.fechaRegistro ? new Date(kpi.fechaRegistro).toLocaleDateString("es-MX") : "—"}
                          </td>
                          <td className="py-3 px-4 text-gray-700">{kpi.nombreEnfermedad || "—"}</td>
                          <td className="py-3 px-4 text-gray-700 max-w-[18rem]">
                            <span className="block overflow-hidden text-ellipsis whitespace-nowrap" title={kpi.nombreKPI || ""}>
                              {kpi.nombreKPI || "—"}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-700 whitespace-nowrap">{kpi.valor_objetivo ?? "—"}</td>
                          <td className="py-3 px-4 text-gray-700 whitespace-nowrap">{kpi.valor_alcanzado ?? "—"}</td>
                          <td className="py-3 px-4 text-gray-700 max-w-[20rem]">
                            <span className="block overflow-hidden text-ellipsis whitespace-nowrap" title={kpi.observaciones || ""}>
                              {kpi.observaciones || "—"}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-700 whitespace-nowrap">
                            {kpi.fechaEvaluacion ? new Date(kpi.fechaEvaluacion).toLocaleDateString("es-MX") : "—"}
                          </td>
                          <td className="py-3 px-4">
                            <StatusPill value={kpi.calificacion} />
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-gray-500 bg-gradient-to-r from-indigo-50 via-white to-indigo-50">
                        No se encontraron registros para este paciente.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cards móvil */}
          <div className="md:hidden mt-3">
            {isLoadingHistorial ? (
              <div className="grid grid-cols-1 min-[480px]:grid-cols-2 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-32 bg-indigo-50/60 border border-indigo-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : historialPaginado.length ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {historialPaginado.map((kpi, i) => {
                  const isPending = String(kpi.calificacion).toUpperCase() === "SIN CALIFICAR";
                  return (
                    <div
                      key={`${kpi.idRegistro ?? i}-card`}
                      role={isPending ? "button" : undefined}
                      tabIndex={isPending ? 0 : -1}
                      onClick={() => isPending && handleRowClick(kpi)}
                      onKeyDown={(e) => {
                        if (!isPending) return;
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleRowClick(kpi);
                        }
                      }}
                      className={`rounded-2xl border border-indigo-100 bg-white shadow-sm p-4 ${
                        isPending ? "active:scale-[0.99] transition" : "opacity-70"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold text-gray-800 pr-2 text-[clamp(14px,3.6vw,16px)] truncate">
                          {kpi.nombreEnfermedad || "—"}
                        </h4>
                        <StatusPill value={kpi.calificacion} />
                      </div>
                      <p className="mt-1 text-[12px] text-gray-500">
                        {kpi.fechaRegistro ? new Date(kpi.fechaRegistro).toLocaleDateString("es-MX") : "—"}
                      </p>

                      <div className="mt-2 text-[clamp(12px,3.4vw,14px)] text-gray-700 space-y-1.5">
                        <p className="line-clamp-2 break-words">
                          <b>KPI:</b> {kpi.nombreKPI || "—"}
                        </p>
                        <p className="flex items-center gap-2">
                          <b>Meta:</b> <Chip color="emerald">{kpi.valor_objetivo ?? "—"}</Chip>
                        </p>
                        <p className="flex items-center gap-2">
                          <b>Alcanzado:</b> <Chip color="rose">{kpi.valor_alcanzado ?? "—"}</Chip>
                        </p>
                        <p className="line-clamp-2 break-words">
                          <b>Observaciones:</b> {kpi.observaciones || "—"}
                        </p>
                        <p className="text-[12px] text-gray-500">
                          <b>Evaluado:</b>{" "}
                          {kpi.fechaEvaluacion ? new Date(kpi.fechaEvaluacion).toLocaleDateString("es-MX") : "—"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">No se encontraron registros para este paciente.</div>
            )}
          </div>

          {/* Paginación historial */}
          {historialKPI.length > itemsPerPage && (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
              <button
                onClick={() => setPaginaActual((p) => Math.max(p - 1, 1))}
                disabled={paginaActual === 1}
                className="px-3 sm:px-4 py-2 rounded-xl bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50 disabled:opacity-50"
              >
                ← Anterior
              </button>
              <span className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200 text-xs sm:text-sm">
                Página {paginaActual} de {totalPaginas}
              </span>
              <button
                onClick={() => setPaginaActual((p) => Math.min(p + 1, totalPaginas))}
                disabled={paginaActual === totalPaginas}
                className="px-3 sm:px-4 py-2 rounded-xl bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50 disabled:opacity-50"
              >
                Siguiente →
              </button>
            </div>
          )}
        </section>
      </div>

      {/* Modal: Motivo */}
      <BaseModal open={mostrarMotivo} onClose={() => setMostrarMotivo(false)} title="Especificar motivo">
        <div className="space-y-3">
          <textarea
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            className="w-full h-32 rounded-xl bg-white border border-gray-300 text-gray-800 p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Escribe el motivo..."
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setMostrarMotivo(false)}
              className="px-4 h-10 rounded-xl bg-white ring-1 ring-gray-200 text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleGuardarMotivo}
              className="px-4 h-10 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-500"
            >
              Guardar
            </button>
          </div>
        </div>
      </BaseModal>

      {/* Modal: Calificar KPI */}
      <BaseModal open={mostrarVentanaKPI && !!editKPIDetails} onClose={() => setMostrarVentanaKPI(false)} title="Calificar KPI">
        {editKPIDetails && (
          <div className="space-y-5">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[14px]">
              <div>
                <dt className="text-gray-500">Enfermedad</dt>
                <dd className="text-gray-800 break-words">{editKPIDetails.nombreEnfermedad || "—"}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Registro</dt>
                <dd className="text-gray-800">
                  {editKPIDetails.fechaRegistro ? new Date(editKPIDetails.fechaRegistro).toLocaleDateString("es-MX") : "—"}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-gray-500">KPI</dt>
                <dd className="text-gray-800 break-words">{editKPIDetails.nombreKPI || "—"}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Valor actual</dt>
                <dd className="text-gray-800">{editKPIDetails?.valor_actual ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Valor objetivo</dt>
                <dd className="text-gray-800">{editKPIDetails?.valor_objetivo ?? "—"}</dd>
              </div>
            </dl>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Valor alcanzado</label>
                <input
                  type="number"
                  value={valorAlcanzado}
                  onChange={(e) => setValorAlcanzado(e.target.value)}
                  className="mt-1 h-11 w-full rounded-xl bg-white border border-gray-300 text-gray-800 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">¿Se cumplió el objetivo?</label>
                <select
                  value={calificacion}
                  onChange={(e) => setCalificacion(e.target.value)}
                  className="mt-1 h-11 w-full rounded-xl bg-white border border-gray-300 text-gray-800 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Selecciona</option>
                  <option value="CUMPLIDA">Sí</option>
                  <option value="INCUMPLIDA">No</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Observaciones</label>
              <textarea
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                className="mt-1 w-full h-28 rounded-xl bg-white border border-gray-300 text-gray-800 p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Escribe observaciones..."
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setMostrarVentanaKPI(false)}
                className="px-4 h-11 rounded-xl bg-white ring-1 ring-gray-200 text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleGuardarKPIDetalles}
                className="px-4 h-11 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-500"
              >
                Guardar
              </button>
            </div>
          </div>
        )}
      </BaseModal>

      {/* utilitarias */}
      <style jsx global>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.001ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.001ms !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>
    </div>
  );
};

export default EnfermedadesCronicas;
