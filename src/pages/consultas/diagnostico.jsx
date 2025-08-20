/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import Image from "next/image";
import DatosAdicionales from "./datos-adicionales/datos-adicionales";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import React, { useState, useEffect, useRef, useContext } from "react";
import { FormularioContext } from "/src/context/FormularioContext";
import AccionesConsulta from "./AccionesConsulta";
import { showCustomAlert } from "../../utils/alertas";
import { PageHeader } from "../../utils/PageHeader";
import { motion } from "framer-motion";
import {
  FaIdCard,
  FaBuilding,
  FaUserFriends,
  FaClipboardList,
  FaUser,
  FaCalendarAlt,
} from "react-icons/fa";
import { FiThermometer, FiActivity, FiDroplet, FiTrendingUp } from "react-icons/fi";
import { TfiRuler } from "react-icons/tfi";

const formatearFecha = (fecha) => {
  if (!fecha) return "N/A";
  const opciones = { year: "numeric", month: "long", day: "numeric" };
  const fechaLocal = new Date(fecha);
  return fechaLocal.toLocaleString("es-MX", opciones);
};

const Diagnostico = () => {
  const router = useRouter();
  const handleRegresar = () => router.replace("/inicio-servicio-medico");

  const { formCompleto } = useContext(FormularioContext);
  const subPantallaRef = useRef(null);
  const [nombreMedico, setNombreMedico] = useState("Cargando...");
  const [claveEspecialidad, setClaveEspecialidad] = useState("");
  const [claveusuario, setClaveusuario] = useState("");
  const [costo, setCosto] = useState("");
  const [claveConsulta, setClaveConsulta] = useState("");
  const [fecha, setFecha] = useState("");
  const [diagnostico, setDiagnostico] = useState("");
  const [motivoConsulta, setMotivoConsulta] = useState("");
  const [signosVitales, setSignosVitales] = useState({
    ta: "",
    temperatura: "",
    fc: "",
    oxigenacion: "",
    altura: "",
    peso: "",
    glucosa: "",
  });
  const [alergias, setAlergias] = useState("");
  const [fotoEmpleado, setFotoEmpleado] = useState(null);
  const [subPantalla, setSubPantalla] = useState("Diagnóstico");
  const [pacientes, setPacientes] = useState([]);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
  const [mostrarEmergente, setMostrarEmergente] = useState(false);
  const [empleadoData, setEmpleadoData] = useState(null);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState(null);
  const [consultaSeleccionada, setConsultaSeleccionada] = useState("empleado");
  const [pasarEspecialidad, setPasarEspecialidad] = useState("");
  const [formularioCompleto, setFormularioCompleto] = useState(false);

  const [especialidadSeleccionada, setEspecialidadSeleccionada] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [datosEditados, setDatosEditados] = useState({
    signosVitales: {},
    alergias: "",
  });

  useEffect(() => {
    const nombre = Cookies.get("nombreusuario");
    setNombreMedico(nombre || "No especificado");
    const especialidad = Cookies.get("claveespecialidad");
    setClaveEspecialidad(especialidad || "No especificado");
    const costo = Cookies.get("costo");
    setCosto(costo || "No especificado");
    const claveusuario = Cookies.get("claveusuario");
    setClaveusuario(claveusuario || "No especificado");
  }, []);

  useEffect(() => {
    const today = new Date();
    const formattedDate = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
    setFecha(formattedDate);
    cargarPacientesDelDia();
  }, []);

  const cargarPacientesDelDia = async () => {
    try {
      const response = await fetch("/api/pacientes-consultas/consultasHoy?clavestatus=1");
      const data = await response.json();
      if (response.ok) {
        const pacientesOrdenados = data.consultas.sort(
          (a, b) => new Date(a.fechaconsulta) - new Date(b.fechaconsulta)
        );
        setPacientes(pacientesOrdenados);
      } else {
        await showCustomAlert("error", "Error al cargar pacientes", "No se pudo cargar la información. Inténtalo nuevamente.", "Aceptar");
      }
    } catch (error) {
      await showCustomAlert("error", "Error al cargar pacientes", "No se pudo cargar la información. Inténtalo nuevamente.", "Aceptar");
    }
  };

  const obtenerDatosEmpleado = async (num_nom) => {
    try {
      const response = await fetch("/api/empleado", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ num_nom }),
      });
      if (response.ok) {
        const data = await response.json();
        setEmpleadoData({
          nombreCompleto: `${data.nombre} ${data.a_paterno} ${data.a_materno}`,
          departamento: data.departamento,
          puesto: data.puesto,
        });
      } else {
        await showCustomAlert("error", "Error al obtener datos", "Hubo un problema al obtener los datos del empleado. Inténtalo más tarde.", "Aceptar");
      }
    } catch (error) {
      await showCustomAlert("error", "Error al obtener datos", "Hubo un problema al obtener los datos del empleado. Inténtalo más tarde.", "Aceptar");
    }
  };

  const handlePacienteClick = async (paciente) => {
    setPacienteSeleccionado(paciente);
    setMostrarEmergente(true);
    setClaveConsulta(paciente.claveconsulta);

    setSignosVitales({
      ta: paciente.presionarterialpaciente || "",
      temperatura: paciente.temperaturapaciente || "",
      fc: paciente.pulsosxminutopaciente || "",
      oxigenacion: paciente.respiracionpaciente || "",
      altura: paciente.estaturapaciente || "",
      peso: paciente.pesopaciente || "",
      glucosa: paciente.glucosapaciente || "",
    });

    setAlergias(paciente.alergias || "");
    setDatosEditados({
      signosVitales: {
        ta: paciente.presionarterialpaciente || "",
        temperatura: paciente.temperaturapaciente || "",
        fc: paciente.pulsosxminutopaciente || "",
        oxigenacion: paciente.respiracionpaciente || "",
        altura: paciente.estaturapaciente || "",
        peso: paciente.pesopaciente || "",
        glucosa: paciente.glucosapaciente || "",
      },
      alergias: paciente.alergias || "",
    });

    if (paciente.parentesco_desc) {
      setConsultaSeleccionada("beneficiario");
      setSelectedBeneficiary({ ...paciente, PARENTESCO_DESC: paciente.parentesco_desc });
    } else {
      setConsultaSeleccionada("empleado");
      setSelectedBeneficiary(null);
    }

    await obtenerDatosEmpleado(paciente.clavenomina);
  };

  const limpiarFormulario = () => {
    setDiagnostico("");
    setMotivoConsulta("");
    setSignosVitales({ ta: "", temperatura: "", fc: "", oxigenacion: "", altura: "", peso: "", glucosa: "" });
    setAlergias("");
    setObservaciones("");
    setEspecialidadSeleccionada("");
    setPasarEspecialidad(null);
    setEmpleadoData(null);
    setDatosEditados({ signosVitales: {}, alergias: "" });
    setPacienteSeleccionado(null);
    setMostrarEmergente(false);
  };

  useEffect(() => {
    const camposRequeridosLlenos =
      claveConsulta && diagnostico && motivoConsulta && signosVitales.ta && signosVitales.temperatura;

    const paseEspecialidadCompleto =
      pasarEspecialidad === "no" ||
      (pasarEspecialidad === "si" && especialidadSeleccionada && observaciones);

    setFormularioCompleto(camposRequeridosLlenos && paseEspecialidadCompleto);
  }, [claveConsulta, diagnostico, motivoConsulta, signosVitales, pasarEspecialidad, especialidadSeleccionada, observaciones]);

  // --------------------------
  // Meta para "Signos vitales"
  // --------------------------
  const vitalMeta = {
    ta: { label: "TA", icon: <FiActivity /> },
    temperatura: { label: "Temperatura", icon: <FiThermometer /> },
    fc: { label: "Frecuencia cardiaca", icon: <FiActivity /> },
    oxigenacion: { label: "Oxigenación", icon: <FiDroplet /> },
    altura: { label: "Altura", icon: <TfiRuler /> },
    peso: { label: "Peso", icon: <FiTrendingUp /> },
    glucosa: { label: "Glucosa", icon: <FiDroplet /> },
  };

  // Tema por signo
  const vitalTheme = {
    ta: { bg: "from-sky-50 to-indigo-50", border: "border-sky-200", iconBg: "bg-sky-100", iconText: "text-sky-600" },
    temperatura: { bg: "from-rose-50 to-orange-50", border: "border-rose-200", iconBg: "bg-rose-100", iconText: "text-rose-600" },
    fc: { bg: "from-red-50 to-rose-50", border: "border-red-200", iconBg: "bg-red-100", iconText: "text-red-600" },
    oxigenacion: { bg: "from-cyan-50 to-teal-50", border: "border-cyan-200", iconBg: "bg-cyan-100", iconText: "text-cyan-600" },
    altura: { bg: "from-violet-50 to-fuchsia-50", border: "border-violet-200", iconBg: "bg-violet-100", iconText: "text-violet-600" },
    peso: { bg: "from-emerald-50 to-green-50", border: "border-emerald-200", iconBg: "bg-emerald-100", iconText: "text-emerald-600" },
    glucosa: { bg: "from-amber-50 to-yellow-50", border: "border-amber-200", iconBg: "bg-amber-100", iconText: "text-amber-600" },
  };

  return (
    <div className="min-h-[100svh] bg-gradient-to-br from-indigo-50 via-purple-50 to-indigo-100 overflow-x-hidden pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      {/* Ancho fluido y paddings adaptativos */}
      <div className="mx-auto w-full max-w-screen-2xl px-3 sm:px-4 lg:px-6 py-6 md:py-10">
        <PageHeader
          title="Consulta General"
          subtitle="Innovación Médica Inteligente"
          imageSrc="/login_servicio_medico.png"
          doctorName={nombreMedico}
          onBack={handleRegresar}
          statusLabel="Activo"
        />

        {/* Tiles responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2 sm:gap-4 md:gap-6 mt-6">
          {[
            { icon: <FaClipboardList className="text-2xl" />, label: "En espera", value: pacientes.length, color: "from-indigo-500 to-indigo-600" },
            { icon: <FaCalendarAlt className="text-2xl" />, label: "Fecha", value: formatearFecha(fecha), color: "from-cyan-500 to-cyan-600" },
          ].map(({ icon, label, value, color }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`relative overflow-hidden rounded-2xl p-4 sm:p-5 text-white shadow-xl bg-gradient-to-br ${color}`}
            >
              <div className="absolute -right-6 -bottom-6 w-24 sm:w-28 h-24 sm:h-28 bg-white/10 rounded-full" />
              <div className="absolute -right-12 -bottom-10 w-28 sm:w-36 h-28 sm:h-36 bg-white/5 rounded-full" />
              <div className="relative z-10 min-w-0">
                <div className="mb-1.5 sm:mb-2">{icon}</div>
                <div className="text-xl sm:text-2xl font-bold leading-tight truncate">{value}</div>
                <div className="text-white/90 text-sm sm:text-base">{label}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tabla desktop + cards móviles */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
        >
          <div className="px-4 sm:px-5 md:px-6 py-3.5 sm:py-4 bg-gradient-to-r from-indigo-600 to-purple-600">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base sm:text-lg md:text-xl font-bold text-white flex items-center gap-2 min-w-0">
                <FaUserFriends />
                <span className="truncate">Pacientes en espera</span>
              </h2>
              <span className="px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold bg-white/20 text-white whitespace-nowrap">
                {pacientes.length} registros
              </span>
            </div>
          </div>

          {/* Tabla (md y arriba) */}
          <div className="hidden md:block p-4 md:p-6 rounded-2xl">
            <div className="overflow-x-auto rounded-xl ring-1 ring-indigo-100">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-indigo-50 text-indigo-900 text-sm">
                    <th className="py-3 px-4 text-left font-semibold whitespace-nowrap">NÓMINA</th>
                    <th className="py-3 px-4 text-left font-semibold">PACIENTE</th>
                    <th className="py-3 px-4 text-left font-semibold">EDAD</th>
                    <th className="py-3 px-4 text-left font-semibold">SECRETARÍA</th>
                    <th className="py-3 px-4 text-left font-semibold">TIPO</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {pacientes.length > 0 ? (
                    pacientes.map((paciente, index) => (
                      <motion.tr
                        key={paciente.claveconsulta}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2, delay: index * 0.02 }}
                        className={`${index % 2 === 0 ? "bg-white" : "bg-indigo-50/40"} hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-colors duration-200 cursor-pointer`}
                        onClick={() => handlePacienteClick(paciente)}
                      >
                        <td className="py-3 px-4 text-gray-700 whitespace-nowrap">{paciente.clavenomina || "N/A"}</td>
                        <td className="py-3 px-4 text-gray-700 max-w-[20rem]">
                          <span className="block truncate" title={paciente.nombrepaciente || "No disponible"}>
                            {paciente.nombrepaciente || "No disponible"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-700 whitespace-nowrap">{paciente.edad || "Desconocida"}</td>
                        <td className="py-3 px-4 text-gray-700">
                          <span className="block truncate max-w-[18rem]" title={paciente.departamento || "No asignado"}>
                            {paciente.departamento || "No asignado"}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${paciente.parentesco_desc ? "bg-pink-100 text-pink-700" : "bg-emerald-100 text-emerald-700"}`}>
                            {paciente.parentesco_desc ? "Beneficiario" : "Empleado(a)"}
                          </span>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-gray-500 bg-gradient-to-r from-indigo-50 via-white to-indigo-50">
                        No hay consultas para el día de hoy.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cards móviles (< md) */}
          <div className="md:hidden p-3 sm:p-4">
            {pacientes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {pacientes.map((p, i) => (
                  <motion.button
                    key={p.claveconsulta}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                    onClick={() => handlePacienteClick(p)}
                    className="text-left rounded-2xl p-4 bg-gradient-to-br from-white to-indigo-50 border border-indigo-100 shadow-sm hover:shadow-md transition"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-xs text-indigo-600 font-semibold">Nómina</div>
                        <div className="text-sm font-bold text-gray-800 truncate">{p.clavenomina || "N/A"}</div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap ${p.parentesco_desc ? "bg-pink-100 text-pink-700" : "bg-emerald-100 text-emerald-700"}`}>
                        {p.parentesco_desc ? "Beneficiario" : "Empleado"}
                      </span>
                    </div>
                    <div className="mt-2 text-gray-700 font-medium truncate" title={p.nombrepaciente || "No disponible"}>
                      {p.nombrepaciente || "No disponible"}
                    </div>
                    <div className="mt-1 text-xs text-gray-500 flex flex-wrap gap-x-4 gap-y-1">
                      <span><b>Edad:</b> {p.edad || "—"}</span>
                      <span className="min-w-0">
                        <b>Secretaría:</b>{" "}
                        <span className="truncate inline-block max-w-[12rem] align-bottom" title={p.departamento || "No asignado"}>
                          {p.departamento || "No asignado"}
                        </span>
                      </span>
                    </div>
                  </motion.button>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">No hay consultas para el día de hoy.</div>
            )}
          </div>
        </motion.div>

        {/* Panel de captura: overflow visible para tooltips */}
        {pacienteSeleccionado && (
          <motion.div
            ref={subPantallaRef}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-10"
          >
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-visible">
              <div className="px-4 sm:px-5 md:px-6 py-3.5 sm:py-4 bg-cyan-600 rounded-2x2">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-base sm:text-lg md:text-xl font-bold text-white flex items-center gap-2 min-w-0">
                    <FaClipboardList />
                    <span className="truncate">Captura de consulta</span>
                  </h2>
                </div>
              </div>

              <div className="p-4 sm:p-5 md:p-6">
                {/* Chips */}
                <div className="flex flex-wrap gap-2.5 sm:gap-3 mb-6">
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs sm:text-sm bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200">
                    <FaIdCard />
                    <b>Folio:</b>
                    <span className="truncate max-w-[12rem] sm:max-w-none">{claveConsulta || "—"}</span>
                  </span>
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs sm:text-sm bg-purple-50 text-purple-700 ring-1 ring-purple-200">
                    <FaCalendarAlt />
                    <b>Fecha:</b>
                    <span className="truncate">{formatearFecha(fecha)}</span>
                  </span>
                </div>

                {/* Datos Paciente / Empleado */}
                <div className="grid grid-cols-1 xl:grid-cols-[240px,1fr,1fr] gap-4 sm:gap-6 mb-8">
                  <div className="flex items-start justify-center xl:justify-start">
                    <Image
                      src={fotoEmpleado || "/user_icon_.png"}
                      alt="Empleado"
                      width={200}
                      height={200}
                      sizes="(max-width: 640px) 7rem, (max-width: 1280px) 8rem, 180px"
                      className="h-28 w-28 sm:h-32 sm:w-32 xl:h-[180px] xl:w-[180px] object-cover rounded-2xl ring-4 ring-indigo-100 shadow-lg bg-gray-100"
                    />
                  </div>

                  <div className="bg-gradient-to-br from-white to-indigo-50 rounded-2xl p-4 shadow-lg border border-indigo-100">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <FaUser className="text-indigo-500" /> Datos del Paciente
                    </h3>
                    <div className="space-y-1.5 text-gray-700">
                      <p className="min-w-0"><b>Paciente:</b>{" "}
                        <span className="truncate inline-block max-w-full align-bottom">{pacienteSeleccionado?.nombrepaciente || "No disponible"}</span>
                      </p>
                      <p><b>Edad:</b> {pacienteSeleccionado?.edad || "—"}</p>
                      <p className="min-w-0">
                        <b>Parentesco:</b>{" "}
                        {consultaSeleccionada === "beneficiario" && selectedBeneficiary
                          ? <span className="truncate inline-block max-w-full align-bottom">{selectedBeneficiary.PARENTESCO_DESC}</span>
                          : "Empleado(a)"}
                      </p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-white to-emerald-50 rounded-2xl p-4 shadow-lg border border-emerald-100">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <FaBuilding className="text-emerald-500" /> Datos del Empleado
                    </h3>
                    <div className="space-y-1.5 text-gray-700">
                      <p><b>Nómina:</b> {pacienteSeleccionado?.clavenomina || "No disponible"}</p>
                      <p className="min-w-0"><b>Trabajador:</b>{" "}
                        <span className="truncate inline-block max-w-full align-bottom" title={empleadoData?.nombreCompleto || "No disponible"}>
                          {empleadoData?.nombreCompleto || "No disponible"}
                        </span>
                      </p>
                      <p className="min-w-0"><b>Departamento:</b>{" "}
                        <span className="truncate inline-block max-w-full align-bottom" title={empleadoData?.departamento || "No asignado"}>
                          {empleadoData?.departamento || "No asignado"}
                        </span>
                      </p>
                      <p className="min-w-0"><b>Puesto:</b>{" "}
                        <span className="truncate inline-block max-w-full align-bottom" title={empleadoData?.puesto || "No asignado"}>
                          {empleadoData?.puesto || "No asignado"}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Signos Vitales */}
                <div className="mb-8">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <h3 className="text-lg md:text-xl font-bold text-gray-800">Signos vitales</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:[grid-template-columns:repeat(4,minmax(0,1fr))] 2xl:[grid-template-columns:repeat(6,minmax(0,1fr))] gap-3 sm:gap-4">
                    {Object.entries(signosVitales).map(([key, value]) => {
                      const meta = vitalMeta[key] || { label: key.toUpperCase(), icon: null };
                      const theme = vitalTheme[key] || {
                        bg: "from-gray-50 to-gray-100",
                        border: "border-gray-200",
                        iconBg: "bg-gray-100",
                        iconText: "text-gray-600",
                      };
                      return (
                        <div
                          key={key}
                          className={`relative rounded-2xl border ${theme.border} bg-gradient-to-br ${theme.bg} shadow-sm p-4 sm:p-5`}
                        >
                          {/* Decoración sutil */}
                          <div className="pointer-events-none absolute inset-0">
                            <div className="absolute -top-8 -right-8 w-24 h-24 bg-white/50 rounded-full blur-2xl" />
                            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent" />
                          </div>

                          <div className="relative flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <div className="text-[11px] sm:text-xs font-bold uppercase tracking-wide text-gray-600">
                                {meta.label}
                              </div>
                              <div className="mt-1 text-2xl sm:text-3xl font-semibold text-gray-900 leading-none truncate">
                                {value || "—"}
                              </div>
                            </div>

                            <div className={`shrink-0 ${theme.iconText}`}>
                              <div className={`w-12 h-12 sm:w-14 sm:h-14 grid place-items-center rounded-xl ${theme.iconBg} ring-1 ring-white/50 shadow`}>
                                <span className="text-3xl sm:text-4xl">{meta.icon}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Datos adicionales */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-xl p-3.5 sm:p-4 md:p-5 mb-6">
                  <DatosAdicionales
                    subPantalla={subPantalla}
                    handleSubPantallaChange={setSubPantalla}
                    claveConsulta={claveConsulta}
                    numeroDeNomina={pacienteSeleccionado?.clavenomina}
                    clavepaciente={pacienteSeleccionado?.clavepaciente}
                    nombrePaciente={pacienteSeleccionado?.nombrepaciente}
                    nombreMedico={nombreMedico}
                    claveEspecialidad={claveEspecialidad}
                    pasarEspecialidad={pasarEspecialidad}
                    setPasarEspecialidad={setPasarEspecialidad}
                    especialidadSeleccionada={especialidadSeleccionada}
                    setEspecialidadSeleccionada={setEspecialidadSeleccionada}
                    observaciones={observaciones}
                    setObservaciones={setObservaciones}
                  />
                </div>

                {/* Acciones — tooltip FIX: z-50 + overflow-visible */}
                <div className="relative z-50 overflow-visible">
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-xl p-3.5 sm:p-4 md:p-5">
                    <AccionesConsulta
                      formCompleto={formCompleto}
                      limpiarFormulario={limpiarFormulario}
                      claveConsulta={claveConsulta}
                      clavepaciente={pacienteSeleccionado?.clavepaciente}
                      clavenomina={pacienteSeleccionado?.clavenomina}
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Diagnostico;
