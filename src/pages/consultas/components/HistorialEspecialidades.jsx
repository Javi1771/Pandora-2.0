"use client";

import React, {
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
} from "react";
import { createPortal } from "react-dom";

/* ---------------- Modal de Detalle (portal + visual viewport) ---------------- */
function DetailModal({ open, onClose, item }) {
  const portalRef = useRef(null);
  const [vhPx, setVhPx] = useState(
    typeof window !== "undefined" ? window.innerHeight : 0
  );

  // Crear nodo portal
  useEffect(() => {
    const node = document.createElement("div");
    node.setAttribute("data-portal", "especialidades-detail");
    document.body.appendChild(node);
    portalRef.current = node;
    return () => {
      if (portalRef.current) document.body.removeChild(portalRef.current);
      portalRef.current = null;
    };
  }, []);

  // Bloqueo de scroll + ESC + seguimiento del visual viewport
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);

    const vv = window.visualViewport;
    const update = () => setVhPx(vv?.height ?? window.innerHeight);
    update();
    vv?.addEventListener("resize", update);
    vv?.addEventListener("scroll", update);

    return () => {
      document.body.style.overflow = prev || "";
      window.removeEventListener("keydown", onKey);
      vv?.removeEventListener("resize", update);
      vv?.removeEventListener("scroll", update);
    };
  }, [open, onClose]);

  if (!open || !portalRef.current || !item) return null;

  return createPortal(
    <div
      className="fixed left-0 top-0 w-screen z-[9999]"
      style={{ height: vhPx }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="esp-detalle-title"
    >
      <div className="absolute inset-0 bg-black/55" onClick={onClose} />
      <div className="relative h-full w-full grid place-items-center p-4 md:p-6">
        <div
          className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex items-center justify-between">
            <h3
              id="esp-detalle-title"
              className="font-bold text-[clamp(15px,4vw,18px)] truncate pr-2"
              title={item.especialidad || "Especialidad"}
            >
              {item.especialidad || "Especialidad"}
            </h3>
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-sm font-semibold"
            >
              Cerrar
            </button>
          </div>

          {/* Body */}
          <div className="p-4 sm:p-5 overflow-y-auto max-h-[80dvh]">
            <dl className="space-y-3 text-[clamp(13px,3.4vw,14px)]">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <dt className="text-gray-500 font-medium">Prioridad</dt>
                  <dd className="text-gray-800">{item.prioridad || "—"}</dd>
                </div>
                <div>
                  <dt className="text-gray-500 font-medium">Fecha de asignación</dt>
                  <dd className="text-gray-800">{item.fecha_asignacion || "—"}</dd>
                </div>
              </div>

              <div>
                <dt className="text-gray-500 font-medium">Observaciones</dt>
                <dd className="text-gray-800 whitespace-pre-wrap break-words">
                  {item.observaciones || "Sin observaciones"}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>,
    portalRef.current
  );
}

/* --------------------- Helper: badge por prioridad --------------------- */
const badgeClasses = (p) => {
  const map = {
    ROJO: "bg-rose-100 text-rose-800 ring-rose-200",
    NARANJA: "bg-orange-100 text-orange-800 ring-orange-200",
    AMARILLO: "bg-yellow-100 text-yellow-800 ring-yellow-200",
    VERDE: "bg-emerald-100 text-emerald-800 ring-emerald-200",
    AZUL: "bg-blue-100 text-blue-800 ring-blue-200",
  };
  return map[p?.toUpperCase?.()] || "bg-gray-100 text-gray-800 ring-gray-200";
};

/* ======================= Componente principal ======================= */
const TablaHistorialEspecialidades = ({ historial = [], isLoading = false }) => {
  /* Items por página: 5 móvil, 8 ≥ md */
  const [elementosPorPagina, setElementosPorPagina] = useState(5);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setElementosPorPagina(mq.matches ? 8 : 5);
    update();
    const add = mq.addEventListener ? mq.addEventListener : mq.addListener;
    const rm = mq.removeEventListener ? mq.removeEventListener : mq.removeListener;
    add.call(mq, "change", update);
    return () => rm.call(mq, "change", update);
  }, []);

  const totalRegistros = historial?.length || 0;
  const totalPaginas = Math.max(1, Math.ceil(totalRegistros / elementosPorPagina));
  const [paginaActual, setPaginaActual] = useState(1);

  // Ajustar página si cambia el tamaño o llega menos data
  useEffect(() => {
    const nuevaTotal = Math.max(1, Math.ceil((historial?.length || 0) / elementosPorPagina));
    if (paginaActual > nuevaTotal) setPaginaActual(nuevaTotal);
  }, [elementosPorPagina, historial, paginaActual]);

  const historialPaginado = useMemo(() => {
    const start = (paginaActual - 1) * elementosPorPagina;
    return (historial || []).slice(start, start + elementosPorPagina);
  }, [historial, paginaActual, elementosPorPagina]);

  const cambiarPagina = useCallback(
    (nuevaPagina) => {
      if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) setPaginaActual(nuevaPagina);
    },
    [totalPaginas]
  );

  // Paginación compacta: 1 … (c-1 c c+1) … last
  const pages = useMemo(() => {
    const arr = [];
    const push = (v) => arr.push(v);
    if (totalPaginas <= 7) {
      for (let i = 1; i <= totalPaginas; i++) push(i);
      return arr;
    }
    push(1);
    const start = Math.max(2, paginaActual - 1);
    const end = Math.min(totalPaginas - 1, paginaActual + 1);
    if (start > 2) push("…");
    for (let i = start; i <= end; i++) push(i);
    if (end < totalPaginas - 1) push("…");
    push(totalPaginas);
    return arr;
  }, [paginaActual, totalPaginas]);

  /* Modal state */
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const openDetail = useCallback((item) => {
    setSelected(item);
    setOpen(true);
  }, []);
  const closeDetail = useCallback(() => setOpen(false), []);

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-xl overflow-hidden">
      {/* Header */}
      <div className="px-4 sm:px-5 md:px-6 py-3.5 sm:py-4 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
          <h2 className="text-base sm:text-lg md:text-xl font-bold text-white">
            Historial de Especialidades
          </h2>
          <span className="px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold bg-white/20 text-white">
            {totalRegistros} registro{totalRegistros === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      <div className="p-4 sm:p-5 md:p-6">
        {/* -------------------- Cards móviles (< md) -------------------- */}
        <div className="md:hidden space-y-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div
                key={`s-${i}`}
                className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-white to-indigo-50/70 shadow-sm p-4 animate-pulse"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="h-4 w-40 bg-indigo-100 rounded" />
                  <div className="h-6 w-24 bg-indigo-100 rounded-full" />
                </div>
                <div className="mt-3 h-3 w-28 bg-indigo-100 rounded" />
                <div className="mt-3 h-10 w-full bg-indigo-100 rounded" />
                <div className="mt-3 h-3 w-36 bg-indigo-100 rounded" />
              </div>
            ))
          ) : historialPaginado.length > 0 ? (
            historialPaginado.map((item, i) => (
              <div
                key={`${item.id ?? item.especialidad ?? "esp"}-${i}`}
                className="group relative rounded-2xl border border-indigo-100 bg-white shadow-sm p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3
                    className="text-sm font-bold text-gray-900 min-w-0 truncate"
                    title={item.especialidad || "N/A"}
                  >
                    {item.especialidad || "N/A"}
                  </h3>
                  <span
                    className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-semibold ring-1 ${badgeClasses(
                      item.prioridad
                    )}`}
                  >
                    {item.prioridad || "—"}
                  </span>
                </div>

                <div className="mt-2">
                  <p className="text-[11px] text-gray-500 font-semibold">Observaciones</p>
                  <p
                    className="mt-1 text-[clamp(13px,3.6vw,14px)] text-gray-800 break-words line-clamp-2"
                    title={item.observaciones || "Sin observaciones"}
                  >
                    {item.observaciones || "Sin observaciones"}
                  </p>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[11px] text-gray-500">Fecha</span>
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-indigo-100 text-indigo-800 ring-1 ring-indigo-200">
                    {item.fecha_asignacion || "—"}
                  </span>
                </div>

                <div className="mt-3">
                  <button
                    onClick={() => openDetail(item)}
                    className="w-full px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-500 active:scale-[0.99]"
                  >
                    Ver detalle
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-gray-200 bg-white p-6 text-center text-gray-500">
              No hay especialidades registradas para el paciente seleccionado.
            </div>
          )}
        </div>

        {/* -------------------- Tabla desktop (≥ md) -------------------- */}
        <div className="hidden md:block">
          <div className="overflow-x-auto rounded-xl ring-1 ring-indigo-100">
            <table className="w-full table-auto">
              <thead className="bg-gradient-to-r from-indigo-50 to-purple-50">
                <tr className="text-indigo-900">
                  <th className="py-3.5 px-4 text-left text-sm font-semibold">Especialidad Asignada</th>
                  <th className="py-3.5 px-4 text-left text-sm font-semibold">Prioridad</th>
                  <th className="py-3.5 px-4 text-left text-sm font-semibold">Observaciones</th>
                  <th className="py-3.5 px-4 text-left text-sm font-semibold">Fecha de Asignación</th>
                  <th className="py-3.5 px-4 text-left text-sm font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={`sk-${i}`} className={i % 2 ? "bg-white" : "bg-indigo-50/40"}>
                      <td className="py-3 px-4">
                        <div className="h-4 w-56 bg-indigo-100 rounded animate-pulse" />
                      </td>
                      <td className="py-3 px-4">
                        <div className="h-6 w-24 bg-indigo-100 rounded-full animate-pulse" />
                      </td>
                      <td className="py-3 px-4">
                        <div className="h-4 w-80 bg-indigo-100 rounded animate-pulse" />
                      </td>
                      <td className="py-3 px-4">
                        <div className="h-4 w-32 bg-indigo-100 rounded animate-pulse" />
                      </td>
                      <td className="py-3 px-4">
                        <div className="h-8 w-24 bg-indigo-100 rounded animate-pulse" />
                      </td>
                    </tr>
                  ))
                ) : historialPaginado.length > 0 ? (
                  historialPaginado.map((item, i) => (
                    <tr
                      key={`${item.id ?? item.especialidad ?? "esp"}-${i}`}
                      className={`${i % 2 ? "bg-white" : "bg-indigo-50/40"} hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-colors`}
                    >
                      <td
                        className="py-3 px-4 text-gray-700 max-w-[24rem]"
                        title={item.especialidad || "N/A"}
                      >
                        <span className="block truncate">{item.especialidad || "N/A"}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ${badgeClasses(
                            item.prioridad
                          )}`}
                        >
                          {item.prioridad || "—"}
                        </span>
                      </td>
                      <td
                        className="py-3 px-4 text-gray-700 max-w-[28rem]"
                        title={item.observaciones || "Sin observaciones"}
                      >
                        <span className="block overflow-hidden text-ellipsis whitespace-nowrap">
                          {item.observaciones || "Sin observaciones"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-700 whitespace-nowrap">
                        {item.fecha_asignacion || "—"}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => openDetail(item)}
                          className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white ring-1 ring-indigo-200 text-indigo-700 hover:bg-indigo-50"
                        >
                          Ver detalle
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center py-8 text-gray-500 bg-gradient-to-r from-indigo-50 via-white to-indigo-50"
                    >
                      No hay especialidades registradas para el paciente seleccionado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* -------------------- Paginación -------------------- */}
        {!isLoading && totalRegistros > elementosPorPagina && (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => cambiarPagina(paginaActual - 1)}
              disabled={paginaActual === 1}
              className="px-3 sm:px-4 py-2 rounded-xl bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50 disabled:opacity-50"
              aria-label="Página anterior"
            >
              ← Anterior
            </button>

            <nav className="flex items-center gap-1" aria-label="Paginación">
              {pages.map((p, idx) =>
                p === "…" ? (
                  <span key={`dots-${idx}`} className="px-2 text-gray-400 select-none">
                    …
                  </span>
                ) : (
                  <button
                    key={`p-${p}`}
                    onClick={() => cambiarPagina(p)}
                    className={`h-9 min-w-9 px-3 rounded-xl text-sm font-semibold ring-1 transition
                      ${
                        p === paginaActual
                          ? "bg-indigo-600 text-white ring-indigo-600"
                          : "bg-white text-gray-700 ring-gray-200 hover:bg-gray-50"
                      }`}
                    aria-current={p === paginaActual ? "page" : undefined}
                    aria-label={`Ir a la página ${p}`}
                  >
                    {p}
                  </button>
                )
              )}
            </nav>

            <button
              type="button"
              onClick={() => cambiarPagina(paginaActual + 1)}
              disabled={paginaActual === totalPaginas}
              className="px-3 sm:px-4 py-2 rounded-xl bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50 disabled:opacity-50"
              aria-label="Página siguiente"
            >
              Siguiente →
            </button>
          </div>
        )}
      </div>

      {/* Utilitarias (line-clamp y reduce motion) */}
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

      {/* Modal */}
      <DetailModal open={open} onClose={closeDetail} item={selected} />
    </div>
  );
};

export default TablaHistorialEspecialidades;
