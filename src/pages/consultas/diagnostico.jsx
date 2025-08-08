/* eslint-disable @typescript-eslint/no-unused-vars */
import Image from "next/image";
import DatosAdicionales from "./datos-adicionales/datos-adicionales";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import React, { useState, useEffect, useRef, useContext } from "react";
import { FormularioContext } from "/src/context/FormularioContext";
import AccionesConsulta from "./AccionesConsulta";
import { showCustomAlert } from "../../utils/alertas";

const formatearFecha = (fecha) => {
  if (!fecha) return "N/A";

  const opciones = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  const fechaLocal = new Date(fecha);

  return fechaLocal.toLocaleString("es-MX", opciones);
};

const Diagnostico = () => {
  const router = useRouter();

  const handleRegresar = () => {
    router.replace("/inicio-servicio-medico"); //* Redirige a /inicio-servicio-medico
  };

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

  //* Leer nombre del médico desde las cookies
  useEffect(() => {
    const nombre = Cookies.get("nombreusuario"); //* Obtén el valor desde las cookies
    //console.log("Nombre del médico desde cookies:", nombre);
    setNombreMedico(nombre || "No especificado");

    const especialidad = Cookies.get("claveespecialidad");
    //console.log("Clave especialidad: ", especialidad);
    setClaveEspecialidad(especialidad || "No especificado");

    const costo = Cookies.get("costo");
    //console.log("Costo: ", costo);
    setCosto(costo || "No especificado");

    const claveusuario = Cookies.get("claveusuario");
    //console.log("Clave claveusuario: ", claveusuario);
    setClaveusuario(claveusuario || "No especificado");
  }, []);

  //* Recarga la lista de pacientes al cargar la página o al actualizar datos
  useEffect(() => {
    const today = new Date();
    const formattedDate = `${today.getFullYear()}-${
      today.getMonth() + 1
    }-${today.getDate()}`;
    setFecha(formattedDate);
    cargarPacientesDelDia();
  }, []);

  useEffect(() => {
    //console.log("Estado de validación del formulario:", formCompleto);
  }, [formCompleto]);

  //* Función para cargar pacientes del día
  const cargarPacientesDelDia = async () => {
    try {
      const response = await fetch(
        "/api/pacientes-consultas/consultasHoy?clavestatus=1"
      );
      const data = await response.json();
      if (response.ok) {
        const pacientesOrdenados = data.consultas.sort(
          (a, b) => new Date(a.fechaconsulta) - new Date(b.fechaconsulta)
        );
        setPacientes(pacientesOrdenados);
      } else {
        console.error("Error al cargar consultas del día:", data.message);
        await showCustomAlert(
          "error",
          "Error al cargar pacientes",
          "No se pudo cargar la información. Inténtalo nuevamente.",
          "Aceptar"
        );
      }
    } catch (error) {
      console.error("Error al cargar consultas del día:", error);
      await showCustomAlert(
        "error",
        "Error al cargar pacientes",
        "No se pudo cargar la información. Inténtalo nuevamente.",
        "Aceptar"
      );
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
        console.error(
          "Error al obtener datos del empleado:",
          await response.json()
        );
        await showCustomAlert(
          "error",
          "Error al obtener datos",
          "Hubo un problema al obtener los datos del empleado. Inténtalo nuevamente más tarde.",
          "Aceptar"
        );
      }
    } catch (error) {
      console.error("Error al conectar con el servicio de empleado:", error);
      await showCustomAlert(
        "error",
        "Error al obtener datos",
        "Hubo un problema al obtener los datos del empleado. Inténtalo nuevamente más tarde.",
        "Aceptar"
      );
    }
  };

  const handlePacienteClick = async (paciente) => {
    //console.log("Datos del paciente seleccionado:", paciente);
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
      setSelectedBeneficiary({
        ...paciente,
        PARENTESCO_DESC: paciente.parentesco_desc,
      });
    } else {
      setConsultaSeleccionada("empleado");
      setSelectedBeneficiary(null);
    }

    await obtenerDatosEmpleado(paciente.clavenomina);
  };

  const limpiarFormulario = () => {
    //* Limpiar los datos del formulario
    setDiagnostico("");
    setMotivoConsulta("");
    setSignosVitales({
      ta: "",
      temperatura: "",
      fc: "",
      oxigenacion: "",
      altura: "",
      peso: "",
      glucosa: "",
    });
    setAlergias("");
    setObservaciones("");
    setEspecialidadSeleccionada("");
    setPasarEspecialidad(null);
    setEmpleadoData(null);
    setDatosEditados({
      signosVitales: {},
      alergias: "",
    });

    //* Cierra el formulario emergente y muestra solo la tabla
    setPacienteSeleccionado(null);
    setMostrarEmergente(false);
  };

  //* Verifica si todos los campos requeridos están completos
  useEffect(() => {
    const verificarFormularioCompleto = () => {
      const camposRequeridosLlenos =
        claveConsulta &&
        diagnostico &&
        motivoConsulta &&
        signosVitales.ta &&
        signosVitales.temperatura;
      const paseEspecialidadCompleto =
        pasarEspecialidad === "no" ||
        (pasarEspecialidad === "si" &&
          especialidadSeleccionada &&
          observaciones);

      setFormularioCompleto(camposRequeridosLlenos && paseEspecialidadCompleto);
    };

    verificarFormularioCompleto();
  }, [
    claveConsulta,
    diagnostico,
    motivoConsulta,
    signosVitales,
    pasarEspecialidad,
    especialidadSeleccionada,
    observaciones,
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-black to-grey-700 text-white px-6 py-8 md:px-16">
      {/* Encabezado */}
      <div className="relative rounded-2xl p-8 mb-12 ">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <Image
                src="/login_servicio_medico.png"
                alt="Consulta Icono"
                width={150}
                height={150}
                className="h-36 w-36 rounded-full shadow-[0px_0px_30px_10px_rgba(255,255,255,0.3)]"
              />
              <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-dotted border-cyan-400 animate-spin-slow"></div>
            </div>
            <div>
              <h1 className="text-5xl font-semibold text-blue-300 drop-shadow-lg">
                Consulta General
              </h1>
              <p className="text-lg mt-2 text-gray-300 font-semibold tracking-wide italic">
                Innovación Médica Inteligente
              </p>
            </div>
            
          </div>
          <div className="mt-6 md:mt-0 text-center md:text-right">
            <p className="text-lg font-semibold text-gray-400">Médico:</p>
            <p className="text-2xl font-bold text-blue-300 tracking-wide">
              {nombreMedico}
            </p>
            
          </div>
          
        </div>
              {/* Botón regresar */}
      <div className="mt-6 md:mt-0 text-center md:text-right">
        <button
          onClick={handleRegresar}
        >
          ← Regresar
        </button>
      </div>
      </div>

      {/* Tabla de Pacientes */}
      <div className="relative bg-gradient-to-b from-gray-900 to-gray-800 p-8 rounded-2xl ">
        <h2 className="text-2xl font-semibold text-blue-300 text-center mb-8 tracking-wide drop-shadow-lg">
          PACIENTES EN ESPERA
        </h2>
        <table className="w-full table-auto bg-gradient-to-b from-gray-900 to-gray-800 rounded-lg overflow-hidden shadow-lg">
          <thead>
            <tr className="bg-gradient-to-r from-blue-900 to-blue-800 text-gray-100 font-bold">
              <th className="py-4 px-6 text-left">NÚMERO DE NÓMINA</th>
              <th className="py-4 px-6 text-left">PACIENTE</th>
              <th className="py-4 px-6 text-left">EDAD</th>
              <th className="py-4 px-6 text-left">SECRETARÍA</th>
            </tr>
          </thead>
          <tbody>
            {pacientes.length > 0 ? (
              pacientes.map((paciente, index) => (
                <tr
                  key={paciente.claveconsulta}
                  className={`${
                    index % 2 === 0 ? "bg-gray-800" : "bg-gray-700"
                  } hover:bg-gradient-to-r hover:from-blue-900 hover:rgb(26, 51, 122) transition duration-300 ease-in-out cursor-pointer`}
                  onClick={() => handlePacienteClick(paciente)}
                >
                  <td className="py-4 px-6 text-gray-200">
                    {paciente.clavenomina || "N/A"}
                  </td>
                  <td className="py-4 px-6 text-gray-200">
                    {paciente.nombrepaciente || "No disponible"}
                  </td>
                  <td className="py-4 px-6 text-gray-200">
                    {paciente.edad || "Desconocida"}
                  </td>
                  <td className="py-4 px-6 text-gray-200">
                    {paciente.departamento || "No asignado"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="4"
                  className="text-center py-6 text-gray-400 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800"
                >
                  No hay consultas para el día de hoy.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pacienteSeleccionado && (
        <div
          ref={subPantallaRef}
          className="bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg"
        >
          <div className="bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg">
            <div className="mb-4 md:mb-8">
                      <h2 className="text-2xl font-semibold text-blue-300 text-center mb-8 tracking-wide drop-shadow-lg">
CAPTURA DE CONSULTA
        </h2>
              <ul className="list-disc pl-5 text-sm md:text-base">
                <li className="flex items-center">
                  <span className="font-semibold">Folio:</span>
                  <span className="ml-1">{claveConsulta}</span>
                </li>
                <li className="flex items-center">
                  <span className="font-semibold">Fecha:</span>
                  <span className="ml-1">{formatearFecha(fecha)}</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-8 mb-8">
              <div>
                <Image
                  src={fotoEmpleado || "/user_icon_.png"}
                  alt="Empleado"
                  width={160}
                  height={160}
                  className="h-24 w-24 md:h-40 md:w-40 object-cover rounded-full bg-gray-600"
                />
              </div>
              <div className="bg-gray-700 p-4 rounded flex-1 shadow-lg transition duration-300 hover:shadow-xl">
                <h2 className="text-md md:text-lg font-bold mb-2">
                  Datos del Paciente
                </h2>
                <p>
                  Paciente:{" "}
                  {pacienteSeleccionado?.nombrepaciente || "No disponible"}
                </p>
                <p>Edad: {pacienteSeleccionado?.edad || "Desconocida"}</p>
                <p>
                  Parentesco:{" "}
                  {consultaSeleccionada === "beneficiario" &&
                  selectedBeneficiary
                    ? selectedBeneficiary.PARENTESCO_DESC
                    : "Empleado(a)"}
                </p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg flex-1 shadow-lg transition duration-300 hover:shadow-xl">
                <h2 className="text-md md:text-lg font-bold mb-2">
                  Datos del Empleado
                </h2>
                <p>
                  Nómina: {pacienteSeleccionado?.clavenomina || "No disponible"}
                </p>
                <p>
                  Trabajador: {empleadoData?.nombreCompleto || "No disponible"}
                </p>
                <p>
                  Departamento: {empleadoData?.departamento || "No asignado"}
                </p>
                <p>Puesto: {empleadoData?.puesto || "No asignado"}</p>
              </div>
            </div>

            <div className="mt-4 md:mt-6 mb-6 md:mb-12">
              <h3 className="text-lg md:text-2xl font-bold mb-4">
                Signos Vitales
              </h3>
              <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(signosVitales).map(([key, value]) => (
                  <label key={key} className="text-sm md:text-base">
                    {key.toUpperCase()}:
                    <input
                      type="text"
                      name={key}
                      value={value}
                      readOnly
                      className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white p-2"
                    />
                  </label>
                ))}
              </form>
            </div>

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

            <AccionesConsulta
              formCompleto={formCompleto}
              limpiarFormulario={limpiarFormulario}
              claveConsulta={claveConsulta}
              clavepaciente={pacienteSeleccionado?.clavepaciente}
              clavenomina={pacienteSeleccionado?.clavenomina}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Diagnostico;
