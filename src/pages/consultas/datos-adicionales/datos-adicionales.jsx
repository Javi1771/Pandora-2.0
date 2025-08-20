/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, {
  useState,
  useEffect,
  useCallback,
  useContext,
  useRef,
} from "react";
import { createPortal } from "react-dom";
import Medicamentos from "./medicamentos";
import PaseEspecialidad from "./pase-especialidad";
import Incapacidades from "./incapacidades";
import HistorialConsultas from "./historial-consultas";
import EnfermedadesCronicas from "./enfermedades-cronicas";
import Antecedentes from "./antecedentes";
import { FormularioContext } from "/src/context/FormularioContext";
import {
  FaNotesMedical,
  FaPills,
  FaClinicMedical,
  FaFileMedical,
  FaHistory,
  FaHeartbeat,
  FaAllergies,
  FaClipboard,
  FaStethoscope,
  FaUserMd,
  FaInfoCircle,
  FaIdCard,
  FaTimesCircle,
  FaExclamationTriangle,
  FaBars,
} from "react-icons/fa";

/** ---------- FUNCIONES COMPARTIDAS (nivel módulo) ---------- */
const getIconForSection = (section) => {
  switch (section) {
    case "Diagnóstico":
      return <FaNotesMedical className="text-blue-500" />;
    case "Medicamentos":
      return <FaPills className="text-purple-500" />;
    case "Pase a Especialidad":
      return <FaClinicMedical className="text-green-500" />;
    case "Incapacidades":
      return <FaFileMedical className="text-red-500" />;
    case "Historial de Consultas":
      return <FaHistory className="text-yellow-500" />;
    case "Padecimientos Cronicos":
      return <FaHeartbeat className="text-pink-500" />;
    case "Antecedentes":
      return <FaClipboard className="text-indigo-500" />;
    default:
      return <FaStethoscope className="text-gray-500" />;
  }
};

/** ---------- Modal en Portal ---------- */
function MobileMenuModal({ open, onClose, sections, activeTab, onSelect }) {
  const modalRef = useRef(null);
  const lastFocused = useRef(null);
  const [mounted, setMounted] = useState(false);
  const portalNodeRef = useRef(null);

  useEffect(() => {
    const node = document.createElement("div");
    node.setAttribute("data-portal", "mobile-menu");
    document.body.appendChild(node);
    portalNodeRef.current = node;
    setMounted(true);
    return () => {
      if (portalNodeRef.current) {
        document.body.removeChild(portalNodeRef.current);
        portalNodeRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    lastFocused.current = document.activeElement;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusFirst = () => {
      const root = modalRef.current;
      if (!root) return;
      const focusables = root.querySelectorAll(
        'a,button,textarea,input,select,[tabindex]:not([tabindex="-1"])'
      );
      if (focusables.length) focusables[0].focus();
    };
    focusFirst();

    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") {
        const root = modalRef.current;
        const items = root?.querySelectorAll(
          'a,button,textarea,input,select,[tabindex]:not([tabindex="-1"])'
        );
        if (!items || !items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKeyDown);
      if (lastFocused.current && lastFocused.current.focus) {
        lastFocused.current.focus();
      }
    };
  }, [open, onClose]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024 && open) onClose();
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [open, onClose]);

  if (!mounted || !open || !portalNodeRef.current) return null;

  const modal = (
    <div
      className="fixed inset-0 z-[2147483647] flex items-end sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mobile-menu-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Contenedor modal */}
      <div
        ref={modalRef}
        className="
          relative w-full sm:max-w-md md:max-w-lg 
          bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl 
          overflow-hidden 
          translate-y-0 sm:translate-y-0 
          animate-[menuIn_.18s_ease-out]
          max-h-[85vh]                       /* CHANGED: menos alto para móviles */
          flex flex-col
        "
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header modal */}
        <div className="flex items-center justify-between px-3 py-2 sm:px-4 sm:py-3 border-b">
          <h2
            id="mobile-menu-title"
            className="font-semibold text-gray-900 text-[clamp(14px,3.5vw,16px)]" /* CHANGED */
          >
            Menú de opciones
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            aria-label="Cerrar menú"
          >
            <FaTimesCircle />
          </button>
        </div>

        {/* Contenido modal */}
        <div className="p-2.5 sm:p-4 overflow-y-auto">
          <div className="grid grid-cols-1 min-[480px]:grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3"> {/* CHANGED */}
            {sections.map((pantalla) => {
              const active = activeTab === pantalla;
              return (
                <button
                  key={pantalla}
                  onClick={() => onSelect(pantalla)}
                  className={`flex items-center gap-2 p-2.5 min-[480px]:p-3 rounded-xl border transition 
                    text-left focus:outline-none focus:ring-2 focus:ring-indigo-300 text-[13px] min-[480px]:text-sm /* CHANGED */
                    ${
                      active
                        ? "border-indigo-300 bg-indigo-50 ring-1 ring-indigo-200"
                        : "border-gray-200 bg-gray-50 hover:bg-gray-100"
                    }`}
                >
                  <div className="text-lg min-[480px]:text-xl">{getIconForSection(pantalla)}</div>
                  <span className="font-medium text-gray-800 truncate">
                    {pantalla}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Animación keyframes */}
      <style jsx>{`
        @keyframes menuIn {
          from {
            transform: translateY(10px);
            opacity: 0.98;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );

  return createPortal(modal, portalNodeRef.current);
}

/** ------------------------- Componente principal ------------------------- */
const DatosAdicionales = ({
  subPantalla,
  handleSubPantallaChange,
  claveConsulta,
  limpiarFormularioGlobal,
  numeroDeNomina,
  nombrePaciente,
  clavepaciente,
  nombreMedico,
  claveEspecialidad,
  pasarEspecialidad,
  setPasarEspecialidad,
  especialidadSeleccionada,
  setEspecialidadSeleccionada,
  observaciones,
  setObservaciones,
}) => {
  const { formulariosCompletos, updateFormulario } =
    useContext(FormularioContext);

  const [diagnosticoTexto, setDiagnosticoTexto] = useState("");
  const [motivoConsultaTexto, setMotivoConsultaTexto] = useState("");
  const [alergiasTexto, setAlergiasTexto] = useState("");
  const [activeTab, setActiveTab] = useState("Diagnóstico");
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Límites
  const MAX_LINEAS = 6;
  const MAX_CARACTERES_POR_LINEA = 130;
  const MAX_CARACTERES_TOTAL = MAX_LINEAS * MAX_CARACTERES_POR_LINEA;

  const processText = (text) => {
    let upperText = text.toUpperCase();
    let lines = upperText.split("\n");
    let processedLines = [];
    for (let line of lines) {
      while (line.length > MAX_CARACTERES_POR_LINEA) {
        processedLines.push(line.slice(0, MAX_CARACTERES_POR_LINEA));
        line = line.slice(MAX_CARACTERES_POR_LINEA);
      }
      processedLines.push(line);
    }
    if (processedLines.length > MAX_LINEAS) {
      processedLines = processedLines.slice(0, MAX_LINEAS);
    }
    return processedLines.join("\n");
  };

  useEffect(() => {
    const diagnostico = localStorage.getItem("diagnosticoTexto") || "";
    const motivoConsulta = localStorage.getItem("motivoConsultaTexto") || "";
    const alergias = localStorage.getItem("alergiasTexto") || "";
    setDiagnosticoTexto(processText(diagnostico));
    setMotivoConsultaTexto(processText(motivoConsulta));
    setAlergiasTexto(alergias.toUpperCase().slice(0, 100));
  }, [claveConsulta]);

  const limpiarFormulario = useCallback(() => {
    setDiagnosticoTexto("");
    setMotivoConsultaTexto("");
    setAlergiasTexto("");
    localStorage.removeItem("diagnosticoTexto");
    localStorage.removeItem("motivoConsultaTexto");
    localStorage.removeItem("alergiasTexto");
    if (limpiarFormularioGlobal) limpiarFormularioGlobal();
  }, [limpiarFormularioGlobal]);

  const handleDiagnosticoChange = useCallback((e) => {
    const inputText = e.target.value;
    if (inputText.length <= MAX_CARACTERES_TOTAL + MAX_LINEAS - 1) {
      const newValue = processText(inputText);
      setDiagnosticoTexto(newValue);
      localStorage.setItem("diagnosticoTexto", newValue);
    }
  }, []);

  const handleMotivoConsultaChange = useCallback((e) => {
    const inputText = e.target.value;
    if (inputText.length <= MAX_CARACTERES_TOTAL + MAX_LINEAS - 1) {
      const newValue = processText(inputText);
      setMotivoConsultaTexto(newValue);
      localStorage.setItem("motivoConsultaTexto", newValue);
    }
  }, []);

  const handleAlergiasChange = useCallback((e) => {
    const raw = e.target.value.toUpperCase();
    const newValue = raw.slice(0, 100);
    setAlergiasTexto(newValue);
    localStorage.setItem("alergiasTexto", newValue);
  }, []);

  useEffect(() => {
    const esCompleto =
      diagnosticoTexto.trim().length > 0 &&
      motivoConsultaTexto.trim().length > 0;
    if (formulariosCompletos["DatosAdicionales"] !== esCompleto) {
      updateFormulario("DatosAdicionales", esCompleto);
    }
  }, [
    diagnosticoTexto,
    motivoConsultaTexto,
    formulariosCompletos,
    updateFormulario,
  ]);

  const sections = [
    "Diagnóstico",
    "Medicamentos",
    "Pase a Especialidad",
    "Incapacidades",
    "Historial de Consultas",
    "Padecimientos Cronicos",
    "Antecedentes",
  ];

  const handleTabClick = (pantalla) => {
    handleSubPantallaChange(pantalla);
    setActiveTab(pantalla);
    setShowMobileMenu(false);
  };

  const getPercentage = (current, max) => Math.min(100, (current / max) * 100);
  const getProgressColor = (percentage) => {
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 75) return "bg-yellow-500";
    return "bg-blue-500";
  };

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setShowMobileMenu(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div
      className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 min-h-screen p-2 sm:p-3 md:p-4 lg:p-6 w-full min-w-0 overflow-x-hidden" /* CHANGED */
      aria-hidden={showMobileMenu ? "true" : undefined}
    >
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-2xl border border-gray-100 overflow-hidden w-full mx-auto max-w-full"> {/* CHANGED */}
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-3 sm:p-4 md:p-6 text-white relative">
          {/* círculos decorativos menos intrusivos en móviles */}
          <div className="pointer-events-none select-none hidden min-[420px]:block absolute top-0 right-0 w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-white/10 rounded-full -translate-y-8 sm:-translate-y-10 md:-translate-y-16 translate-x-8 sm:translate-x-10 md:translate-x-16" />
          <div className="pointer-events-none select-none hidden min-[420px]:block absolute bottom-0 left-0 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-white/10 rounded-full translate-y-6 sm:translate-y-8 md:translate-y-12 -translate-x-6 sm:-translate-x-8 md:-translate-x-12" />

          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center relative z-10 gap-3 sm:gap-4">
            <div className="flex items-center min-w-0"> {/* CHANGED */}
              <div className="bg-white/20 p-2 sm:p-3 rounded-lg sm:rounded-xl shadow-sm mr-3 sm:mr-4 backdrop-blur-sm flex-shrink-0">
                <FaUserMd className="text-xl sm:text-2xl text-white" />
              </div>
              <div className="min-w-0"> {/* CHANGED */}
                <h2 className="font-bold truncate max-w-[160px] sm:max-w-xs text-[clamp(14px,3.6vw,20px)]"> {/* CHANGED */}
                  {nombreMedico}
                </h2>
                <p className="text-[clamp(11px,3.2vw,14px)] text-blue-100 mt-0.5">
                  Especialidad: {claveEspecialidad}
                </p>
              </div>
            </div>
            <div className="bg-white/20 p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl shadow-sm backdrop-blur-sm w-full lg:w-auto mt-2 lg:mt-0">
              <div className="flex items-center min-w-0"> {/* CHANGED */}
                <FaIdCard className="text-white mr-2 text-sm sm:text-base flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-[clamp(12px,3.2vw,14px)] font-medium truncate">
                    Paciente: <span className="font-semibold">{nombrePaciente}</span>
                  </p>
                  <p className="text-[clamp(11px,3vw,13px)] text-blue-100 mt-1 truncate">
                    Nómina: {numeroDeNomina}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Barra superior móvil */}
        <div className="lg:hidden border-b border-gray-200 bg-white px-3 sm:px-4 py-2 flex justify-between items-center sticky top-0 z-20">
          <span className="font-medium text-gray-700 truncate max-w-[65%] text-[clamp(13px,3.5vw,15px)]"> {/* CHANGED */}
            {activeTab}
          </span>
          <button
            onClick={() => setShowMobileMenu(true)}
            className="p-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-95 transition"
            aria-label="Abrir menú"
          >
            <FaBars />
          </button>
        </div>

        {/* Navegación (desktop) */}
        <div className="hidden lg:block border-b border-gray-200 bg-white px-3 sm:px-4 md:px-6 py-2 sm:py-3">
          <div className="flex flex-nowrap gap-2 overflow-x-auto w-full no-scrollbar"> {/* CHANGED */}
            {[
              "Diagnóstico",
              "Medicamentos",
              "Pase a Especialidad",
              "Incapacidades",
              "Historial de Consultas",
              "Padecimientos Cronicos",
              "Antecedentes",
            ].map((pantalla) => (
              <button
                key={pantalla}
                onClick={() => handleTabClick(pantalla)}
                className={`flex items-center transition-all duration-300 py-2 px-4 rounded-xl whitespace-nowrap text-[15px] /* CHANGED */
                  ${
                    activeTab === pantalla
                      ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800"
                  }`}
              >
                <span className="mr-2">{getIconForSection(pantalla)}</span>
                <span className="truncate">{pantalla}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Contenido principal */}
        <div className="p-3 sm:p-4 md:p-6 bg-gradient-to-b from-white to-gray-50 w-full min-w-0"> {/* CHANGED */}
          {subPantalla === "Diagnóstico" && (
            <div className="space-y-3 sm:space-y-6"> {/* CHANGED: menos gap en móvil */}
              {/* Diagnóstico */}
              <div className="bg-white p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1.5 sm:w-2 h-full bg-blue-500" />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 gap-2">
                  <div className="flex items-center min-w-0"> {/* CHANGED */}
                    <div className="bg-blue-100 p-1.5 sm:p-2 rounded-md sm:rounded-lg mr-2 sm:mr-3 flex-shrink-0">
                      <FaNotesMedical className="text-blue-600 text-base sm:text-lg" />
                    </div>
                    <h3 className="font-semibold text-gray-800 text-[clamp(14px,3.6vw,18px)] truncate"> {/* CHANGED */}
                      Diagnóstico
                    </h3>
                  </div>
                  <span
                    className={`text-[12px] sm:text-xs px-2 sm:px-3 py-1 rounded-full font-medium flex-shrink-0 ${
                      diagnosticoTexto.length >= MAX_CARACTERES_TOTAL
                        ? "bg-red-100 text-red-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {diagnosticoTexto.length}/{MAX_CARACTERES_TOTAL} caracteres
                  </span>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2 mb-2 sm:mb-3">
                  <div
                    className={`h-1.5 sm:h-2 rounded-full ${getProgressColor(
                      getPercentage(
                        diagnosticoTexto.length,
                        MAX_CARACTERES_TOTAL
                      )
                    )}`}
                    style={{
                      width: `${getPercentage(
                        diagnosticoTexto.length,
                        MAX_CARACTERES_TOTAL
                      )}%`,
                    }}
                  />
                </div>

                <textarea
                  className="w-full h-[28vh] sm:h-40 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-gray-300 text-black focus:border-blue-400 focus:ring-2 sm:focus:ring-4 focus:ring-blue-100 resize-none transition-all duration-200 text-[clamp(13px,3.4vw,16px)] leading-5" /* CHANGED */
                  placeholder="Escriba aquí el diagnóstico..."
                  value={diagnosticoTexto}
                  onChange={handleDiagnosticoChange}
                />

                <div className="flex flex-col sm:flex-row sm:flex-wrap sm:justify-between items-start sm:items-center mt-2 sm:mt-3 text-xs text-gray-500 gap-1">
                  <span>
                    Máximo {MAX_LINEAS} líneas de {MAX_CARACTERES_POR_LINEA} caracteres cada una
                  </span>
                  {diagnosticoTexto.length >= MAX_CARACTERES_TOTAL && (
                    <span className="text-red-500 font-medium flex items-center">
                      <FaExclamationTriangle className="mr-1 text-xs" /> Límite alcanzado
                    </span>
                  )}
                </div>
              </div>

              {/* Observaciones */}
              <div className="bg-white p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1.5 sm:w-2 h-full bg-green-500" />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 gap-2">
                  <div className="flex items-center min-w-0">
                    <div className="bg-green-100 p-1.5 sm:p-2 rounded-md sm:rounded-lg mr-2 sm:mr-3 flex-shrink-0">
                      <FaClipboard className="text-green-600 text-base sm:text-lg" />
                    </div>
                    <h3 className="font-semibold text-gray-800 text-[clamp(14px,3.6vw,18px)] truncate">
                      Observaciones
                    </h3>
                  </div>
                  <span
                    className={`text-[12px] sm:text-xs px-2 sm:px-3 py-1 rounded-full font-medium flex-shrink-0 ${
                      motivoConsultaTexto.length >= MAX_CARACTERES_TOTAL
                        ? "bg-red-100 text-red-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {motivoConsultaTexto.length}/{MAX_CARACTERES_TOTAL} caracteres
                  </span>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2 mb-2 sm:mb-3">
                  <div
                    className={`h-1.5 sm:h-2 rounded-full ${getProgressColor(
                      getPercentage(
                        motivoConsultaTexto.length,
                        MAX_CARACTERES_TOTAL
                      )
                    )}`}
                    style={{
                      width: `${getPercentage(
                        motivoConsultaTexto.length,
                        MAX_CARACTERES_TOTAL
                      )}%`,
                    }}
                  />
                </div>

                <textarea
                  className="w-full h-[28vh] sm:h-40 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-gray-300 text-black focus:border-green-400 focus:ring-2 sm:focus:ring-4 focus:ring-green-100 resize-none transition-all duration-200 text-[clamp(13px,3.4vw,16px)] leading-5" /* CHANGED */
                  placeholder="Escriba aquí las observaciones..."
                  value={motivoConsultaTexto}
                  onChange={handleMotivoConsultaChange}
                />

                <div className="flex flex-col sm:flex-row sm:flex-wrap sm:justify-between items-start sm:items-center mt-2 sm:mt-3 text-xs text-gray-500 gap-1">
                  <span>
                    Máximo {MAX_LINEAS} líneas de {MAX_CARACTERES_POR_LINEA} caracteres cada una
                  </span>
                  {motivoConsultaTexto.length >= MAX_CARACTERES_TOTAL && (
                    <span className="text-red-500 font-medium flex items-center">
                      <FaExclamationTriangle className="mr-1 text-xs" /> Límite alcanzado
                    </span>
                  )}
                </div>
              </div>

              {/* Alergias */}
              <div className="bg-white p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1.5 sm:w-2 h-full bg-yellow-500" />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 gap-2">
                  <div className="flex items-center min-w-0">
                    <div className="bg-yellow-100 p-1.5 sm:p-2 rounded-md sm:rounded-lg mr-2 sm:mr-3 flex-shrink-0">
                      <FaAllergies className="text-yellow-600 text-base sm:text-lg" />
                    </div>
                    <h3 className="font-semibold text-gray-800 text-[clamp(14px,3.6vw,18px)] truncate">
                      Alergias <span className="text-[clamp(11px,3vw,13px)] font-normal text-gray-500">(Opcional)</span>
                    </h3>
                  </div>
                  <span
                    className={`text-[12px] sm:text-xs px-2 sm:px-3 py-1 rounded-full font-medium flex-shrink-0 ${
                      alergiasTexto.length >= 100
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {alergiasTexto.length}/100 caracteres
                  </span>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2 mb-2 sm:mb-3">
                  <div
                    className={`h-1.5 sm:h-2 rounded-full ${getProgressColor(
                      getPercentage(alergiasTexto.length, 100)
                    )}`}
                    style={{ width: `${getPercentage(alergiasTexto.length, 100)}%` }}
                  />
                </div>

                <div className="relative">
                  <input
                    type="text"
                    className="w-full p-3 sm:p-4 rounded-lg sm:rounded-xl border border-gray-300 focus:border-yellow-400 text-black focus:ring-2 sm:focus:ring-4 focus:ring-yellow-100 transition-all duration-200 pr-10 sm:pr-12 text-[clamp(13px,3.4vw,16px)]" /* CHANGED */
                    placeholder="Escriba aquí las alergias (máx. 100 caracteres)"
                    value={alergiasTexto}
                    onChange={handleAlergiasChange}
                    maxLength={100}
                  />
                  {alergiasTexto.length > 0 && (
                    <button
                      onClick={() => setAlergiasTexto("")}
                      className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors text-sm sm:text-base"
                      aria-label="Limpiar alergias"
                    >
                      <FaTimesCircle />
                    </button>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row sm:flex-wrap sm:justify-between items-start sm:items-center mt-2 sm:mt-3 text-xs text-gray-500 gap-1">
                  <span>Máximo 100 caracteres - texto en mayúsculas automático</span>
                  {alergiasTexto.length >= 100 && (
                    <span className="text-red-500 font-medium flex items-center">
                      <FaExclamationTriangle className="mr-1 text-xs" /> Límite alcanzado
                    </span>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl border border-blue-200 flex items-start mt-4 sm:mt-6">
                <div className="bg-blue-100 p-1.5 sm:p-2 rounded-md sm:rounded-lg mr-3 sm:mr-4 flex-shrink-0">
                  <FaInfoCircle className="text-blue-600 text-lg sm:text-xl" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-semibold text-blue-800 mb-1 sm:mb-2 text-[clamp(13px,3.4vw,16px)]">
                    Información Importante
                  </h4>
                  <p className="text-[clamp(12px,3.2vw,14px)] text-blue-700">
                    Todo el texto se convertirá automáticamente a mayúsculas. El sistema divide
                    líneas largas (máx. {MAX_CARACTERES_POR_LINEA} por línea). Revise antes de guardar.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Resto de componentes */}
          {subPantalla === "Medicamentos" && (
            <Medicamentos
              clavenomina={numeroDeNomina}
              nombrePaciente={nombrePaciente}
              claveConsulta={claveConsulta}
              nombreMedico={nombreMedico}
              clavepaciente={clavepaciente}
              claveEspecialidad={claveEspecialidad}
            />
          )}

          {subPantalla === "Pase a Especialidad" && (
            <PaseEspecialidad
              claveConsulta={claveConsulta}
              pasarEspecialidad={pasarEspecialidad}
              setPasarEspecialidad={setPasarEspecialidad}
              especialidadSeleccionada={especialidadSeleccionada}
              setEspecialidadSeleccionada={setEspecialidadSeleccionada}
              observaciones={observaciones}
              setObservaciones={setObservaciones}
              nombreMedico={nombreMedico}
              nombrePaciente={nombrePaciente}
              clavenomina={numeroDeNomina}
              clavepaciente={clavepaciente}
            />
          )}

          {subPantalla === "Incapacidades" && (
            <Incapacidades
              clavenomina={numeroDeNomina}
              nombrePaciente={nombrePaciente}
              clavepaciente={clavepaciente}
              claveConsulta={claveConsulta}
              nombreMedico={nombreMedico}
            />
          )}

          {subPantalla === "Historial de Consultas" && (
            <HistorialConsultas
              clavenomina={numeroDeNomina}
              clavepaciente={clavepaciente}
              nombrePaciente={nombrePaciente}
              claveConsulta={claveConsulta}
            />
          )}

          {subPantalla === "Padecimientos Cronicos" && (
            <EnfermedadesCronicas
              clavenomina={numeroDeNomina}
              clavepaciente={clavepaciente}
            />
          )}

          {subPantalla === "Antecedentes" && (
            <Antecedentes
              clavenomina={numeroDeNomina}
              clavepaciente={clavepaciente}
              nombrePaciente={nombrePaciente}
            />
          )}
        </div>
      </div>

      {/* Modal menú móvil (Portal) */}
      <MobileMenuModal
        open={showMobileMenu}
        onClose={() => setShowMobileMenu(false)}
        sections={sections}
        activeTab={activeTab}
        onSelect={handleTabClick}
      />

      {/* util: ocultar scrollbars horizontales del chipbar en desktop (opcional) */}
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default DatosAdicionales;
