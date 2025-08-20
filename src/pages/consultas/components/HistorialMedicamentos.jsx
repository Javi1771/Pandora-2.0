"use client";

import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { showCustomAlert } from "../../../utils/alertas";

/* Chip memoizado */
const Chip = React.memo(function Chip({ children, color = "indigo" }) {
  const styles =
    color === "green"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : color === "rose"
      ? "bg-rose-50 text-rose-700 ring-rose-200"
      : "bg-indigo-50 text-indigo-700 ring-indigo-200";
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ring-1 ${styles}`}>
      {children}
    </span>
  );
});

/* Modal accesible y ligero */
function DetailModal({ open, onClose, item }) {
  const ref = useRef(null);
  const prevOverflow = useRef("");

  useEffect(() => {
    if (!open) return;
    // Lock scroll
    prevOverflow.current = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const firstFocusable = () => {
      const root = ref.current;
      if (!root) return;
      const focusables = root.querySelectorAll('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])');
      if (focusables.length) focusables[0].focus();
    };
    firstFocusable();

    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow.current || "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;
  if (!item) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="historial-detalle-title"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      {/* Contenedor */}
      <div
        ref={ref}
        className="relative w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex items-center justify-between">
          <h3 id="historial-detalle-title" className="font-bold text-[clamp(15px,3.8vw,18px)] truncate pr-2">
            {item.medicamento || "Detalle"}
          </h3>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-white/60"
          >
            Cerrar
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 overflow-y-auto">
          <dl className="space-y-3 text-[clamp(13px,3.4vw,14px)]">
            <div>
              <dt className="text-gray-500 font-medium">Medicamento</dt>
              <dd className="text-gray-800 break-words">{item.medicamento || "—"}</dd>
            </div>
            <div>
              <dt className="text-gray-500 font-medium">Indicaciones</dt>
              <dd className="text-gray-800 whitespace-pre-wrap break-words">{item.indicaciones || "—"}</dd>
            </div>
            <div>
              <dt className="text-gray-500 font-medium">Tratamiento</dt>
              <dd className="text-gray-800 break-words">{item.tratamiento || "—"}</dd>
            </div>
            <div className="flex items-center gap-2">
              <div>
                <dt className="text-gray-500 font-medium">Piezas</dt>
                <dd className="text-gray-800">{item.piezas || "—"}</dd>
              </div>
              <div>
                <dt className="text-gray-500 font-medium">Fecha emisión</dt>
                <dd className="text-gray-800">{item.fechaEmision || "—"}</dd>
              </div>
            </div>
            <div>
              <dt className="text-gray-500 font-medium">Proveedor</dt>
              <dd className="text-gray-800 break-words">{item.nombreproveedor || "—"}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}

export default function HistorialMedicamentos({ clavenomina, clavepaciente }) {
  const [historialMedicamentos, setHistorialMedicamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // items por página: móvil 5, >= md 8
  const itemsPerPage = useMemo(() => {
    if (typeof window === "undefined") return 5;
    return window.matchMedia("(min-width: 768px)").matches ? 8 : 5;
  }, []);

  // Restaurar caché para mostrar algo inmediato
  useEffect(() => {
    const cached = JSON.parse(localStorage.getItem("historialMedicamentos") || "[]");
    if (Array.isArray(cached) && cached.length) {
      setHistorialMedicamentos(cached);
      setLoading(false);
    }
  }, []);

  // Cargar desde API con cancelación
  useEffect(() => {
    if (!clavenomina || !clavepaciente) return;

    const ac = new AbortController();
    const url = `/api/medicamentos/historial?${new URLSearchParams({
      clavepaciente,
      clavenomina,
    }).toString()}`;

    (async () => {
      try {
        setLoading(true);
        const res = await fetch(url, { signal: ac.signal });
        const data = await res.json();
        if (res.ok && data.ok) {
          const lista = Array.isArray(data.historial) ? data.historial : [];
          setHistorialMedicamentos(lista);
          setCurrentPage(1);
        } else {
          setHistorialMedicamentos([]);
          await showCustomAlert(
            "error",
            "Error al cargar historial",
            "No se pudo cargar el historial. Inténtalo nuevamente.",
            "Aceptar"
          );
        }
      } catch (err) {
        if (err?.name !== "AbortError") {
          console.error("Error al cargar historial:", err);
          setHistorialMedicamentos([]);
          await showCustomAlert(
            "error",
            "Error al cargar historial",
            "Ocurrió un problema al cargar el historial.",
            "Aceptar"
          );
        }
      } finally {
        setLoading(false);
      }
    })();

    return () => ac.abort();
  }, [clavenomina, clavepaciente]);

  // Guardar caché cuando cambie
  useEffect(() => {
    localStorage.setItem("historialMedicamentos", JSON.stringify(historialMedicamentos));
  }, [historialMedicamentos]);

  const totalPages = Math.max(1, Math.ceil(historialMedicamentos.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = historialMedicamentos.slice(startIndex, startIndex + itemsPerPage);

  const openDetail = useCallback((item) => {
    setSelectedItem(item);
    setModalOpen(true);
  }, []);
  const closeDetail = useCallback(() => setModalOpen(false), []);

  const goPrev = useCallback(() => setCurrentPage((p) => Math.max(1, p - 1)), []);
  const goNext = useCallback(() => setCurrentPage((p) => Math.min(totalPages, p + 1)), [totalPages]);

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-md overflow-hidden mt-8 w-full min-w-0">
      {/* Header */}
      <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          <h3 className="font-bold text-white text-[clamp(15px,3.8vw,20px)]">Historial de Medicamentos</h3>
          <span className="px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold bg-white/20 text-white">
            {historialMedicamentos.length} registros
          </span>
        </div>
      </div>

      <div className="p-3 sm:p-4 md:p-6">
        {/* Skeleton */}
        {loading && (
          <div className="space-y-3">
            <div className="hidden md:block">
              <div className="h-9 w-full bg-gray-100 rounded" />
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 w-full bg-gray-50 rounded mt-2 animate-pulse" />
              ))}
            </div>
            <div className="md:hidden grid grid-cols-1 min-[480px]:grid-cols-2 gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-28 bg-gray-50 rounded-xl animate-pulse" />
              ))}
            </div>
          </div>
        )}

        {!loading && (
          <>
            {/* Tabla (>= md) */}
            <div className="hidden md:block">
              <div className="overflow-x-auto rounded-xl ring-1 ring-indigo-100">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="bg-indigo-50 text-indigo-900 text-[13px]">
                      <th className="py-3 px-4 text-left font-semibold">Medicamento</th>
                      <th className="py-3 px-4 text-left font-semibold">Indicaciones</th>
                      <th className="py-3 px-4 text-left font-semibold">Tratamiento</th>
                      <th className="py-3 px-4 text-left font-semibold">Piezas</th>
                      <th className="py-3 px-4 text-left font-semibold">Proveedor</th>
                      <th className="py-3 px-4 text-left font-semibold whitespace-nowrap">Fecha Emisión</th>
                      <th className="py-3 px-4 text-left font-semibold">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="text-[13px]">
                    {currentItems.length > 0 ? (
                      currentItems.map((item, i) => (
                        <tr
                          key={i}
                          className={`${i % 2 === 0 ? "bg-white" : "bg-indigo-50/40"} hover:bg-indigo-50 transition-colors`}
                        >
                          <td className="py-3 px-4 text-gray-700 max-w-[16rem]">
                            <span className="block truncate" title={item.medicamento}>
                              {item.medicamento}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-700 max-w-[20rem]">
                            <span className="block truncate" title={item.indicaciones}>
                              {item.indicaciones}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-700 max-w-[16rem]">
                            <span className="block truncate" title={item.tratamiento || ""}>
                              {item.tratamiento || "—"}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-700 whitespace-nowrap">
                            {item.piezas ? <Chip color="green">{item.piezas} piezas</Chip> : <Chip color="rose">—</Chip>}
                          </td>
                          <td className="py-3 px-4 text-gray-700 max-w-[16rem]">
                            <span className="block truncate" title={item.nombreproveedor || ""}>
                              {item.nombreproveedor || "—"}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-700 whitespace-nowrap">{item.fechaEmision || "—"}</td>
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
                        <td colSpan={7} className="text-center py-8 text-gray-500 bg-white">
                          No hay medicamentos registrados.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Cards móviles (< md) */}
            <div className="md:hidden">
              {currentItems.length > 0 ? (
                <div className="grid grid-cols-1 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))] gap-3">
                  {currentItems.map((item, i) => (
                    <div key={i} className="rounded-2xl border border-indigo-100 bg-white shadow-sm p-4">
                      <div className="flex items-start justify-between gap-2">
                        <h4
                          className="font-semibold text-gray-800 pr-2 text-[clamp(14px,3.6vw,16px)] truncate"
                          title={item.medicamento}
                        >
                          {item.medicamento}
                        </h4>
                        <Chip>{item.fechaEmision || "—"}</Chip>
                      </div>

                      <div className="mt-2 text-[clamp(12px,3.4vw,14px)] text-gray-700 space-y-1.5">
                        <p className="line-clamp-2 break-words">
                          <b>Indicaciones:</b> <span className="text-gray-700">{item.indicaciones}</span>
                        </p>
                        <p className="line-clamp-2 break-words">
                          <b>Tratamiento:</b> <span className="text-gray-700">{item.tratamiento || "—"}</span>
                        </p>
                        <p className="flex items-center gap-2">
                          <b>Piezas:</b>{" "}
                          {item.piezas ? <Chip color="green">{item.piezas}</Chip> : <Chip color="rose">—</Chip>}
                        </p>
                        <p className="line-clamp-2 break-words">
                          <b>Proveedor:</b> <span className="text-gray-700">{item.nombreproveedor || "—"}</span>
                        </p>
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
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">No hay medicamentos registrados.</div>
              )}
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3 mt-6">
                <button
                  onClick={goPrev}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-full text-sm font-semibold bg-white ring-1 ring-indigo-200 text-indigo-700 hover:bg-indigo-50 disabled:opacity-50"
                >
                  Anterior
                </button>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200">
                  Página {currentPage} de {totalPages}
                </span>
                <button
                  onClick={goNext}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-full text-sm font-semibold bg-white ring-1 ring-indigo-200 text-indigo-700 hover:bg-indigo-50 disabled:opacity-50"
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      <DetailModal open={modalOpen} onClose={closeDetail} item={selectedItem} />

      {/* Reduce motion */}
      <style jsx global>{`
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.001ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.001ms !important;
            scroll-behavior: auto !important;
          }
        }
        /* Si no usas plugin de line-clamp de Tailwind, esto habilita 2 líneas con ellipsis en mobile cards */
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
