// components/ModalConsulta.js
import React from "react";
import Image from "next/image";
import {
  FaUser,
  FaBirthdayCake,
  FaIdCard,
  FaBuilding,
  FaUsers,
  FaHeartbeat,
  FaTemperatureHigh,
  FaTint,
  FaRuler,
  FaWeight,
  FaNotesMedical,
  FaTimes,
  FaSearch,
  FaSave
} from "react-icons/fa";

const ModalConsulta = ({
  showConsulta,
  handleCloseModal,
  nomina,
  setNomina,
  handleSearch,
  empleadoEncontrado,
  consultaSeleccionada,
  handleRadioChange,
  beneficiaryData,
  selectedBeneficiaryIndex,
  handleBeneficiarySelect,
  patientData,
  signosVitales,
  handleVitalChange,
  handleSave,
  isSaving,
}) => {
  if (!showConsulta) return null;

  //* Paleta de colores mejorada con más contraste
  const colors = {
    deepBlack: "#111111",
    richBlack: "#1A1D21",
    darkGray: "#22272A",
    mediumGray: "#2D3339",
    lightGray: "#3E474C",
    softGray: "#516269",
    silverGray: "#CAD4D7",
    pureWhite: "#FFFFFF",
    accentBlue: "#667E85",
    lightBlue: "#8DA1A8",
  };

  return (
    <div className="fixed inset-0 bg-[#0A0A0A] bg-opacity-65 flex items-center justify-center z-50 p-6">
      <div 
        className="bg-[#1A1D21] rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative"
        style={{
          boxShadow: "0 15px 50px rgba(0, 0, 0, 0.5)",
          border: `1px solid ${colors.mediumGray}`
        }}
      >
        {/* Encabezado con negro profundo */}
        <div 
          className="sticky top-0 z-10 bg-[#111111] py-5 px-6 flex justify-between items-center border-b"
          style={{ borderColor: colors.accentBlue }}
        >
          <div>
            <h2 className="text-xl font-bold text-[#FFFFFF]">
              Registro de Consulta
            </h2>
            <p className="text-sm text-[#8DA1A8]">
              Fecha: {new Date().toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={handleCloseModal}
            className="text-[#8DA1A8] hover:text-[#FFFFFF] transition-colors"
          >
            <FaTimes size={20} />
          </button>
        </div>
        
        {/* Cuerpo del modal */}
        <div className="p-6">
          {/* Búsqueda de nómina */}
          <div className="mb-8">
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <label className="block text-[#CAD4D7] text-sm font-medium mb-2">
                  Número de Nómina
                </label>
                <input
                  type="text"
                  value={nomina}
                  onChange={(e) => setNomina(e.target.value.toUpperCase())}
                  placeholder="Ingrese número de nómina"
                  className="w-full p-3.5 rounded-lg bg-[#22272A] text-[#FFFFFF] border border-[#2D3339] focus:outline-none focus:border-[#667E85] transition duration-300"
                />
              </div>
              <button
                onClick={handleSearch}
                className="flex items-center gap-2 bg-[#667E85] hover:bg-[#5a6f76] px-5 py-3.5 rounded-lg transition duration-300 text-[#FFFFFF] font-medium h-[44px]"
                style={{ boxShadow: "0 4px 6px rgba(0, 0, 0, 0.2)" }}
              >
                <FaSearch className="text-[#FFFFFF]" /> Buscar
              </button>
            </div>
          </div>

          <fieldset
            disabled={!empleadoEncontrado}
            className={!empleadoEncontrado ? "opacity-50" : ""}
          >
            {/* Selección de tipo de consulta */}
            <div 
              className="bg-[#22272A] rounded-xl p-6 mb-8 border"
              style={{ borderColor: colors.mediumGray }}
            >
              <h3 className="text-lg font-semibold text-[#FFFFFF] mb-5 flex items-center">
                <span className="bg-[#667E85] w-6 h-6 rounded-full flex items-center justify-center mr-3">
                  <span className="text-[#1A1D21] text-sm">1</span>
                </span>
                ¿Quién va a consulta?
              </h3>
              
              <div className="flex flex-wrap gap-5">
                <label
                  className={`flex-1 min-w-[200px] cursor-pointer p-5 rounded-xl transition-all duration-300 ${
                    consultaSeleccionada === "empleado" 
                      ? "bg-[#2D3339] border border-[#667E85] shadow-[0_0_0_2px_#667E85]" 
                      : "bg-[#22272A] hover:bg-[#2D3339] border border-[#3E474C]"
                  }`}
                >
                  <div className="flex items-start">
                    <input
                      type="radio"
                      name="consulta"
                      value="empleado"
                      className="form-radio mt-1 h-5 w-5 text-[#667E85] focus:ring-[#667E85]"
                      checked={consultaSeleccionada === "empleado"}
                      onChange={() => handleRadioChange("empleado")}
                      disabled={!empleadoEncontrado}
                    />
                    <div className="ml-3">
                      <span className="block text-[#FFFFFF] font-medium flex items-center">
                        <span className="text-[#667E85] mr-2">
                          👔
                        </span>
                        Empleado
                      </span>
                      <p className="text-sm text-[#8DA1A8] mt-1">
                        Registro para el titular de la nómina
                      </p>
                    </div>
                  </div>
                </label>

                <label
                  className={`flex-1 min-w-[200px] cursor-pointer p-5 rounded-xl transition-all duration-300 ${
                    consultaSeleccionada === "beneficiario" 
                      ? "bg-[#2D3339] border border-[#667E85] shadow-[0_0_0_2px_#667E85]" 
                      : "bg-[#22272A] hover:bg-[#2D3339] border border-[#3E474C]"
                  }`}
                >
                  <div className="flex items-start">
                    <input
                      type="radio"
                      name="consulta"
                      value="beneficiario"
                      className="form-radio mt-1 h-5 w-5 text-[#667E85] focus:ring-[#667E85]"
                      checked={consultaSeleccionada === "beneficiario"}
                      onChange={() => handleRadioChange("beneficiario")}
                      disabled={!empleadoEncontrado}
                    />
                    <div className="ml-3">
                      <span className="block text-[#FFFFFF] font-medium flex items-center">
                        <span className="text-[#667E85] mr-2">
                          👨‍👩‍👧‍👦
                        </span>
                        Beneficiario
                      </span>
                      <p className="text-sm text-[#8DA1A8] mt-1">
                        Registro para un familiar del empleado
                      </p>
                    </div>
                  </div>
                </label>
              </div>
            </div>
            
            {/* Selector de beneficiario */}
            {consultaSeleccionada === "beneficiario" && beneficiaryData?.length > 0 && (
              <div 
                className="bg-[#22272A] rounded-xl p-6 mb-8 border"
                style={{ borderColor: colors.mediumGray }}
              >
                <h3 className="text-lg font-semibold text-[#FFFFFF] mb-5 flex items-center">
                  <span className="bg-[#667E85] w-6 h-6 rounded-full flex items-center justify-center mr-3">
                    <span className="text-[#1A1D21] text-sm">2</span>
                  </span>
                  Seleccionar Beneficiario
                </h3>
                <select
                  value={selectedBeneficiaryIndex}
                  onChange={(e) => handleBeneficiarySelect(parseInt(e.target.value))}
                  className="w-full p-3.5 rounded-lg bg-[#2D3339] text-[#FFFFFF] border border-[#3E474C] focus:outline-none focus:border-[#667E85]"
                >
                  {beneficiaryData.map((beneficiary, index) => (
                    <option key={index} value={index}>
                      {`${beneficiary.NOMBRE} ${beneficiary.A_PATERNO} ${beneficiary.A_MATERNO} - ${beneficiary.PARENTESCO_DESC}`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Información del paciente */}
            <div 
              className="bg-[#22272A] rounded-xl p-6 mb-8 border"
              style={{ borderColor: colors.mediumGray }}
            >
              <h3 className="text-lg font-semibold text-[#FFFFFF] mb-5 flex items-center">
                <span className="bg-[#667E85] w-6 h-6 rounded-full flex items-center justify-center mr-3">
                  <span className="text-[#1A1D21] text-sm">3</span>
                </span>
                Información del Paciente
              </h3>
              
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0 flex justify-center">
                  <div className="relative">
                    {consultaSeleccionada === "beneficiario" && selectedBeneficiaryIndex >= 0 ? (
                      <div className="relative">
                        <Image
                          src={beneficiaryData[selectedBeneficiaryIndex].FOTO_URL || "/user_icon_.png"}
                          alt="Foto del Beneficiario"
                          width={140}
                          height={140}
                          className="w-28 h-28 md:w-36 md:h-36 rounded-full border-2 border-[#667E85] object-cover"
                        />
                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-[#667E85] text-[#1A1D21] text-xs px-3 py-1 rounded-full font-medium">
                          Beneficiario
                        </div>
                      </div>
                    ) : (
                      <div className="relative">
                        <Image
                          src={patientData.photo}
                          alt="Foto del Empleado"
                          width={140}
                          height={140}
                          className="w-28 h-28 md:w-36 md:h-36 rounded-full border-2 border-[#667E85] object-cover"
                        />
                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-[#667E85] text-[#1A1D21] text-xs px-3 py-1 rounded-full font-medium">
                          Empleado
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-[#2D3339] p-4 rounded-lg border border-[#3E474C]">
                      <p className="flex items-center text-[#8DA1A8] mb-2 text-sm">
                        <FaUser className="mr-2 text-[#667E85]" />
                        Paciente
                      </p>
                      <p className="text-[#FFFFFF] font-medium">
                        {consultaSeleccionada === "beneficiario" && selectedBeneficiaryIndex >= 0
                          ? `${beneficiaryData[selectedBeneficiaryIndex].NOMBRE} ${beneficiaryData[selectedBeneficiaryIndex].A_PATERNO} ${beneficiaryData[selectedBeneficiaryIndex].A_MATERNO}`
                          : patientData.name || "No disponible"}
                      </p>
                    </div>

                    <div className="bg-[#2D3339] p-4 rounded-lg border border-[#3E474C]">
                      <p className="flex items-center text-[#8DA1A8] mb-2 text-sm">
                        <FaBirthdayCake className="mr-2 text-[#667E85]" />
                        Edad
                      </p>
                      <p className="text-[#FFFFFF] font-medium">
                        {consultaSeleccionada === "beneficiario" && selectedBeneficiaryIndex >= 0
                          ? beneficiaryData[selectedBeneficiaryIndex].EDAD
                          : patientData.age || "No disponible"}
                      </p>
                    </div>

                    {consultaSeleccionada === "empleado" && (
                      <>
                        <div className="bg-[#2D3339] p-4 rounded-lg border border-[#3E474C]">
                          <p className="flex items-center text-[#8DA1A8] mb-2 text-sm">
                            <FaBuilding className="mr-2 text-[#667E85]" />
                            Puesto
                          </p>
                          <p className="text-[#FFFFFF] font-medium">
                            {patientData.workstation || "No disponible"}
                          </p>
                        </div>
                        <div className="bg-[#2D3339] p-4 rounded-lg border border-[#3E474C]">
                          <p className="flex items-center text-[#8DA1A8] mb-2 text-sm">
                            <FaIdCard className="mr-2 text-[#667E85]" />
                            Departamento
                          </p>
                          <p className="text-[#FFFFFF] font-medium">
                            {patientData.department || "No disponible"}
                          </p>
                        </div>
                      </>
                    )}

                    {consultaSeleccionada === "beneficiario" && selectedBeneficiaryIndex >= 0 && (
                      <div className="bg-[#2D3339] p-4 rounded-lg border border-[#3E474C]">
                        <p className="flex items-center text-[#8DA1A8] mb-2 text-sm">
                          <FaUsers className="mr-2 text-[#667E85]" />
                          Parentesco
                        </p>
                        <p className="text-[#FFFFFF] font-medium">
                          {beneficiaryData[selectedBeneficiaryIndex].PARENTESCO_DESC || "No disponible"}
                        </p>
                      </div>
                    )}
                  </div>

                  {patientData.grupoNomina === "NS" && (
                    <div className="mt-4 p-4 rounded-lg bg-[#2D3339] border border-[#3E474C]">
                      <div className="flex items-center">
                        <div className="bg-[#667E85] w-8 h-8 rounded-full flex items-center justify-center mr-3">
                          <span className="text-[#1A1D21] font-bold text-sm">!</span>
                        </div>
                        <div>
                          <p className="text-[#667E85] font-semibold">
                            SINDICALIZADO
                          </p>
                          <p className="text-[#FFFFFF]">
                            Sindicato:{" "}
                            <span className="font-medium">
                              {patientData.cuotaSindical === "S"
                                ? "SUTSMSJR"
                                : patientData.cuotaSindical === ""
                                ? "SITAM"
                                : "No afiliado"}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Signos vitales */}
            <div 
              className="bg-[#22272A] rounded-xl p-6 border"
              style={{ borderColor: colors.mediumGray }}
            >
              <h3 className="text-lg font-semibold text-[#FFFFFF] mb-5 flex items-center">
                <span className="bg-[#667E85] w-6 h-6 rounded-full flex items-center justify-center mr-3">
                  <span className="text-[#1A1D21] text-sm">4</span>
                </span>
                Signos Vitales
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#2D3339] p-4 rounded-lg border border-[#3E474C]">
                  <p className="flex items-center text-[#8DA1A8] mb-2 text-sm">
                    <FaHeartbeat className="mr-2 text-[#667E85]" />
                    Tensión Arterial
                  </p>
                  <input
                    type="text"
                    name="ta"
                    value={signosVitales.ta}
                    onChange={handleVitalChange}
                    className="w-full p-3 rounded bg-[#22272A] text-[#FFFFFF] border border-[#3E474C] focus:outline-none focus:border-[#667E85]"
                    placeholder="Ej: 120/80"
                  />
                </div>

                <div className="bg-[#2D3339] p-4 rounded-lg border border-[#3E474C]">
                  <p className="flex items-center text-[#8DA1A8] mb-2 text-sm">
                    <FaTemperatureHigh className="mr-2 text-[#667E85]" />
                    Temperatura (°C)
                  </p>
                  <input
                    type="number"
                    name="temperatura"
                    value={signosVitales.temperatura}
                    onChange={handleVitalChange}
                    className="w-full p-3 rounded bg-[#22272A] text-[#FFFFFF] border border-[#3E474C] focus:outline-none focus:border-[#667E85]"
                    placeholder="Ej: 36.5"
                  />
                </div>

                <div className="bg-[#2D3339] p-4 rounded-lg border border-[#3E474C]">
                  <p className="flex items-center text-[#8DA1A8] mb-2 text-sm">
                    <FaHeartbeat className="mr-2 text-[#667E85]" />
                    Frecuencia Cardíaca (bpm)
                  </p>
                  <input
                    type="number"
                    name="fc"
                    value={signosVitales.fc}
                    onChange={handleVitalChange}
                    className="w-full p-3 rounded bg-[#22272A] text-[#FFFFFF] border border-[#3E474C] focus:outline-none focus:border-[#667E85]"
                    placeholder="Ej: 75"
                  />
                </div>

                <div className="bg-[#2D3339] p-4 rounded-lg border border-[#3E474C]">
                  <p className="flex items-center text-[#8DA1A8] mb-2 text-sm">
                    <FaTint className="mr-2 text-[#667E85]" />
                    Oxigenación (%)
                  </p>
                  <input
                    type="number"
                    name="oxigenacion"
                    value={signosVitales.oxigenacion}
                    onChange={handleVitalChange}
                    className="w-full p-3 rounded bg-[#22272A] text-[#FFFFFF] border border-[#3E474C] focus:outline-none focus:border-[#667E85]"
                    placeholder="Ej: 98"
                  />
                </div>

                <div className="bg-[#2D3339] p-4 rounded-lg border border-[#3E474C]">
                  <p className="flex items-center text-[#8DA1A8] mb-2 text-sm">
                    <FaRuler className="mr-2 text-[#667E85]" />
                    Altura (cm)
                  </p>
                  <input
                    type="number"
                    name="altura"
                    value={signosVitales.altura}
                    onChange={handleVitalChange}
                    className="w-full p-3 rounded bg-[#22272A] text-[#FFFFFF] border border-[#3E474C] focus:outline-none focus:border-[#667E85]"
                    placeholder="Ej: 175"
                  />
                </div>

                <div className="bg-[#2D3339] p-4 rounded-lg border border-[#3E474C]">
                  <p className="flex items-center text-[#8DA1A8] mb-2 text-sm">
                    <FaWeight className="mr-2 text-[#667E85]" />
                    Peso (kg)
                  </p>
                  <input
                    type="number"
                    name="peso"
                    value={signosVitales.peso}
                    onChange={handleVitalChange}
                    className="w-full p-3 rounded bg-[#22272A] text-[#FFFFFF] border border-[#3E474C] focus:outline-none focus:border-[#667E85]"
                    placeholder="Ej: 70"
                  />
                </div>

                <div className="bg-[#2D3339] p-4 rounded-lg border border-[#3E474C] md:col-span-2">
                  <p className="flex items-center text-[#8DA1A8] mb-2 text-sm">
                    <FaNotesMedical className="mr-2 text-[#667E85]" />
                    Glucosa (mg/dL)
                  </p>
                  <input
                    type="number"
                    name="glucosa"
                    value={signosVitales.glucosa}
                    onChange={handleVitalChange}
                    className="w-full p-3 rounded bg-[#22272A] text-[#FFFFFF] border border-[#3E474C] focus:outline-none focus:border-[#667E85]"
                    placeholder="Ej: 90"
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-center">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className={`px-8 py-4 rounded-xl font-medium text-[#FFFFFF] transition-all duration-300 flex items-center gap-3 ${
                    !isSaving 
                      ? "bg-[#667E85] hover:bg-[#5a6f76] hover:shadow-lg" 
                      : "bg-[#516269] cursor-not-allowed"
                  }`}
                  style={{ minWidth: "280px" }}
                >
                  {isSaving ? (
                    <>
                      <div className="border-t-2 border-r-2 border-[#FFFFFF] rounded-full w-5 h-5 animate-spin"></div>
                      <span>Guardando datos...</span>
                    </>
                  ) : (
                    <>
                      <FaSave className="text-[#FFFFFF]" />
                      <span>Guardar Signos Vitales</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </fieldset>
        </div>
      </div>
    </div>
  );
};

export default ModalConsulta;