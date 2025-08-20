import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { showCustomAlert } from "../../../utils/alertas";
import { FaCalendarAlt } from "react-icons/fa";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const Antecedentes = ({ clavenomina, clavepaciente }) => {
  const [descripcion, setDescripcion] = useState("");
  const [tipoAntecedente, setTipoAntecedente] = useState("");
  const [fechaInicioEnfermedad, setFechaInicioEnfermedad] = useState(null);
  const [antecedentes, setAntecedentes] = useState([]);
  const [isFechaInicioOpen, setIsFechaInicioOpen] = useState(false);

  // Necesario para portal (Next.js/SSR)
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Cargar antecedentes
  useEffect(() => {
    const fetchAntecedentes = async () => {
      if (!clavenomina || !clavepaciente) {
        setAntecedentes([]);
        return;
      }
      try {
        const queryParams = new URLSearchParams({ clavenomina, clavepaciente });
        const response = await fetch(
          `/api/antecedentes/obtenerAntecedentes?${queryParams.toString()}`
        );
        if (response.ok) {
          const data = await response.json();
          setAntecedentes(data);
        } else {
          const errorText = await response.text();
          await showCustomAlert(
            "error",
            "Error al obtener antecedentes",
            errorText,
            "Aceptar"
          );
          setAntecedentes([]);
        }
      } catch (error) {
        console.error("Error al cargar los antecedentes:", error);
      }
    };
    fetchAntecedentes();
  }, [clavenomina, clavepaciente]);

  // Guardar nuevo antecedente
  const handleGuardarAntecedente = async () => {
    if (!descripcion || !tipoAntecedente || !fechaInicioEnfermedad) {
      await showCustomAlert(
        "warning",
        "Campos incompletos",
        "Todos los campos son obligatorios. Asegúrate de completar la información.",
        "Aceptar"
      );
      return;
    }
    try {
      const response = await fetch("/api/antecedentes/guardarAntecedente", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          descripcion,
          clavenomina,
          clavepaciente,
          tipoAntecedente,
          fechaInicioEnfermedad,
        }),
      });

      if (response.ok) {
        const newAntecedente = await response.json();
        setAntecedentes([...antecedentes, newAntecedente]);
        setDescripcion("");
        setTipoAntecedente("");
        setFechaInicioEnfermedad(null);

        await showCustomAlert(
          "success",
          "Guardado con éxito",
          "El antecedente fue guardado correctamente.",
          "Aceptar"
        );
      } else {
        const errorText = await response.text();
        await showCustomAlert("error", "Error al guardar", errorText, "Aceptar");
      }
    } catch (error) {
      console.error("Error en la solicitud:", error);
    }
  };

  // Tabla/card reusable (diseño pastel + responsive)
  const renderTable = (title, filterType) => {
    const filtered = antecedentes.filter(
      (ant) =>
        ant.tipo_antecedente?.trim().toLowerCase() ===
        filterType.trim().toLowerCase()
    );

    return (
      <div className="rounded-2xl border border-gray-100 bg-white shadow-xl overflow-hidden">
        <div className="px-4 sm:px-5 md:px-6 py-3.5 sm:py-4 bg-gradient-to-r from-indigo-600 to-purple-600">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-base sm:text-lg md:text-xl font-bold text-white">
              {title}
            </h3>
            <span className="px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold bg-white/20 text-white">
              {filtered.length} registros
            </span>
          </div>
        </div>

        <div className="p-4 sm:p-5 md:p-6">
          {/* Tabla (md+) */}
          <div className="hidden md:block">
            <div className="overflow-x-auto rounded-xl ring-1 ring-indigo-100">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-900">
                    <th className="py-3 px-4 text-left font-semibold">Fecha de Registro</th>
                    <th className="py-3 px-4 text-left font-semibold">Fecha de Inicio</th>
                    <th className="py-3 px-4 text-left font-semibold">Descripción</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length > 0 ? (
                    filtered.map((ant, i) => (
                      <tr
                        key={ant.id_antecedente || i}
                        className={`${i % 2 === 0 ? "bg-white" : "bg-indigo-50/40"} hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-colors`}
                      >
                        <td className="py-3 px-4 text-gray-700 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-md text-xs bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200">
                            {new Date(ant.fecha_registro).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-700 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-md text-xs bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200">
                            {new Date(ant.fecha_inicio_enfermedad).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          <span className="line-clamp-2" title={ant.descripcion}>
                            {ant.descripcion}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="text-center py-8 text-gray-500 bg-gradient-to-r from-indigo-50 via-white to-indigo-50">
                        No se encontraron registros.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cards móviles */}
          <div className="md:hidden">
            {filtered.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filtered.map((ant, i) => (
                  <div
                    key={ant.id_antecedente || i}
                    className="rounded-2xl p-4 bg-gradient-to-br from-white to-indigo-50 border border-indigo-100 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-md text-[10px] bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200">
                        Reg.: {new Date(ant.fecha_registro).toLocaleDateString()}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200">
                        Inicio: {new Date(ant.fecha_inicio_enfermedad).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="mt-3 text-gray-700 text-sm">
                      <p className="font-semibold">Descripción</p>
                      <p className="mt-0.5 line-clamp-4" title={ant.descripcion}>
                        {ant.descripcion}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 bg-gradient-to-r from-indigo-50 via-white to-indigo-50 rounded-2xl border border-indigo-100">
                No se encontraron registros.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Modal de calendario (portal) para que NO se recorte
  const CalendarModal = () =>
    mounted
      ? createPortal(
          <div
            className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm p-4 sm:p-6 md:p-8 flex items-start sm:items-center justify-center"
            onClick={(e) => {
              // cerrar si clic en backdrop
              if (e.target === e.currentTarget) setIsFechaInicioOpen(false);
            }}
            role="dialog"
            aria-modal="true"
            aria-label="Seleccionar año de inicio"
          >
            <div className="calendar-modal-panel w-full max-w-md rounded-2xl border border-indigo-100 bg-white p-3 shadow-2xl">
              <div className="flex items-center justify-between px-1 pb-2">
                <h4 className="text-sm font-semibold text-gray-700">Selecciona el año</h4>
                <button
                  onClick={() => setIsFechaInicioOpen(false)}
                  className="inline-flex items-center justify-center h-8 w-8 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200"
                  aria-label="Cerrar"
                >
                  ✕
                </button>
              </div>
              <Calendar
                onChange={(date) => {
                  setFechaInicioEnfermedad(date);
                  setIsFechaInicioOpen(false);
                }}
                value={fechaInicioEnfermedad}
                view="decade"
                maxDetail="decade"
                minDetail="decade"
                next2Label={null}
                prev2Label={null}
                className="w-full"
              />
            </div>

            {/* Overrides visuales (aseguran legibilidad) */}
            <style jsx global>{`
              .calendar-modal-panel .react-calendar {
                background: transparent;
                border: none;
                font-family: inherit;
              }
              .calendar-modal-panel .react-calendar__navigation {
                display: flex;
                gap: 8px;
                margin-bottom: 10px;
              }
              .calendar-modal-panel .react-calendar__navigation button {
                background: linear-gradient(180deg, #eef2ff, #ede9fe);
                border: 1px solid #e0e7ff;
                border-radius: 10px;
                padding: 8px 10px;
                font-weight: 700;
                color: #1f2937;
              }
              .calendar-modal-panel .react-calendar__navigation button:hover {
                filter: brightness(1.03);
              }
              .calendar-modal-panel .react-calendar__tile {
                background: #ffffff;
                border: 1px solid #e5e7eb;
                border-radius: 12px;
                margin: 6px;
                padding: 14px 8px;
                text-align: center;
                color: #111827;
                font-weight: 600;
              }
              .calendar-modal-panel .react-calendar__tile:disabled {
                opacity: 0.4;
                background: #f9fafb;
                color: #9ca3af;
              }
              .calendar-modal-panel .react-calendar__tile--active {
                background: linear-gradient(180deg, #c7d2fe, #a5b4fc);
                border-color: #818cf8;
                color: #111827;
                box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
              }
              .calendar-modal-panel .react-calendar__tile--now {
                outline: 2px dashed #a78bfa;
                outline-offset: 2px;
              }
              .calendar-modal-panel .react-calendar__year-view .react-calendar__tile {
                width: calc(33.333% - 12px);
              }
            `}</style>
          </div>,
          document.body
        )
      : null;

  // Cerrar con ESC
  useEffect(() => {
    if (!isFechaInicioOpen) return;
    const onKey = (e) => e.key === "Escape" && setIsFechaInicioOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isFechaInicioOpen]);

  return (
    <div className="space-y-6">
      {/* Header principal */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-xl overflow-hidden">
        <div className="px-4 sm:px-5 md:px-6 py-3.5 sm:py-4 bg-gradient-to-r from-indigo-600 to-purple-600">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-base sm:text-lg md:text-xl font-bold text-white">Antecedentes</h1>
            <span className="px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold bg-white/20 text-white">
              {(antecedentes?.length || 0)} en total
            </span>
          </div>
        </div>

        <div className="p-4 sm:p-5 md:p-6">
          {/* Grid de tablas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {renderTable("Antecedentes Clínicos", "Clínico")}
            {renderTable("Antecedentes Quirúrgicos", "Quirúrgico")}
            {renderTable("Antecedentes Psiquiátricos", "Psiquiátrico")}
            {renderTable("Traumatismos", "Traumatismo")}
          </div>

          {/* Formulario añadir antecedente */}
          <div className="mt-6 rounded-2xl border border-indigo-100 bg-gradient-to-br from-white to-indigo-50/70 shadow p-4 sm:p-5 md:p-6">
            <h2 className="text-lg md:text-xl font-bold text-gray-800">Añadir Antecedente</h2>

            <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
              <label className="block">
                <span className="text-sm font-semibold text-gray-700">Tipo de Antecedente</span>
                <select
                  value={tipoAntecedente}
                  onChange={(e) => setTipoAntecedente(e.target.value)}
                  className="mt-2 w-full rounded-xl bg-white border border-gray-300 text-gray-800 p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Seleccionar tipo</option>
                  <option value="Clínico">Clínico</option>
                  <option value="Quirúrgico">Quirúrgico</option>
                  <option value="Psiquiátrico">Psiquiátrico</option>
                  <option value="Traumatismo">Traumatismo</option>
                </select>
              </label>

              <label className="block lg:col-span-2">
                <span className="text-sm font-semibold text-gray-700">Descripción</span>
                <textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className="mt-2 w-full min-h-[52px] rounded-xl bg-white border border-gray-300 text-gray-800 p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Describe el antecedente..."
                />
              </label>
            </div>

            {/* Año de inicio con botón que abre modal */}
            <div className="mt-4">
              <span className="text-sm font-semibold text-gray-700 block">Año de Inicio de Tratamiento</span>
              <div className="relative year-picker mt-2">
                <button
                  type="button"
                  onClick={() => setIsFechaInicioOpen(true)}
                  className="w-full flex items-center justify-between rounded-xl bg-white border border-gray-300 text-gray-800 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <span className="inline-flex items-center gap-3">
                    <FaCalendarAlt className="text-indigo-500" />
                    <span className="font-medium">
                      {fechaInicioEnfermedad ? fechaInicioEnfermedad.getFullYear() : "Selecciona un año"}
                    </span>
                  </span>
                  {fechaInicioEnfermedad && (
                    <span className="px-2 py-0.5 rounded-md text-xs bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200">
                      {fechaInicioEnfermedad.getFullYear()}
                    </span>
                  )}
                </button>
              </div>
            </div>

            <div className="mt-5 text-right">
              <button
                onClick={handleGuardarAntecedente}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 text-white font-semibold shadow hover:bg-indigo-500"
              >
                Guardar antecedente
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal calendario (PORTAL) */}
      {isFechaInicioOpen && <CalendarModal />}
    </div>
  );
};

export default Antecedentes;
