"use client";

/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/router";

const HistorialConsultas = ({ clavepaciente, clavenomina }) => {
  const router = useRouter();

  /* --------- estado --------- */
  const [consultas, setConsultas] = useState([]);
  const [loading, setLoading] = useState(true);

  /* Items por página: 5 móvil, 10 ≥ md */
  const [itemsPerPage, setItemsPerPage] = useState(5);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setItemsPerPage(mq.matches ? 10 : 5);
    update();
    const add = mq.addEventListener ? mq.addEventListener : mq.addListener;
    const rm = mq.removeEventListener ? mq.removeEventListener : mq.removeListener;
    add.call(mq, "change", update);
    return () => rm.call(mq, "change", update);
  }, []);

  const [currentPage, setCurrentPage] = useState(1);

  /* --------- fetch (refresca cuando cambian claves) --------- */
  useEffect(() => {
    if (!clavepaciente && !clavenomina) {
      setConsultas([]);
      setLoading(false);
      return;
    }

    const ac = new AbortController();
    const params = new URLSearchParams();
    if (clavepaciente) params.append("clavepaciente", clavepaciente);
    if (clavenomina) params.append("clavenomina", clavenomina);

    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/historial-consultas/historialConsultas?${params.toString()}`, { signal: ac.signal });
        const data = await res.json();
        if (res.ok) {
          setConsultas(Array.isArray(data) ? data : []);
          setCurrentPage(1); // reinicia página
        } else {
          console.error("Error al cargar historial de consultas:", data?.message);
          setConsultas([]);
        }
      } catch (err) {
        if (err?.name !== "AbortError") {
          console.error("Error inesperado al cargar historial de consultas:", err);
          setConsultas([]);
        }
      } finally {
        setLoading(false);
      }
    })();

    return () => ac.abort();
  }, [clavepaciente, clavenomina]);

  /* --------- paginación --------- */
  const totalPages = Math.max(1, Math.ceil(consultas.length / itemsPerPage));
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [itemsPerPage, consultas, currentPage, totalPages]);

  const paginatedConsultas = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return consultas.slice(start, start + itemsPerPage);
  }, [consultas, currentPage, itemsPerPage]);

  const pages = useMemo(() => {
    const arr = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) arr.push(i);
      return arr;
    }
    arr.push(1);
    const s = Math.max(2, currentPage - 1);
    const e = Math.min(totalPages - 1, currentPage + 1);
    if (s > 2) arr.push("…");
    for (let i = s; i <= e; i++) arr.push(i);
    if (e < totalPages - 1) arr.push("…");
    arr.push(totalPages);
    return arr;
  }, [currentPage, totalPages]);

  /* --------- navegación (click fila/card) --------- */
  const goToReceta = useCallback((consulta) => {
    if (!consulta?.claveconsulta) {
      console.error("La consulta no tiene claveconsulta:", consulta);
      return;
    }
    const encryptedClaveConsulta = btoa(String(consulta.claveconsulta));
    router.push(`/consultas/recetas/ver-recetas?claveconsulta=${encryptedClaveConsulta}`);
  }, [router]);

  const onRowKeyDown = (e, c) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      goToReceta(c);
    }
  };

  if (!clavepaciente && !clavenomina) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white shadow-md p-6 text-center text-gray-400">
        Esperando datos del paciente o nómina...
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-md overflow-hidden">
      {/* Header degradado */}
      <div className="px-4 sm:px-5 md:px-6 py-3.5 sm:py-4 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
          <h2 className="text-base sm:text-lg md:text-xl font-bold text-white">Consultas Realizadas</h2>
          <span className="px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold bg-white/20 text-white">
            {consultas.length} registro{consultas.length === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      <div className="p-4 sm:p-5 md:p-6">
        {/* ---------- Skeletons ---------- */}
        {loading && (
          <>
            <div className="hidden md:block">
              <div className="overflow-x-auto rounded-xl ring-1 ring-indigo-100">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="bg-indigo-50 text-indigo-900 text-sm">
                      <th className="py-3 px-4 text-left font-semibold">Fecha</th>
                      <th className="py-3 px-4 text-left font-semibold">Motivo</th>
                      <th className="py-3 px-4 text-left font-semibold">Diagnóstico</th>
                      <th className="py-3 px-4 text-left font-semibold">Especialidad</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i} className={i % 2 ? "bg-white" : "bg-indigo-50/40"}>
                        {Array.from({ length: 4 }).map((_, j) => (
                          <td key={j} className="py-3 px-4">
                            <div className="h-4 w-full bg-indigo-100 rounded animate-pulse" />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="md:hidden grid grid-cols-1 min-[480px]:grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-28 bg-indigo-50/60 border border-indigo-100 rounded-xl animate-pulse" />
              ))}
            </div>
          </>
        )}

        {/* ---------- Contenido ---------- */}
        {!loading && (
          <>
            {/* Tabla (≥ md) */}
            <div className="hidden md:block">
              <div className="overflow-x-auto rounded-xl ring-1 ring-indigo-100">
                <table className="w-full table-auto">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-900 text-[13px]">
                      <th className="py-3 px-4 text-left font-semibold">Fecha de consulta</th>
                      <th className="py-3 px-4 text-left font-semibold">Motivo de consulta</th>
                      <th className="py-3 px-4 text-left font-semibold">Diagnóstico</th>
                      <th className="py-3 px-4 text-left font-semibold">Especialidad</th>
                    </tr>
                  </thead>
                  <tbody className="text-[13px]">
                    {paginatedConsultas.length > 0 ? (
                      paginatedConsultas.map((consulta, idx) => (
                        <tr
                          key={`${consulta?.claveconsulta ?? idx}-${idx}`}
                          tabIndex={0}
                          onClick={() => goToReceta(consulta)}
                          onKeyDown={(e) => onRowKeyDown(e, consulta)}
                          className={`${idx % 2 ? "bg-white" : "bg-indigo-50/40"} 
                                      hover:bg-indigo-50 focus:bg-indigo-50 
                                      transition-colors cursor-pointer outline-none`}
                        >
                          <td className="py-3 px-4 text-gray-700 whitespace-nowrap">
                            {consulta?.fechaconsulta
                              ? new Date(consulta.fechaconsulta).toLocaleDateString("es-MX", {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                })
                              : "N/A"}
                          </td>
                          <td className="py-3 px-4 text-gray-700 max-w-[22rem]">
                            <span className="block overflow-hidden text-ellipsis whitespace-nowrap" title={consulta?.motivoconsulta || "Sin motivo"}>
                              {consulta?.motivoconsulta || "Sin motivo"}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-700 max-w-[22rem]">
                            <span className="block overflow-hidden text-ellipsis whitespace-nowrap" title={consulta?.diagnostico || "Sin diagnóstico"}>
                              {consulta?.diagnostico || "Sin diagnóstico"}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-700 max-w-[16rem]">
                            <span className="block overflow-hidden text-ellipsis whitespace-nowrap" title={consulta?.especialidadinterconsulta || "N/A"}>
                              {consulta?.especialidadinterconsulta || "N/A"}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="text-center py-8 text-gray-500 bg-gradient-to-r from-indigo-50 via-white to-indigo-50">
                          No hay consultas para el paciente seleccionado.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Cards (< md) */}
            <div className="md:hidden">
              {paginatedConsultas.length > 0 ? (
                <div className="grid grid-cols-1 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))] gap-3">
                  {paginatedConsultas.map((consulta, i) => (
                    <div
                      key={`${consulta?.claveconsulta ?? i}-card`}
                      role="button"
                      tabIndex={0}
                      onClick={() => goToReceta(consulta)}
                      onKeyDown={(e) => onRowKeyDown(e, consulta)}
                      className="rounded-2xl border border-indigo-100 bg-white shadow-sm p-4 active:scale-[0.99] transition"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold text-gray-800 pr-2 text-[clamp(14px,3.6vw,16px)] truncate">
                          {consulta?.especialidadinterconsulta || "Consulta"}
                        </h4>
                        <span className="px-2 py-0.5 rounded-md text-[11px] bg-indigo-100 text-indigo-800 ring-1 ring-indigo-200 shrink-0">
                          {consulta?.fechaconsulta
                            ? new Date(consulta.fechaconsulta).toLocaleDateString("es-MX", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              })
                            : "N/A"}
                        </span>
                      </div>

                      <div className="mt-2 text-[clamp(12px,3.4vw,14px)] text-gray-700 space-y-1.5">
                        <p className="line-clamp-2 break-words">
                          <b>Motivo:</b> <span className="text-gray-700">{consulta?.motivoconsulta || "Sin motivo"}</span>
                        </p>
                        <p className="line-clamp-2 break-words">
                          <b>Diagnóstico:</b> <span className="text-gray-700">{consulta?.diagnostico || "Sin diagnóstico"}</span>
                        </p>
                        <p className="overflow-hidden text-ellipsis whitespace-nowrap">
                          <b>Especialidad:</b> <span className="text-gray-700">{consulta?.especialidadinterconsulta || "N/A"}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">No hay consultas para el paciente seleccionado.</div>
              )}
            </div>

            {/* Paginación */}
            {consultas.length > itemsPerPage && (
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 sm:px-4 py-2 rounded-xl bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50 disabled:opacity-50"
                  aria-label="Página anterior"
                >
                  ← Anterior
                </button>

                <nav className="flex items-center gap-1" aria-label="Paginación">
                  {pages.map((p, idx) =>
                    p === "…" ? (
                      <span key={`dots-${idx}`} className="px-2 text-gray-400 select-none">…</span>
                    ) : (
                      <button
                        key={`p-${p}`}
                        onClick={() => setCurrentPage(p)}
                        className={`h-9 min-w-9 px-3 rounded-xl text-sm font-semibold ring-1 transition
                          ${p === currentPage ? "bg-indigo-600 text-white ring-indigo-600" : "bg-white text-gray-700 ring-gray-200 hover:bg-gray-50"}`}
                        aria-current={p === currentPage ? "page" : undefined}
                        aria-label={`Ir a la página ${p}`}
                      >
                        {p}
                      </button>
                    )
                  )}
                </nav>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 sm:px-4 py-2 rounded-xl bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50 disabled:opacity-50"
                  aria-label="Página siguiente"
                >
                  Siguiente →
                </button>
              </div>
            )}
          </>
        )}
      </div>

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

export default HistorialConsultas;
