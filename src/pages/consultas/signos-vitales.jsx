/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import Link from "next/link";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Cookies from "js-cookie";
import { Stethoscope } from "lucide-react";
import { useRouter } from "next/router";
import ConsultasAtendidas from "./consultas-adicionales/consultas-atendidas";
import { showCustomAlert } from "../../utils/alertas";
import ModalConsulta from "./components/ModalConsulta";

const calcularEdad = (fechaNacimiento) => {
  if (!fechaNacimiento)
    return { display: "0 años, 0 meses, 0 días", dbFormat: "0 años y 0 meses" };

  try {
    let dia, mes, año;
    if (fechaNacimiento.includes("/")) {
      [dia, mes, año] = fechaNacimiento.split(" ")[0].split("/");
    } else if (fechaNacimiento.includes("-")) {
      [año, mes, dia] = fechaNacimiento.split("T")[0].split("-");
    } else {
      throw new Error("Formato de fecha desconocido");
    }

    const fechaFormateada = `${año}-${mes}-${dia}`;
    const hoy = new Date();
    const nacimiento = new Date(fechaFormateada);

    let años = hoy.getFullYear() - nacimiento.getFullYear();
    let meses = hoy.getMonth() - nacimiento.getMonth();
    let dias = hoy.getDate() - nacimiento.getDate();

    if (meses < 0 || (meses === 0 && dias < 0)) {
      años--;
      meses += 12;
    }
    if (dias < 0) {
      meses--;
      dias += new Date(hoy.getFullYear(), hoy.getMonth(), 0).getDate();
    }

    const displayFormat = `${años} años, ${meses} meses, ${dias} días`;
    const dbFormat = `${años} años y ${meses} meses`;

    return { display: displayFormat, dbFormat };
  } catch (error) {
    console.error("Error al calcular la edad:", error);
    return { display: "0 años, 0 meses, 0 días", dbFormat: "0 años y 0 meses" };
  }
};

const SignosVitales = () => {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [patientData, setPatientData] = useState({
    photo: "/user_icon_.png",
    name: "",
    age: "",
    department: "",
    workstation: "",
    grupoNomina: "",
    cuotaSindical: "",
  });
  const [nomina, setNomina] = useState("");
  const [showConsulta, setShowConsulta] = useState(false);
  const [selectedBeneficiaryIndex, setSelectedBeneficiaryIndex] = useState(-1);
  const [signosVitales, setSignosVitales] = useState({
    ta: "",
    temperatura: "",
    fc: "",
    oxigenacion: "",
    altura: "",
    peso: "",
    glucosa: "",
  });
  const [empleadoEncontrado, setEmpleadoEncontrado] = useState(false);

  const [pacientes, setPacientes] = useState([]);
  const [consultasAtendidas, setConsultasAtendidas] = useState([]);
  const [consultaSeleccionada, setConsultaSeleccionada] = useState("empleado");

  const [isSaving, setIsSaving] = useState(false);
  const [beneficiaryData, setBeneficiaryData] = useState([]);

  const handleFaceRecognition = () => {
    router.push("/consultas/face-test");
  };

  const validateBeneficiariesOnLoad = async (beneficiaryData) => {
    if (!beneficiaryData || beneficiaryData.length === 0) {
      return;
    }

    const fechaActual = new Date();
    const beneficiariosValidosConIndice = [];

    beneficiaryData.forEach((beneficiario, index) => {
      if (Number(beneficiario.PARENTESCO) !== 2) {
        beneficiariosValidosConIndice.push({ beneficiario, index });
        return;
      }

      if (beneficiario.F_NACIMIENTO) {
        const [fechaParte] = beneficiario.F_NACIMIENTO.split(" ");
        const nacimiento = new Date(fechaParte);
        const diffMs = fechaActual - nacimiento;
        const edadAnios = new Date(diffMs).getUTCFullYear() - 1970;

        if (edadAnios <= 15) {
          beneficiariosValidosConIndice.push({ beneficiario, index });
          return;
        }

        if (Number(beneficiario.ESDISCAPACITADO) === 0) {
          return;
        }

        if (!beneficiario.URL_INCAP) {
          return;
        }

        if (Number(beneficiario.ESESTUDIANTE) === 0) {
          return;
        }

        if (beneficiario.VIGENCIA_ESTUDIOS) {
          const vigencia = new Date(beneficiario.VIGENCIA_ESTUDIOS);
          if (vigencia.getTime() >= fechaActual.getTime()) {
            beneficiariosValidosConIndice.push({ beneficiario, index });
          }
          return;
        }

        beneficiariosValidosConIndice.push({ beneficiario, index });
      }
    });

    if (beneficiariosValidosConIndice.length === 0) {
      setConsultaSeleccionada("empleado");

      await showCustomAlert(
        "info",
        "Redirección automática",
        "No hay beneficiarios válidos disponibles. Se ha seleccionado automáticamente la consulta para el empleado.",
        "Continuar",
        {
          timer: 2500,
          timerProgressBar: true,
          showConfirmButton: false,
        }
      );
      return;
    }

    const primerValido = beneficiariosValidosConIndice[0];
    setSelectedBeneficiaryIndex(primerValido.index);
    window.beneficiariosValidos = beneficiariosValidosConIndice;
  };

  const handleBeneficiarySelect = async (index) => {
    const selected = beneficiaryData[index];
    const fechaActual = new Date();

    const regresarABeneficiarioValido = () => {
      if (
        window.beneficiariosValidos &&
        window.beneficiariosValidos.length > 0
      ) {
        const primerValido = window.beneficiariosValidos[0];
        setSelectedBeneficiaryIndex(primerValido.index);
      }
    };

    if (Number(selected.PARENTESCO) !== 2) {
      setSelectedBeneficiaryIndex(index);
      return;
    }

    if (selected.F_NACIMIENTO) {
      const [fechaParte] = selected.F_NACIMIENTO.split(" ");
      const nacimiento = new Date(fechaParte);
      const diffMs = fechaActual - nacimiento;
      const edadAnios = new Date(diffMs).getUTCFullYear() - 1970;

      if (edadAnios <= 15) {
        setSelectedBeneficiaryIndex(index);
        return;
      }
    }

    if (Number(selected.ESDISCAPACITADO) === 1) {
      if (!selected.URL_INCAP) {
        showCustomAlert(
          "info",
          "Falta incapacidad",
          `El beneficiario <strong>${selected.NOMBRE} ${selected.A_PATERNO} ${selected.A_MATERNO}</strong> es discapacitado y aún no ha subido su documento de incapacidad.`,
          "Aceptar"
        ).then(() => {
          regresarABeneficiarioValido();
        });
        regresarABeneficiarioValido();
      }
      setSelectedBeneficiaryIndex(index);
      return;
    }

    if (Number(selected.ESESTUDIANTE) === 0) {
      showCustomAlert(
        "error",
        "Datos incompletos",
        `El beneficiario <strong>${selected.NOMBRE} ${selected.A_PATERNO} ${selected.A_MATERNO}</strong> no está registrado como estudiante ni como discapacitado.
        <p style='color: #ffcdd2; font-size: 1em; margin-top: 10px;'>⚠️ Debe completar sus datos en el empadronamiento para tener acceso.</p>`,
        "Entendido"
      ).then(() => {
        regresarABeneficiarioValido();
      });

      regresarABeneficiarioValido();
      return;
    }

    if (selected.VIGENCIA_ESTUDIOS) {
      const vigencia = new Date(selected.VIGENCIA_ESTUDIOS);
      if (vigencia.getTime() < fechaActual.getTime()) {
        await showCustomAlert(
          "warning",
          "Constancia vencida",
          `El beneficiario <strong>${selected.NOMBRE} ${selected.A_PATERNO} ${selected.A_MATERNO}</strong> tiene la constancia de estudios vencida. Se ha regresado al beneficiario válido.`,
          "Aceptar"
        ).then(() => {
          regresarABeneficiarioValido();
        });

        regresarABeneficiarioValido();
        return;
      }
    }

    setSelectedBeneficiaryIndex(index);
  };

  const cargarPacientesDelDia = async () => {
    try {
      const response = await fetch(
        "/api/pacientes-consultas/consultasHoy?clavestatus=1"
      );
      const data = await response.json();

      if (response.ok && data.consultas?.length > 0) {
        const consultasOrdenadas = data.consultas.sort(
          (a, b) => new Date(a.fechaconsulta) - new Date(b.fechaconsulta)
        );

        setPacientes((prevPacientes) => {
          if (
            JSON.stringify(prevPacientes) !== JSON.stringify(consultasOrdenadas)
          ) {
            return consultasOrdenadas;
          }
          return prevPacientes;
        });
      }
    } catch (error) {
      console.error("Error al cargar consultas del día:", error);
    }
  };

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);

    if (!nomina) {
      await showCustomAlert(
        "error",
        "Número de nómina requerido",
        "Por favor, ingresa el número de nómina antes de guardar.",
        "Aceptar"
      );

      setIsSaving(false);
      return;
    }

    const now = new Date();
    const fechaConsulta = `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(
      now.getHours()
    ).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(
      now.getSeconds()
    ).padStart(2, "0")}`;

    const selectedBeneficiary =
      selectedBeneficiaryIndex >= 0
        ? beneficiaryData[selectedBeneficiaryIndex]
        : null;

    const consultaData = {
      fechaconsulta: fechaConsulta,
      clavenomina: nomina,
      presionarterialpaciente: signosVitales.ta,
      temperaturapaciente: signosVitales.temperatura,
      pulsosxminutopaciente: signosVitales.fc,
      respiracionpaciente: signosVitales.oxigenacion,
      estaturapaciente: signosVitales.altura,
      pesopaciente: signosVitales.peso,
      glucosapaciente: signosVitales.glucosa,
      nombrepaciente:
        consultaSeleccionada === "beneficiario" && selectedBeneficiary
          ? `${selectedBeneficiary.NOMBRE} ${selectedBeneficiary.A_PATERNO} ${selectedBeneficiary.A_MATERNO}`
          : patientData.name,
      edad:
        consultaSeleccionada === "beneficiario" && selectedBeneficiary
          ? selectedBeneficiary.EDAD
          : patientData.age,
      elpacienteesempleado: consultaSeleccionada === "empleado" ? "S" : "N",
      parentesco:
        consultaSeleccionada === "beneficiario" && selectedBeneficiary
          ? selectedBeneficiary.ID_PARENTESCO
          : 0,
      clavepaciente:
        consultaSeleccionada === "beneficiario" && selectedBeneficiary
          ? selectedBeneficiary.ID_BENEFICIARIO
          : null,
      departamento: patientData.department || "",
      sindicato:
        patientData.grupoNomina === "NS"
          ? patientData.cuotaSindical === "S"
            ? "SUTSMSJR"
            : patientData.cuotaSindical === ""
            ? "SITAM"
            : null
          : null,
      clavestatus: 1,
    };

    try {
      const response = await fetch("/api/pacientes-consultas/saveConsulta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(consultaData),
      });

      if (response.ok) {
        const responseData = await response.json();

        await showCustomAlert(
          "success",
          "Consulta guardada correctamente",
          "La consulta ha sido registrada y atendida exitosamente.",
          "Aceptar"
        );

        handleCloseModal();
        await cargarPacientesDelDia();
      } else {
        throw new Error("Error al guardar consulta");
      }
    } catch (error) {
      console.error("Error al guardar la consulta:", error);
      await showCustomAlert(
        "error",
        "Error al guardar la consulta",
        "Hubo un problema al intentar guardar la consulta. Por favor, intenta nuevamente.",
        "Aceptar"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleAdd = () => {
    setShowConsulta(true);
    setPatientData({
      photo: "/user_icon_.png",
      name: "",
      age: "",
      department: "",
      workstation: "",
      grupoNomina: "",
      cuotaSindical: "",
    });
    setSignosVitales({
      ta: "",
      temperatura: "",
      fc: "",
      oxigenacion: "",
      altura: "",
      peso: "",
      glucosa: "",
    });
    setNomina("");
    setEmpleadoEncontrado(false);
    setBeneficiaryData([]);
    setSelectedBeneficiaryIndex(-1);
  };

  const handleRadioChange = (value) => {
    setConsultaSeleccionada(value);
    if (value === "beneficiario") {
      handleSearchBeneficiary();
    } else {
      setBeneficiaryData([]);
      setSelectedBeneficiaryIndex(-1);
    }
  };

  const handleCloseModal = () => {
    setShowConsulta(false);
  };

  const handleSearch = async () => {
    try {
      const response = await fetch("/api/empleado", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ num_nom: nomina }),
      });

      const data = await response.json();

      if (
        !data ||
        Object.keys(data).length === 0 ||
        !data.nombre ||
        !data.departamento
      ) {
        await showCustomAlert(
          "error",
          "Nómina no encontrada",
          "El número de nómina ingresado no existe o no se encuentra en el sistema. Intenta nuevamente.",
          "Aceptar"
        );

        setEmpleadoEncontrado(false);
        setShowConsulta(false);
        return;
      }

      const { display } = data.fecha_nacimiento
        ? calcularEdad(data.fecha_nacimiento)
        : { display: "0 años, 0 meses, 0 días" };

      setPatientData({
        photo: "/user_icon_.png",
        name: `${data.nombre ?? ""} ${data.a_paterno ?? ""} ${
          data.a_materno ?? ""
        }`,
        age: display,
        department: data.departamento ?? "",
        workstation: data.puesto ?? "",
        grupoNomina: data.grupoNomina ?? "",
        cuotaSindical: data.cuotaSindical ?? "",
        fecha_nacimiento: data.fecha_nacimiento,
      });

      setEmpleadoEncontrado(true);
    } catch (error) {
      console.error("Error al obtener datos del empleado:", error);
      await showCustomAlert(
        "error",
        "Error al buscar la nómina",
        "Hubo un problema al buscar la nómina. Intenta nuevamente.",
        "Aceptar"
      );

      setEmpleadoEncontrado(false);
      setShowConsulta(false);
    }
  };

  const handleSearchBeneficiary = async () => {
    try {
      const response = await fetch("/api/beneficiarios/beneficiario", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nomina }),
      });

      const data = await response.json();

      if (data.beneficiarios && data.beneficiarios.length > 0) {
        setBeneficiaryData(data.beneficiarios);
        validateBeneficiariesOnLoad(data.beneficiarios);
      } else {
        setBeneficiaryData([]);
        setConsultaSeleccionada("empleado");
        await showCustomAlert(
          "info",
          "Sin beneficiarios",
          "Este empleado no tiene beneficiarios validos registrados en el sistema.",
          "Aceptar"
        );
      }
    } catch (error) {
      console.error("Error al buscar beneficiarios:", error);
    }
  };

  const handleVitalChange = (e) => {
    const { name, value } = e.target;
    setSignosVitales((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  useEffect(() => {
    cargarPacientesDelDia();
  }, []);

  useEffect(() => {
    const user = Cookies.get("nombreusuario") || "Enfermer@";
    setUsername(user);
  }, []);

  useEffect(() => {
    if (consultaSeleccionada === "beneficiario") {
      validateBeneficiariesOnLoad(beneficiaryData);
    }
  }, [beneficiaryData]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-black text-white">
      <header className="relative">
        <div
          className="
      absolute top-4 right-4
      flex items-center
      px-6 py-3 md:px-8 md:py-4
      rounded-lg
      text-white font-medium text-sm md:text-lg
      bg-gradient-to-r from-[#890677] via-[#075e85] to-[#890677]
      shadow-md
      backdrop-blur-sm
      border border-white/20
    "
        >
          <Stethoscope className="mr-2 h-6 w-6" />
          Bienvenid@ {username}
        </div>
      </header>

      <header className="px-4 py-4 md:px-12 flex items-center">
        <Link href="/inicio-servicio-medico">
          <button className="flex items-center px-4 py-2 bg-gradient-to-r from-[#00ffee] to-[#ec0dea] hover:from-[#00d9c1] hover:to-[#e600b8] rounded-full text-white font-semibold shadow-lg shadow-teal-500/50 transition-all duration-300 transform hover:scale-105 hover:rotate-1 active:scale-95 focus:outline-none focus:ring-2 focus:ring-teal-400">
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Regresar
          </button>
        </Link>
      </header>

      <main className="px-4 py-8 md:px-12 flex flex-col items-center">
        <div className="flex flex-col items-center">
          <Image
            src="/estetoscopio.png"
            alt="Estetoscopio"
            width={160}
            height={160}
            className="h-24 w-24 md:h-40 md:w-40 object-cover rounded-full bg-gray-600"
          />
          <h1 className="mt-4 text-3xl md:text-5xl font-extrabold text-center">
            Registro de Pacientes
          </h1>
        </div>

        <div className="mt-8 flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
          <button
            onClick={handleAdd}
            className="flex items-center justify-center px-6 py-3 md:px-8 md:py-4 rounded-full text-white font-bold text-sm md:text-lg uppercase bg-gradient-to-r from-[#6b00ff] via-[#b400ff] to-[#ff00ff] shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl focus:outline-none"
          >
            <svg
              className="w-6 h-6 text-white animate-pulse mr-2"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16 11c2.485 0 4.5-2.015 4.5-4.5S18.485 2 16 2s-4.5 2.015-4.5 4.5S13.515 11 16 11zM6 20h16a1 1 0 001-1v-1c0-2.5-3-5-8-5s-8 2.5-8 5v1a1 1 0 001 1z"
              />
            </svg>
            Agregar Paciente Por Nómina
          </button>

          <button
            onClick={handleFaceRecognition}
            className="flex items-center justify-center px-6 py-3 md:px-8 md:py-4 rounded-full text-white font-bold text-sm md:text-lg uppercase bg-gradient-to-r from-[#00ff87] via-[#00d4ff] to-[#0095ff] shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl focus:outline-none"
          >
            <svg
              className="w-6 h-6 text-white animate-spin-slow mr-2"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 3h6v6H3zM15 3h6v6h-6zM3 15h6v6H3zM15 15h6v6h-6zM9 9h6v6H9z"
              />
            </svg>
            Agregar Paciente Por Escaneo Facial
          </button>
        </div>
      </main>

      <div className="w-full space-y-8">
        <div className="w-full overflow-x-auto p-6 bg-gradient-to-b from-gray-900 to-gray-800 rounded-xl shadow-lg mb-8">
          <h1 className="text-3xl font-bold mb-6 text-center text-yellow-300 tracking-wide">
            Pacientes en Lista de Espera
          </h1>
          <table className="min-w-full text-gray-300 border-separate border-spacing-y-3">
            <thead>
              <tr className="bg-gray-800 bg-opacity-80 text-sm uppercase tracking-wider font-semibold">
                <th className="py-4 px-6 rounded-l-lg">Número de Nómina</th>
                <th className="py-4 px-6">Paciente</th>
                <th className="py-4 px-6">Edad</th>
                <th className="py-4 px-6 rounded-r-lg">Secretaría</th>
              </tr>
            </thead>
            <tbody>
              {pacientes.length > 0 ? (
                pacientes.map((paciente, index) => (
                  <tr
                    key={index}
                    className="bg-gray-700 bg-opacity-50 hover:bg-gradient-to-r from-yellow-500 to-yellow-700 transition duration-300 ease-in-out rounded-lg shadow-md"
                  >
                    <td className="py-4 px-6 font-medium text-center">
                      {paciente.clavenomina || "N/A"}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {paciente.nombrepaciente || "No disponible"}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {paciente.edad || "Desconocida"}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {paciente.departamento || "No asignado"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-gray-400">
                    No hay consultas para el día de hoy.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="w-full overflow-x-auto p-6 bg-gradient-to-b from-gray-900 to-gray-800 rounded-xl shadow-lg mb-8">
          <ConsultasAtendidas data={consultasAtendidas} />
        </div>
      </div>

      <ModalConsulta
        showConsulta={showConsulta}
        handleCloseModal={handleCloseModal}
        nomina={nomina}
        setNomina={setNomina}
        handleSearch={handleSearch}
        empleadoEncontrado={empleadoEncontrado}
        consultaSeleccionada={consultaSeleccionada}
        handleRadioChange={handleRadioChange}
        beneficiaryData={beneficiaryData}
        selectedBeneficiaryIndex={selectedBeneficiaryIndex}
        handleBeneficiarySelect={handleBeneficiarySelect}
        patientData={patientData}
        signosVitales={signosVitales}
        handleVitalChange={handleVitalChange}
        handleSave={handleSave}
        isSaving={isSaving}
      />
    </div>
  );
};

export default SignosVitales;
