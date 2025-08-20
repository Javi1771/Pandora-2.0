import React from "react";
import Select, { createFilter } from "react-select";
import { showCustomAlert } from "../../../utils/alertas";

const customStyles = {
  control: (provided, state) => ({
    ...provided,
    backgroundColor: "#FFFFFF",
    border: state.isFocused ? "1px solid #C7D2FE" : "1px solid #D1D5DB", //* indigo-200 / gray-300
    borderRadius: "0.75rem", //* rounded-xl
    minHeight: "3rem",
    padding: "0.25rem 0.25rem",
    boxShadow: state.isFocused ? "0 0 0 3px rgba(79,70,229,0.25)" : "none", //* ring-indigo-600/25
    fontSize: "1rem",
    color: "#111827",
    transition: "box-shadow .15s ease, border-color .15s ease",
  }),
  valueContainer: (provided) => ({
    ...provided,
    padding: "0 0.75rem",
  }),
  indicatorsContainer: (provided) => ({
    ...provided,
    paddingRight: "0.25rem",
  }),
  indicatorSeparator: () => ({
    display: "none",
  }),
  dropdownIndicator: (provided, state) => ({
    ...provided,
    color: state.isFocused ? "#4F46E5" : "#6B7280", //* indigo-600 / gray-500
    ":hover": { color: "#4F46E5" },
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: "#FFFFFF",
    borderRadius: "0.75rem",
    overflow: "hidden",
    boxShadow:
      "0 10px 15px -3px rgba(0,0,0,0.15), 0 4px 6px -4px rgba(0,0,0,0.1)",
    border: "1px solid #E5E7EB",
    marginTop: "6px",
  }),
  menuList: (provided) => ({
    ...provided,
    padding: 0,
    maxHeight: 260,
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? "rgba(79,70,229,0.1)" //* indigo-600/10
      : state.isFocused
      ? "rgba(99,102,241,0.08)" //* indigo-500/8
      : "#FFFFFF",
    color: state.data && state.data.isDisabled ? "#9CA3AF" : "#111827",
    padding: "0.625rem 0.875rem",
    cursor:
      state.data && state.data.isDisabled ? "not-allowed" : "pointer",
    opacity: state.data && state.data.isDisabled ? 0.6 : 1,
  }),
  placeholder: (provided) => ({
    ...provided,
    color: "#6B7280",
  }),
  singleValue: (provided) => ({
    ...provided,
    color: "#111827",
  }),
  input: (provided) => ({
    ...provided,
    color: "#111827",
  }),
};

export default function MedicamentoDropdown({
  listaMedicamentos = [],
  value,
  onChangeMedicamento,
  isLoading = false,
  playSound, //* opcional (llega desde el padre)
}) {
  //* Aseguramos arreglo
  const medicamentosArray = Array.isArray(listaMedicamentos)
    ? listaMedicamentos
    : [];

  //* Opciones para react-select
  const opcionesMedicamentos = medicamentosArray.map((m) => ({
    value: m.CLAVEMEDICAMENTO,
    label: `${m.MEDICAMENTO} — Presentación: ${
      m.presentacion || "Sin existencias"
    } — Cajas: ${m.piezas > 0 ? m.piezas : "Sin existencias"}`,
    isDisabled: false, //* ver notas originales
    data: m,
  }));

  //* Placeholder + opciones
  const opcionesConPlaceholder = [
    { value: "", label: "Seleccionar Medicamento", isDisabled: true },
    ...opcionesMedicamentos,
  ];

  //* Valor seleccionado
  const opcionSeleccionada = value
    ? opcionesMedicamentos.find((opt) => opt.value === value)
    : opcionesConPlaceholder[0];

  //* Cambio de selección (con alerta global)
  const handleChange = async (selectedOption) => {
    if (!selectedOption) return;
    if (selectedOption.value === "") return;

    const selectedMedicamento = selectedOption.data;

    //* Validaciones (con sonido opcional y alerta global)
    if (
      selectedMedicamento.piezas <= 0 ||
      selectedMedicamento.presentacion <= 0 ||
      selectedMedicamento.clasificacion === null
    ) {
      if (typeof playSound === "function") playSound(false);

      const motivo =
        selectedMedicamento.clasificacion === null
          ? "Este medicamento no tiene clasificación asignada."
          : "Este medicamento no tiene existencias en farmacia.";

      await showCustomAlert(
        "error",
        "No disponible",
        motivo,
        "Aceptar"
      );
      return;
    }

    if (typeof playSound === "function") playSound(true);
    onChangeMedicamento(selectedMedicamento.CLAVEMEDICAMENTO);
  };

  //* Formato visual de cada opción (nombre + chips de disponibilidad)
  const formatOptionLabel = (option) => {
    if (!option.data) return option.label;
    const m = option.data;
    const disponible = m.piezas > 0 && m.presentacion > 0;

    return (
      <div style={{ display: "grid", gap: 4 }}>
        <div
          style={{
            fontWeight: 600,
            fontSize: ".95rem",
            lineHeight: 1.2,
            color: "#111827",
          }}
        >
          {m.MEDICAMENTO}
        </div>
        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            alignItems: "center",
            fontSize: ".8rem",
            color: "#374151",
          }}
        >
          <span
            style={{
              padding: "2px 8px",
              borderRadius: 9999,
              background: "#EEF2FF", //* indigo-50
              color: "#4338CA", //* indigo-700
              border: "1px solid #E0E7FF", //* indigo-100
            }}
          >
            Presentación: {m.presentacion || "—"}
          </span>
          <span
            style={{
              padding: "2px 8px",
              borderRadius: 9999,
              background: disponible ? "#ECFDF5" : "#FEF2F2", //* emerald-50 / rose-50
              color: disponible ? "#065F46" : "#B91C1C", //* emerald-800 / rose-700
              border: `1px solid ${disponible ? "#D1FAE5" : "#FEE2E2"}`, //* emerald-100 / rose-100
            }}
          >
            {disponible ? `Cajas: ${m.piezas}` : "Sin existencias"}
          </span>
        </div>
      </div>
    );
  };

  return (
    <Select
      className="w-full"
      classNamePrefix="react-select"
      styles={customStyles}
      options={opcionesConPlaceholder}
      value={opcionSeleccionada}
      onChange={handleChange}
      placeholder="Seleccionar Medicamento"
      isSearchable
      isOptionDisabled={(option) => option.isDisabled}
      filterOption={createFilter({ matchFrom: "any" })}
      isLoading={isLoading || medicamentosArray.length === 0}
      loadingMessage={() => "Cargando medicamentos..."}
      noOptionsMessage={() => "Sin resultados"}
      formatOptionLabel={formatOptionLabel}
      theme={(theme) => ({
        ...theme,
        borderRadius: 12,
        colors: {
          ...theme.colors,
          primary: "#4F46E5", //* indigo-600
          primary25: "rgba(79,70,229,0.08)",
          neutral20: "#D1D5DB",
          neutral30: "#C7D2FE",
          neutral40: "#4F46E5",
          neutral50: "#6B7280",
          neutral60: "#4F46E5",
          neutral80: "#111827",
        },
      })}
    />
  );
}
