"use client";

import React, {
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
} from "react";
import { createPortal } from "react-dom";

/* ---------- Modal de detalle (portal + visual viewport) ---------- */
function DetailModal({ open, onClose, item }) {
  const portalRef = useRef(null);
  const [vhPx, setVhPx] = useState(
    typeof window !== "undefined" ? window.innerHeight : 0
  );

  useEffect(() => {
    const node = document.createElement("div");
    node.setAttribute("data-portal", "incapacidades-detail");
    document.body.appendChild(node);
    portalRef.current = node;
    return () => {
      if (portalRef.current) document.body.removeChild(portalRef.current);
      portalRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && onClose();
    const vv = window.visualViewport;
    const update = () => setVhPx(vv?.height ?? window.innerHeight);
    update();
    vv?.addEventListener("resize", update);
    vv?.addEventListener("scroll", update);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev || "";
      vv?.removeEventListener("resize", update);
      vv?.removeEventListener("scroll", update);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open || !portalRef.current || !item) return null;

  const node = (
    <div
      className="fixed inset-0 z-[9999]"
      style={{ height: vhPx }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="incap-detalle-title"
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
              id="incap-detalle-title"
              className="font-bold text-[clamp(15px,4vw,18px)] truncate pr-2"
            >
              Folio #{item.claveconsulta ?? "—"}
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
                  <dt className="text-gray-500 font-medium">Registro/Captura</dt>
                  <dd className="text-gray-800">{item.fecha || "—"}</dd>
                </div>
                <div>
                  <dt className="text-gray-500 font-medium">Proveedor (si aplica)</dt>
                  <dd className="text-gray-800">{item.nombreproveedor || "—"}</dd>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <dt className="text-emerald-700 font-medium">Inicio</dt>
                  <dd className="text-gray-800">{item.fechainicio || "—"}</dd>
                </div>
                <div>
                  <dt className="text-rose-700 font-medium">Fin</dt>
                  <dd className="text-gray-800">{item.fechafin || "—"}</dd>
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
    </div>
  );

  return createPortal(node, portalRef.current);
}

/* =================== Tabla/Cards con paginación y modal =================== */
const HistorialIncapacidadesTable = ({ historial }) => {
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

  /* Ventana compacta 1 … (c-1 c c+1) … last */
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
    <div className="rounded-2xl border border-gray-100 bg-white shadow-md mt-8 overflow-hidden w-full min-w-0">
      {/* Header */}
      <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          <h2 className="font-bold text-white text-[clamp(15px,3.8vw,20px)]">
            Historial de Incapacidades
          </h2>
          <span className="px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold bg-white/20 text-white">
            {totalRegistros} registros
          </span>
        </div>
      </div>

      <div className="p-3 sm:p-4 md:p-6">
        {/* TABLA ≥ md */}
        <div className="hidden md:block">
          <div className="overflow-x-auto rounded-xl ring-1 ring-indigo-100">
            <table className="w-full table-auto">
              <thead className="sticky top-0 z-10">
                <tr className="bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-900 text-[13px]">
                  <th className="py-3 px-4 text-left font-semibold">Folio consulta</th>
                  <th className="py-3 px-4 text-left font-semibold">Observaciones</th>
                  <th className="py-3 px-4 text-left font-semibold">Registro / Captura</th>
                  <th className="py-3 px-4 text-left font-semibold">Inicio</th>
                  <th className="py-3 px-4 text-left font-semibold">Fin</th>
                  <th className="py-3 px-4 text-left font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody className="text-[13px]">
                {historialPaginado.length > 0 ? (
                  historialPaginado.map((item, idx) => (
                    <tr
                      key={`${item.claveconsulta ?? idx}-${idx}`}
                      className={`${idx % 2 === 0 ? "bg-white" : "bg-indigo-50/40"} hover:bg-indigo-50 transition-colors`}
                    >
                      <td className="py-3 px-4 text-gray-700 whitespace-nowrap">
                        <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200">
                          #{item.claveconsulta || "—"}
                        </span>
                      </td>

                      {/* 1 línea con … */}
                      <td className="py-3 px-4 text-gray-700 max-w-[36rem]">
                        <span
                          className="overflow-hidden text-ellipsis whitespace-nowrap block"
                          title={item.observaciones || "Sin observaciones"}
                        >
                          {item.observaciones || "Sin observaciones"}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-gray-700 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md text-xs bg-slate-100 text-slate-700 ring-1 ring-slate-200">
                          {item.fecha || "—"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-700 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md text-xs bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200">
                          {item.fechainicio || "—"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-700 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md text-xs bg-rose-100 text-rose-700 ring-1 ring-rose-200">
                          {item.fechafin || "—"}
                        </span>
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
                    <td colSpan={6} className="text-center py-8 text-gray-500 bg-gradient-to-r from-indigo-50 via-white to-indigo-50">
                      No hay incapacidades registradas para el paciente.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* CARDS < md */}
        <div className="md:hidden">
          {historialPaginado.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {historialPaginado.map((item, i) => (
                <div
                  key={`${item.claveconsulta ?? i}-card`}
                  className="rounded-xl border border-gray-200 bg-white shadow-sm p-4"
                >
                  {/* Row superior: Folio + Fecha captura */}
                  <div className="flex items-start justify-between gap-2">
                    <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[12px] font-semibold bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200">
                      Folio #{item.claveconsulta || "—"}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[11px] bg-slate-100 text-slate-700 ring-1 ring-slate-200 shrink-0">
                      {item.fecha || "—"}
                    </span>
                  </div>

                  {/* Observaciones */}
                  <div className="mt-3">
                    <p className="text-[12px] text-gray-500 font-semibold">Observaciones</p>
                    <p
                      className="mt-1 text-[clamp(13px,3.6vw,14px)] text-gray-800 break-words line-clamp-2"
                      title={item.observaciones || "Sin observaciones"}
                    >
                      {item.observaciones || "Sin observaciones"}
                    </p>
                  </div>

                  {/* Inicio / Fin */}
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5">
                      <div className="text-[11px] text-emerald-700 font-medium">Inicio</div>
                      <div className="text-[12px] text-emerald-800 overflow-hidden text-ellipsis whitespace-nowrap">
                        {item.fechainicio || "—"}
                      </div>
                    </div>
                    <div className="rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5">
                      <div className="text-[11px] text-rose-700 font-medium">Fin</div>
                      <div className="text-[12px] text-rose-800 overflow-hidden text-ellipsis whitespace-nowrap">
                        {item.fechafin || "—"}
                      </div>
                    </div>
                  </div>

                  {/* Acción */}
                  <div className="mt-3">
                    <button
                      onClick={() => openDetail(item)}
                      className="w-full px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-500 active:scale-[0.99]"
                    >
                      Ver detalle
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 bg-gradient-to-r from-indigo-50 via-white to-indigo-50 rounded-2xl border border-indigo-100">
              No hay incapacidades registradas para el paciente.
            </div>
          )}
        </div>

        {/* Paginación */}
        {totalPaginas > 1 && (
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-gray-500">
              Mostrando <span className="font-semibold">{historialPaginado.length}</span> de{" "}
              <span className="font-semibold">{totalRegistros}</span> registros
            </div>

            <nav className="flex items-center gap-1" aria-label="Paginación">
              <button
                className="px-3 py-2 rounded-xl text-sm bg-white ring-1 ring-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                onClick={() => cambiarPagina(paginaActual - 1)}
                disabled={paginaActual === 1}
                aria-label="Página anterior"
              >
                Anterior
              </button>

              <div className="flex items-center gap-1">
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
              </div>

              <button
                className="px-3 py-2 rounded-xl text-sm bg-white ring-1 ring-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                onClick={() => cambiarPagina(paginaActual + 1)}
                disabled={paginaActual === totalPaginas}
                aria-label="Página siguiente"
              >
                Siguiente
              </button>
            </nav>
          </div>
        )}
      </div>

      {/* Utilitarias */}
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

export default HistorialIncapacidadesTable;
