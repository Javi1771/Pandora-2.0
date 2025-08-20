/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { showCustomAlert } from "../../utils/alertas";
import Cookies from "js-cookie";
import { FormularioContext } from "/src/context/FormularioContext";
import { createPortal } from "react-dom";

/* ============  🔹 HELPER PARA FORMATEAR FECHAS 🔹  ============ */
const normalizeDateForSQL = (value, start) => {
  if (!value) return null;
  if (typeof value === "string" && !value.includes("T")) return value;
  const d = new Date(value);
  const pad = (n) => String(n).padStart(2, "0");
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    ` ${start ? "00:00:00.000" : "23:59:00.000"}`
  );
};
/* ============================================================= */

/* ==================== Tooltip flotante en portal ==================== */
function FloatingTooltip({ anchorRef, open, onClose, children, offset = 10, placement = "top" }) {
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const portalNodeRef = useRef(null);

  useEffect(() => {
    const node = document.createElement("div");
    node.setAttribute("data-portal", "tooltip-root");
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
    if (!open || !anchorRef?.current) return;

    const update = () => {
      const rect = anchorRef.current.getBoundingClientRect();
      let top = placement === "bottom" ? rect.bottom + offset : rect.top - offset;
      let left = rect.left + rect.width / 2;

      // clamp horizontal
      const vw = window.innerWidth;
      const margin = 12;
      left = Math.max(margin, Math.min(left, vw - margin));

      setCoords({ top, left });
    };

    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [open, offset, placement, anchorRef]);

  if (!mounted || !open || !portalNodeRef.current) return null;

  return createPortal(
    <div
      className="fixed z-[2147483646] pointer-events-none"
      style={{ top: coords.top, left: coords.left, transform: "translate(-50%, -100%)" }}
      aria-hidden={!open}
    >
      <div className="absolute inset-0 -z-10 blur-xl opacity-50 bg-gradient-to-r from-emerald-500/15 via-indigo-500/15 to-cyan-500/15 rounded-2xl" />
      <div className="relative pointer-events-auto max-w-[92vw] sm:max-w-xs" onMouseLeave={onClose}>
        <div className="p-4 rounded-2xl border border-white/10 shadow-2xl bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-md">
          {children}
        </div>
        <div
          className="w-3 h-3 bg-gradient-to-br from-gray-900/95 to-gray-800/95 border-r border-b border-white/10"
          style={{ position: "absolute", left: "50%", transform: "translate(-50%, 2px) rotate(45deg)", bottom: "-6px" }}
        />
      </div>
    </div>,
    portalNodeRef.current
  );
}
/* ==================================================================== */

const AccionesConsulta = ({
  claveConsulta,
  limpiarFormulario,
  clavepaciente,
  clavenomina,
}) => {
  const { todosCompletos, formulariosCompletos } = useContext(FormularioContext);
  const [prioridad, setPrioridad] = useState("");
  const [loading, setLoading] = useState(false);
  const [tooltipMessage, setTooltipMessage] = useState({
    title: "Formularios incompletos",
    description: "Algunos formularios no están completos.",
    icon: "⚠️",
  });

  const router = useRouter();

  useEffect(() => {
    if (!claveConsulta) console.warn("⚠️ claveConsulta no está definido.");
    if (!clavepaciente) console.warn("⚠️ clavepaciente no está definido.");
    if (!clavenomina) console.warn("⚠️ clavenomina no está definido.");
  }, [claveConsulta, clavepaciente, clavenomina]);

  useEffect(() => {
    setTooltipMessage(tooltipFaltante());
  }, [todosCompletos, formulariosCompletos]);

  const tooltipFaltante = () => {
    const nombresLegibles = {
      DatosAdicionales: "Diagnóstico",
      Medicamentos: "Medicamentos",
      PaseEspecialidad: "Pase a Especialidad",
      Incapacidades: "Incapacidades",
    };

    const faltantes = Object.entries(formulariosCompletos)
      .filter(([, completo]) => !completo)
      .map(([pantalla]) => nombresLegibles[pantalla] || pantalla);

    if (faltantes.length === 0) {
      return {
        title: "¡Todo está completo!",
        description: "Todos los formularios están listos para guardar.",
        icon: "🎉",
      };
    }

    return {
      title: "Formularios incompletos",
      description: `Faltan los siguientes formularios: ${faltantes.join(", ")}.`,
      icon: "⚠️",
    };
  };

  const limpiarCacheLocalStorage = () => {
    localStorage.removeItem("diagnosticoTexto");
    localStorage.removeItem("motivoConsultaTexto");
    localStorage.removeItem("PaseEspecialidad");
    localStorage.removeItem("medicamentos");
    localStorage.removeItem("Incapacidad");
    localStorage.removeItem("decisionTomada");
    localStorage.removeItem("alergiasTexto");
  };

  const guardarDatosAdicionales = async () => {
    try {
      const diagnostico = localStorage.getItem("diagnosticoTexto") || "";
      const motivoConsulta = localStorage.getItem("motivoConsultaTexto") || "";
      const alergias = localStorage.getItem("alergiasTexto") || "";
      const claveUsuarioCookie = Cookies.get("claveusuario");
      const claveusuario = claveUsuarioCookie ? parseInt(claveUsuarioCookie, 10) : null;

      if (!diagnostico || !motivoConsulta) {
        throw new Error("El diagnóstico y el motivo de consulta son obligatorios.");
      }

      const response = await fetch("/api/pacientes-consultas/diagnostico_observaciones_guardar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          claveConsulta,
          diagnostico,
          motivoconsulta: motivoConsulta,
          alergias,
          claveusuario,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al guardar los datos adicionales.");
      }
    } catch (error) {
      console.error("❌ Error al guardar datos adicionales:", error);
      throw error;
    }
  };

  const guardarMedicamentos = async () => {
    try {
      const cachedMedicamentos = localStorage.getItem("medicamentos") || "[]";
      const decisionTomada = localStorage.getItem("decisionTomada");

      let medicamentos = [];
      try {
        medicamentos = JSON.parse(cachedMedicamentos);
      } catch (error) {
        console.error("❌ Error al parsear los medicamentos de localStorage:", error);
        localStorage.setItem("medicamentos", JSON.stringify([]));
        throw new Error("Error al leer los medicamentos almacenados.");
      }

      let medicamentosPayload;
      if (decisionTomada === "no" || !medicamentos.length) {
        medicamentosPayload = {
          folioReceta: claveConsulta,
          decisionTomada: "no",
          medicamentos: [],
          piezas: 0,
          resurtir: 0,
          mesesResurtir: null,
        };
      } else {
        if (!Array.isArray(medicamentos) || medicamentos.length === 0) {
          throw new Error("❌ No hay medicamentos para guardar.");
        }
        medicamentosPayload = {
          folioReceta: claveConsulta,
          decisionTomada,
          medicamentos: medicamentos.map((m) => ({
            descMedicamento: m.medicamento,
            indicaciones: m.indicaciones.trim(),
            cantidad: m.tratamiento.trim(),
            piezas: m.piezas,
            resurtir: m.resurtir === "si" ? 1 : 0,
            mesesResurtir: m.resurtir === "si" ? m.mesesResurtir : null,
          })),
        };
      }

      const response = await fetch("/api/medicamentos/guardar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(medicamentosPayload),
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const errorText = await response.text();
        console.error("❌ Respuesta no JSON:", errorText);
        throw new Error(`Respuesta inesperada del servidor: ${errorText}`);
      }

      await response.json();
    } catch (error) {
      console.error("❌ Error al guardar medicamentos:", error);
      throw error;
    }
  };

  useEffect(() => {
    const cachedEspecialidad = localStorage.getItem(`PaseEspecialidad:${claveConsulta}`);
    if (cachedEspecialidad) {
      const parsed = JSON.parse(cachedEspecialidad);
      if (parsed.prioridad) setPrioridad(parsed.prioridad);
    }
  }, [claveConsulta]);

  const guardarPaseEspecialidad = async () => {
    try {
      const cached = JSON.parse(localStorage.getItem(`PaseEspecialidad:${claveConsulta}`) || "{}");
      const payload = {
        claveConsulta: String(claveConsulta),
        seasignoaespecialidad: cached.pasarEspecialidad === "no" ? "N" : "S",
        claveEspecialidad: cached.pasarEspecialidad === "no" ? null : cached.especialidadSeleccionada,
        observaciones: cached.pasarEspecialidad === "no" ? null : cached.observaciones,
        prioridad: cached.pasarEspecialidad === "no" ? null : cached.prioridad,
        clavenomina: String(clavenomina),
        clavepaciente: String(clavepaciente),
      };

      const response = await fetch("/api/especialidades/guardarEspecialidad", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al guardar pase a especialidad.");
      }
    } catch (error) {
      console.error("❌ Error al guardar pase a especialidad:", error);
      throw error;
    }
  };

  const actualizarClavestatus = async (nuevoEstatus) => {
    try {
      const response = await fetch("/api/pacientes-consultas/actualizarClavestatus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claveConsulta, clavestatus: nuevoEstatus }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al actualizar el estatus.");
      }
    } catch (error) {
      console.error("❌ Error al actualizar clavestatus:", error);
      throw error;
    }
  };

  const guardarIncapacidad = async () => {
    try {
      const cachedIncapacidad = localStorage.getItem("Incapacidad") || "{}";
      const { fechaInicio, fechaFin, diagnostico } = JSON.parse(cachedIncapacidad);

      const payload = {
        claveConsulta,
        clavenomina,
        fechaInicial: normalizeDateForSQL(fechaInicio, true),
        fechaFinal: normalizeDateForSQL(fechaFin, false),
        diagnostico: diagnostico || "Sin Observaciones, No Se Asignó Incapacidad En Esta Consulta",
        estatus: 1,
        clavepaciente,
      };

      const response = await fetch("/api/incapacidades/guardar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al guardar incapacidad.");
      }
    } catch (error) {
      console.error("❌ Error al guardar incapacidad:", error);
      throw error;
    }
  };

  const handleGuardarGlobal = async () => {
    setLoading(true);
    try {
      if (
        formulariosCompletos["Medicamentos"] === false &&
        formulariosCompletos["PaseEspecialidad"] === false &&
        formulariosCompletos["Incapacidades"] === false
      ) {
        const result = await showCustomAlert(
          "warning",
          "Confirmación requerida",
          `No se asignarán medicamentos, especialidad ni incapacidad en esta consulta.<br/><span style="color: #ffcc00; font-weight: bold;">¿Desea continuar?</span>`,
          "Aceptar",
          {
            showCancelButton: true,
            confirmButtonColor: "#1e90ff",
            cancelButtonColor: "#ff1744",
            cancelButtonText: "Cancelar",
            background: "linear-gradient(145deg, #333333, #222222)",
            customClass: {
              popup:
                "border border-yellow-600 shadow-[0px_0px_20px_5px_rgba(255,255,0,0.9)] rounded-lg",
            },
          }
        );
        if (!result.isConfirmed) return;
      }

      await guardarDatosAdicionales();
      await guardarMedicamentos();
      await guardarPaseEspecialidad();
      await guardarIncapacidad();
      await actualizarClavestatus(2);

      limpiarCacheLocalStorage();
      localStorage.clear();
      limpiarFormulario();

      const encryptedClaveConsulta = btoa(claveConsulta.toString());
      router.push(`/consultas/recetas/ver-recetas?claveconsulta=${encryptedClaveConsulta}`);

      await showCustomAlert(
        "success",
        "Consulta Guardada",
        `
          La consulta se ha guardado correctamente.<br/>
          <strong style="color: #00e676; font-size: 1.2em;">Clave Consulta: ${claveConsulta}</strong>
        `,
        "Aceptar"
      );
    } catch (error) {
      console.error("❌ Error durante el guardado global:", error);
      await showCustomAlert(
        "error",
        "Error en el guardado",
        `
          Hubo un problema al guardar los datos. Por favor, revisa los errores e intenta nuevamente.<br/>
          <strong style="color: #ff1744;">Error: ${error.message || "No especificado"}</strong>
        `,
        "Aceptar"
      );
    } finally {
      setLoading(false);
    }
  };

  const tooltipData = tooltipFaltante();

  // --- Tooltip control & botón ---
  const wrapperRef = useRef(null);
  const [showTip, setShowTip] = useState(false);
  const blocked = !todosCompletos || loading;

  // 🔧 CAMBIO: abrir el tooltip SIEMPRE en hover/focus (aunque no esté bloqueado),
  // para que se vea también el mensaje de “¡Todo está completo!”
  const openTip = () => setShowTip(true);
  const closeTip = () => setShowTip(false);

  const handleClick = () => {
    if (blocked) {
      setShowTip(true);
      return;
    }
    handleGuardarGlobal();
  };

  // En móvil, solo mostramos tooltip con touch si está bloqueado, para no interferir el tap que guarda.
  const handleTouch = () => {
    if (!blocked) return;
    setShowTip(true);
    setTimeout(() => setShowTip(false), 2200);
  };

  return (
    <div className="flex flex-wrap gap-3 mt-4">
      <div
        ref={wrapperRef}
        className="relative inline-flex"
        onMouseEnter={openTip}
        onMouseLeave={closeTip}
        onFocus={openTip}
        onBlur={closeTip}
        onTouchStart={handleTouch}
      >
        {/* Borde degradado + botón */}
        <span
          className={`rounded-2xl p-[2px] ${
            blocked
              ? "bg-gradient-to-r from-gray-400 to-gray-500"
              : "bg-gradient-to-r from-emerald-400 via-emerald-600 to-emerald-400"
          }`}
        >
          <button
            onClick={handleClick}
            aria-disabled={blocked}
            title={blocked ? "Completa los formularios para habilitar el guardado" : "Guardar todo"}
            className={`relative px-5 sm:px-6 py-3 text-sm font-semibold rounded-xl shadow-md transition-all duration-200 
              focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
              ${
                blocked
                  ? "text-white bg-gradient-to-r from-gray-600 to-gray-700 cursor-not-allowed"
                  : "text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-emerald-500 hover:to-green-500 focus-visible:ring-indigo-300"
              }`}
            aria-describedby="tooltip-acciones"
          >
            <span className="inline-flex items-center gap-2">
              <span className={`inline-block h-2.5 w-2.5 rounded-full ${blocked ? "bg-gray-300" : "bg-emerald-400"}`} />
              {loading ? "Guardando..." : "Guardar Todo"}
            </span>
          </button>
        </span>

        {/* Tooltip en portal, siempre arriba */}
        <FloatingTooltip
          anchorRef={wrapperRef}
          open={showTip}
          onClose={closeTip}
          placement="top"
          offset={12}
        >
          <div id="tooltip-acciones" className="space-y-2">
            <div className="flex items-center gap-3">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  blocked ? "bg-amber-500/20 text-amber-300" : "bg-emerald-500/20 text-emerald-300"
                }`}
              >
                <span className="text-lg">{tooltipData.icon}</span>
              </div>
              <h3 className="text-sm font-semibold text-white">{tooltipData.title}</h3>
            </div>
            <p className="text-sm text-gray-300 leading-snug">{tooltipData.description}</p>
          </div>
        </FloatingTooltip>
      </div>
    </div>
  );
};

export default AccionesConsulta;
