/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect, useContext } from "react";
import { FormularioContext } from "/src/context/FormularioContext";
import EspecialidadDropdown from "../components/EspecialidadDropdown";
import TablaHistorialEspecialidades from "../components/HistorialEspecialidades";

const PaseEspecialidad = ({
  claveConsulta,
  especialidadSeleccionada,
  setEspecialidadSeleccionada,
  observaciones,
  setObservaciones,
  clavepaciente,
  clavenomina,
}) => {
  const [especialidades, setEspecialidades] = useState([]);
  const [prioridad, setPrioridad] = useState("");
  const [historialEspecialidades, setHistorialEspecialidades] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pasarEspecialidad, setPasarEspecialidad] = useState("no");

  const { updateFormulario } = useContext(FormularioContext);

  //* Carga especialidades
  useEffect(() => {
    const fetchEspecialidades = async () => {
      try {
        const response = await fetch("/api/especialidades/especialidades");
        const data = await response.json();
        setEspecialidades(Array.isArray(data) ? data : []);
      } catch {
        setEspecialidades([]);
      }
    };
    fetchEspecialidades();
  }, []);

  //* Restaurar cache
  useEffect(() => {
    const cachedData = localStorage.getItem(`PaseEspecialidad:${claveConsulta}`);
    if (cachedData) {
      const parsed = JSON.parse(cachedData);
      if ("prioridad" in parsed) setPrioridad(parsed.prioridad);
      if ("pasarEspecialidad" in parsed) setPasarEspecialidad(parsed.pasarEspecialidad);
      if ("especialidadSeleccionada" in parsed) setEspecialidadSeleccionada(parsed.especialidadSeleccionada);
      if ("observaciones" in parsed) setObservaciones(parsed.observaciones);
    }
  }, [claveConsulta]);

  //* Historial
  useEffect(() => {
    const fetchHistorialEspecialidades = async () => {
      if (!clavepaciente || !clavenomina) return;
      try {
        const url = `/api/especialidades/historial?${new URLSearchParams({
          clavepaciente,
          clavenomina,
        })}`;
        const res = await fetch(url);
        const data = await res.json();
        if (res.ok && Array.isArray(data.historial)) {
          const map = data.historial.map((item) => ({
            especialidad: item.especialidad || "En Esta Consulta No Se Asignó A Ninguna Especialidad",
            prioridad: item.prioridad || "Prioridad No Existente",
            observaciones: item.observaciones || "Sin Observaciones",
            fecha_asignacion: item.fecha_asignacion || "Fecha No Disponible",
          }));
          setHistorialEspecialidades(map);
        } else {
          setHistorialEspecialidades([]);
        }
      } catch {
        setHistorialEspecialidades([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistorialEspecialidades();
  }, [clavepaciente, clavenomina]);

  //* Cachear cambios
  useEffect(() => {
    const cached = {
      pasarEspecialidad,
      prioridad,
      especialidadSeleccionada,
      observaciones,
    };
    localStorage.setItem(`PaseEspecialidad:${claveConsulta}`, JSON.stringify(cached));
  }, [pasarEspecialidad, prioridad, especialidadSeleccionada, observaciones, claveConsulta]);

  //* Guardar al desmontar
  useEffect(() => {
    return () => {
      const cached = {
        prioridad,
        pasarEspecialidad,
        especialidadSeleccionada,
        observaciones,
      };
      localStorage.setItem(`PaseEspecialidad:${claveConsulta}`, JSON.stringify(cached));
    };
  }, [prioridad, pasarEspecialidad, especialidadSeleccionada, observaciones, claveConsulta]);

  //* Compleción de formulario
  useEffect(() => {
    const ok = (pasarEspecialidad === "si" && prioridad && especialidadSeleccionada) || pasarEspecialidad === "no";
    updateFormulario("PaseEspecialidad", ok);
  }, [prioridad, pasarEspecialidad, especialidadSeleccionada, updateFormulario]);

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-xl overflow-hidden">
      {/* Header degradado */}
      <div className="px-3 sm:px-5 md:px-6 py-3.5 sm:py-4 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
          <h3 className="text-base sm:text-lg md:text-xl font-bold text-white">Pase a Especialidad</h3>
          <span className="px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold bg-white/20 text-white">
            {pasarEspecialidad === "si" ? "Con pase" : "Sin pase"}
          </span>
        </div>
      </div>

      <div className="p-3 sm:p-5 md:p-6">
        {/* Control Sí/No (mismo estilo que Medicamentos) */}
        <div className="mb-6">
          <p className="text-gray-800 font-semibold mb-2 text-sm sm:text-base">¿Debe pasar a alguna especialidad?</p>
          <div className="w-full">
            <div className="relative w-full bg-gradient-to-r from-indigo-100 to-purple-100 rounded-2xl p-1 ring-1 ring-indigo-200 shadow-inner">
              <div className="grid grid-cols-2 gap-1">
                <button
                  type="button"
                  onClick={() => setPasarEspecialidad("si")}
                  aria-pressed={pasarEspecialidad === "si"}
                  className={`group relative w-full px-4 sm:px-6 py-3 sm:py-4 rounded-xl text-sm sm:text-base md:text-lg font-semibold transition-all duration-200 outline-none
                    ${pasarEspecialidad === "si" ? "bg-white text-indigo-700 ring-1 ring-indigo-300 shadow" : "text-indigo-800/80 hover:text-indigo-900 hover:bg-white/50"}`}
                >
                  <span className="flex items-center justify-center gap-2 sm:gap-3">
                    <span className={`inline-flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full border text-xs sm:text-sm
                      ${pasarEspecialidad === "si" ? "bg-emerald-500 text-white border-emerald-500" : "bg-white/90 text-indigo-400 border-indigo-300"}`}>✓</span>
                    Sí
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => { setPasarEspecialidad("no"); updateFormulario("PaseEspecialidad", true); }}
                  aria-pressed={pasarEspecialidad === "no"}
                  className={`group relative w-full px-4 sm:px-6 py-3 sm:py-4 rounded-xl text-sm sm:text-base md:text-lg font-semibold transition-all duration-200 outline-none
                    ${pasarEspecialidad === "no" ? "bg-white text-rose-700 ring-1 ring-rose-300 shadow" : "text-rose-800/80 hover:text-rose-900 hover:bg-white/50"}`}
                >
                  <span className="flex items-center justify-center gap-2 sm:gap-3">
                    <span className={`inline-flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full border text-xs sm:text-sm
                      ${pasarEspecialidad === "no" ? "bg-rose-500 text-white border-rose-500" : "bg-white/90 text-rose-400 border-rose-300"}`}>✕</span>
                    No
                  </span>
                </button>
              </div>
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-500">Puedes cambiar esta opción en cualquier momento.</p>
        </div>

        {pasarEspecialidad === "si" && (
          <>
            {/* Selección de especialidad */}
            <div className="mb-6">
              <label className="text-sm font-semibold text-gray-700 mb-2 block">Especialidad</label>
              <div className="rounded-xl border border-gray-200 bg-white p-2.5 sm:p-3">
                <EspecialidadDropdown
                  especialidades={especialidades}
                  value={especialidadSeleccionada}
                  onChange={setEspecialidadSeleccionada}
                />
              </div>
            </div>

            {/* Observaciones */}
            <div className="mb-6">
              <label className="text-sm font-semibold text-gray-700 mb-2 block uppercase">Observaciones</label>
              <textarea
                value={observaciones}
                onChange={(e) => { if (e.target.value.length <= 120) setObservaciones(e.target.value.toUpperCase()); }}
                maxLength={120}
                className="block w-full rounded-xl bg-white border border-gray-300 text-gray-800 p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 uppercase text-sm sm:text-base"
                placeholder="ESCRIBE AQUÍ LAS OBSERVACIONES... (MÁX. 120 CARACTERES)"
                aria-label="ESCRIBE OBSERVACIONES"
              />
              <p className="text-xs text-gray-500 mt-1 uppercase">{observaciones.length}/120</p>
            </div>

            {/* TRIAGE — chip responsive (flujo en móviles, absoluto desde sm), sin desbordes y 100% responsive */}
            <div className="rounded-3xl border border-white/60 bg-gradient-to-br from-fuchsia-50 via-indigo-50 to-cyan-50 shadow-sm p-4 sm:p-6">
              <h2 className="text-center text-lg sm:text-2xl font-extrabold text-gray-900">
                Triage de Citas con Especialistas y Tiempos de Espera
              </h2>
              <p className="mt-1 text-center text-[11px] sm:text-xs text-gray-600">Selecciona un nivel</p>

              <div
                role="group"
                aria-label="Niveles de triage"
                className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-5"
              >
                {/* ========= ROJO ========= */}
                <button
                  type="button"
                  aria-pressed={prioridad === "ROJO"}
                  onClick={() => {
                    setPrioridad("ROJO");
                    const c = JSON.parse(localStorage.getItem(`PaseEspecialidad:${claveConsulta}`) || "{}");
                    c.prioridad = "ROJO"; localStorage.setItem(`PaseEspecialidad:${claveConsulta}`, JSON.stringify(c));
                  }}
                  className={`relative rounded-2xl border text-left focus:outline-none min-h-[200px] sm:min-h-[230px] overflow-hidden
                    ${prioridad === "ROJO"
                      ? "bg-gradient-to-br from-rose-50 to-rose-100 border-rose-300 ring-4 ring-rose-300/60 ring-offset-2 ring-offset-white shadow-md"
                      : "bg-gradient-to-br from-rose-50 to-white border-rose-200/70 hover:border-rose-300"}`}
                >
                  {/* spine */}
                  <span className={`${prioridad === "ROJO" ? "w-5 bg-rose-500" : "w-4 bg-rose-400/90"} absolute left-0 top-0 h-full rounded-l-2xl`} />

                  {/* Chip: en móviles en flujo; desde sm, fijo arriba */}
                  <span className="sm:absolute sm:top-3 sm:right-3 inline-block px-3 py-1 rounded-full text-[11px] sm:text-[12px] font-semibold bg-white/95 text-rose-800 ring-1 ring-rose-200 backdrop-blur-sm max-w-full sm:max-w-[70%] text-center">
                    1–7 días
                  </span>

                  <div className="p-4 sm:p-5 pl-6 sm:pl-7 sm:pt-12">
                    <div className="flex items-start gap-3">
                      <div className="relative grid h-12 w-12 sm:h-14 sm:w-14 place-items-center rounded-xl bg-rose-100 text-rose-800 font-black text-xl sm:text-2xl">
                        1
                        {prioridad === "ROJO" && (
                          <span className="absolute -top-1 -right-1 h-5 w-5 grid place-items-center rounded-full bg-rose-500 text-white text-[10px] ring-2 ring-white">✓</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] sm:text-[12px] font-semibold text-rose-700/90">Emergencia · Inmediato</div>
                        <h3 className="text-base sm:text-lg font-extrabold text-rose-900">Rojo</h3>
                      </div>
                    </div>

                    <div className="mt-3 sm:mt-4 h-2 w-full rounded-full bg-rose-100">
                      <div className="h-full w-1/3 bg-rose-500 rounded-full" />
                    </div>

                    <p className="mt-3 sm:mt-4 text-[13px] sm:text-sm text-rose-900/90">
                      Puede empeorar rápido; la demora puede tener consecuencias graves o comprometer un órgano.
                    </p>
                    <p className="mt-1 text-[11px] sm:text-xs text-rose-900/80">
                      <span className="font-semibold">Ejemplos:</span> sospecha de cáncer, coágulo en pierna (angiología), dolor de pecho persistente (cardiología).
                    </p>
                  </div>
                </button>

                {/* ========= NARANJA ========= */}
                <button
                  type="button"
                  aria-pressed={prioridad === "NARANJA"}
                  onClick={() => {
                    setPrioridad("NARANJA");
                    const c = JSON.parse(localStorage.getItem(`PaseEspecialidad:${claveConsulta}`) || "{}");
                    c.prioridad = "NARANJA"; localStorage.setItem(`PaseEspecialidad:${claveConsulta}`, JSON.stringify(c));
                  }}
                  className={`relative rounded-2xl border text-left focus:outline-none min-h-[200px] sm:min-h-[230px] overflow-hidden
                    ${prioridad === "NARANJA"
                      ? "bg-gradient-to-br from-orange-50 to-amber-100 border-orange-300 ring-4 ring-orange-300/60 ring-offset-2 ring-offset-white shadow-md"
                      : "bg-gradient-to-br from-orange-50 to-white border-orange-200/70 hover:border-orange-300"}`}
                >
                  <span className={`${prioridad === "NARANJA" ? "w-5 bg-orange-500" : "w-4 bg-orange-400/90"} absolute left-0 top-0 h-full rounded-l-2xl`} />
                  <span className="sm:absolute sm:top-3 sm:right-3 inline-block px-3 py-1 rounded-full text-[11px] sm:text-[12px] font-semibold bg-white/95 text-orange-800 ring-1 ring-orange-200 backdrop-blur-sm max-w-full sm:max-w-[70%] text-center">
                    1–4 semanas
                  </span>

                  <div className="p-4 sm:p-5 pl-6 sm:pl-7 sm:pt-12">
                    <div className="flex items-start gap-3">
                      <div className="relative grid h-12 w-12 sm:h-14 sm:w-14 place-items-center rounded-xl bg-orange-100 text-orange-800 font-black text-xl sm:text-2xl">
                        2
                        {prioridad === "NARANJA" && (
                          <span className="absolute -top-1 -right-1 h-5 w-5 grid place-items-center rounded-full bg-orange-500 text-white text-[10px] ring-2 ring-white">✓</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] sm:text-[12px] font-semibold text-orange-700/90">Urgente</div>
                        <h3 className="text-base sm:text-lg font-extrabold text-orange-900">Naranja</h3>
                      </div>
                    </div>

                    <div className="mt-3 sm:mt-4 h-2 w-full rounded-full bg-orange-100">
                      <div className="h-full w-1/2 bg-orange-500 rounded-full" />
                    </div>

                    <p className="mt-3 sm:mt-4 text-[13px] sm:text-sm text-orange-900/90">
                      Condición seria con dolor o incapacidad; requiere atención para evitar deterioro.
                    </p>
                    <p className="mt-1 text-[11px] sm:text-xs text-orange-900/80">
                      <span className="font-semibold">Ejemplos:</span> dolor de espalda crónico incapacitante, fractura no urgente (traumatología).
                    </p>
                  </div>
                </button>

                {/* ========= AMARILLO ========= */}
                <button
                  type="button"
                  aria-pressed={prioridad === "AMARILLO"}
                  onClick={() => {
                    setPrioridad("AMARILLO");
                    const c = JSON.parse(localStorage.getItem(`PaseEspecialidad:${claveConsulta}`) || "{}");
                    c.prioridad = "AMARILLO"; localStorage.setItem(`PaseEspecialidad:${claveConsulta}`, JSON.stringify(c));
                  }}
                  className={`relative rounded-2xl border text-left focus:outline-none min-h-[200px] sm:min-h-[230px] overflow-hidden
                    ${prioridad === "AMARILLO"
                      ? "bg-gradient-to-br from-yellow-50 to-amber-100 border-yellow-300 ring-4 ring-yellow-300/60 ring-offset-2 ring-offset-white shadow-md"
                      : "bg-gradient-to-br from-yellow-50 to-white border-yellow-200/70 hover:border-yellow-300"}`}
                >
                  <span className={`${prioridad === "AMARILLO" ? "w-5 bg-yellow-500" : "w-4 bg-yellow-400/90"} absolute left-0 top-0 h-full rounded-l-2xl`} />
                  <span className="sm:absolute sm:top-3 sm:right-3 inline-block px-3 py-1 rounded-full text-[11px] sm:text-[12px] font-semibold bg-white/95 text-yellow-800 ring-1 ring-yellow-200 backdrop-blur-sm max-w-full sm:max-w-[70%] text-center">
                    1–3 meses
                  </span>

                  <div className="p-4 sm:p-5 pl-6 sm:pl-7 sm:pt-12">
                    <div className="flex items-start gap-3">
                      <div className="relative grid h-12 w-12 sm:h-14 sm:w-14 place-items-center rounded-xl bg-yellow-100 text-yellow-800 font-black text-xl sm:text-2xl">
                        3
                        {prioridad === "AMARILLO" && (
                          <span className="absolute -top-1 -right-1 h-5 w-5 grid place-items-center rounded-full bg-yellow-500 text-white text-[10px] ring-2 ring-white">✓</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] sm:text-[12px] font-semibold text-yellow-700/90">Prioritario</div>
                        <h3 className="text-base sm:text-lg font-extrabold text-yellow-900">Amarillo</h3>
                      </div>
                    </div>

                    <div className="mt-3 sm:mt-4 h-2 w-full rounded-full bg-yellow-100">
                      <div className="h-full w-3/4 bg-yellow-500 rounded-full" />
                    </div>

                    <p className="mt-3 sm:mt-4 text-[13px] sm:text-sm text-yellow-900/90">
                      No urgente, pero requiere tratamiento para mejorar calidad de vida y evitar complicaciones.
                    </p>
                    <p className="mt-1 text-[11px] sm:text-xs text-yellow-900/80">
                      <span className="font-semibold">Ejemplos:</span> esguince leve con fisioterapia, seguimiento por condición crónica.
                    </p>
                  </div>
                </button>

                {/* ========= VERDE ========= */}
                <button
                  type="button"
                  aria-pressed={prioridad === "VERDE"}
                  onClick={() => {
                    setPrioridad("VERDE");
                    const c = JSON.parse(localStorage.getItem(`PaseEspecialidad:${claveConsulta}`) || "{}");
                    c.prioridad = "VERDE"; localStorage.setItem(`PaseEspecialidad:${claveConsulta}`, JSON.stringify(c));
                  }}
                  className={`relative rounded-2xl border text-left focus:outline-none min-h-[200px] sm:min-h-[230px] overflow-hidden
                    ${prioridad === "VERDE"
                      ? "bg-gradient-to-br from-emerald-50 to-green-100 border-emerald-300 ring-4 ring-emerald-300/60 ring-offset-2 ring-offset-white shadow-md"
                      : "bg-gradient-to-br from-emerald-50 to-white border-emerald-200/70 hover:border-emerald-300"}`}
                >
                  <span className={`${prioridad === "VERDE" ? "w-5 bg-emerald-500" : "w-4 bg-emerald-400/90"} absolute left-0 top-0 h-full rounded-l-2xl`} />
                  <span className="sm:absolute sm:top-3 sm:right-3 inline-block px-3 py-1 rounded-full text-[11px] sm:text-[12px] font-semibold bg-white/95 text-emerald-800 ring-1 ring-emerald-200 backdrop-blur-sm max-w-full sm:max-w-[70%] text-center">
                    3–6 meses
                  </span>

                  <div className="p-4 sm:p-5 pl-6 sm:pl-7 sm:pt-12">
                    <div className="flex items-start gap-3">
                      <div className="relative grid h-12 w-12 sm:h-14 sm:w-14 place-items-center rounded-xl bg-emerald-100 text-emerald-800 font-black text-xl sm:text-2xl">
                        4
                        {prioridad === "VERDE" && (
                          <span className="absolute -top-1 -right-1 h-5 w-5 grid place-items-center rounded-full bg-emerald-500 text-white text-[10px] ring-2 ring-white">✓</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] sm:text-[12px] font-semibold text-emerald-700/90">Rutina</div>
                        <h3 className="text-base sm:text-lg font-extrabold text-emerald-900">Verde</h3>
                      </div>
                    </div>

                    <div className="mt-3 sm:mt-4 h-2 w-full rounded-full bg-emerald-100">
                      <div className="h-full w-11/12 bg-emerald-500 rounded-full" />
                    </div>

                    <p className="mt-3 sm:mt-4 text-[13px] sm:text-sm text-emerald-900/90">
                      Evaluaciones de rutina o condiciones con bajo impacto en la vida diaria.
                    </p>
                    <p className="mt-1 text-[11px] sm:text-xs text-emerald-900/80">
                      <span className="font-semibold">Ejemplos:</span> control de diabetes, reumatología estable, graduación de lentes.
                    </p>
                  </div>
                </button>

                {/* ========= AZUL ========= */}
                <button
                  type="button"
                  aria-pressed={prioridad === "AZUL"}
                  onClick={() => {
                    setPrioridad("AZUL");
                    const c = JSON.parse(localStorage.getItem(`PaseEspecialidad:${claveConsulta}`) || "{}");
                    c.prioridad = "AZUL"; localStorage.setItem(`PaseEspecialidad:${claveConsulta}`, JSON.stringify(c));
                  }}
                  className={`relative rounded-2xl border text-left focus:outline-none min-h-[200px] sm:min-h-[230px] overflow-hidden
                    ${prioridad === "AZUL"
                      ? "bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-300 ring-4 ring-blue-300/60 ring-offset-2 ring-offset-white shadow-md"
                      : "bg-gradient-to-br from-blue-50 to-white border-blue-200/70 hover:border-blue-300"}`}
                >
                  <span className={`${prioridad === "AZUL" ? "w-5 bg-blue-500" : "w-4 bg-blue-400/90"} absolute left-0 top-0 h-full rounded-l-2xl`} />
                  <span className="sm:absolute sm:top-3 sm:right-3 inline-block px-3 py-1 rounded-full text-[11px] sm:text-[12px] font-semibold bg-white/95 text-blue-800 ring-1 ring-blue-200 backdrop-blur-sm max-w-full sm:max-w-[70%] text-center">
                    &gt; 6 meses
                  </span>

                  <div className="p-4 sm:p-5 pl-6 sm:pl-7 sm:pt-12">
                    <div className="flex items-start gap-3">
                      <div className="relative grid h-12 w-12 sm:h-14 sm:w-14 place-items-center rounded-xl bg-blue-100 text-blue-800 font-black text-xl sm:text-2xl">
                        5
                        {prioridad === "AZUL" && (
                          <span className="absolute -top-1 -right-1 h-5 w-5 grid place-items-center rounded-full bg-blue-500 text-white text-[10px] ring-2 ring-white">✓</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] sm:text-[12px] font-semibold text-blue-700/90">No urgente</div>
                        <h3 className="text-base sm:text-lg font-extrabold text-blue-900">Azul</h3>
                      </div>
                    </div>

                    <div className="mt-3 sm:mt-4 h-2 w-full rounded-full bg-blue-100">
                      <div className="h-full w-full bg-blue-500 rounded-full" />
                    </div>

                    <p className="mt-3 sm:mt-4 text-[13px] sm:text-sm text-blue-900/90">
                      Seguimiento de crónicos bien controlados o evaluaciones no esenciales inmediatas.
                    </p>
                    <p className="mt-1 text-[11px] sm:text-xs text-blue-900/80">
                      <span className="font-semibold">Ejemplos:</span> chequeo anual con internista, segunda opinión no urgente.
                    </p>
                  </div>
                </button>
              </div>
            </div>

            <br />
          </>
        )}

        {/* Historial */}
        <div className="mt-6">
          <TablaHistorialEspecialidades historial={historialEspecialidades} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
};

export default PaseEspecialidad;
