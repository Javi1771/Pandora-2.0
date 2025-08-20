import React from "react";
import Select, { createFilter, components as RSComponents } from "react-select";

//* Chevron minimalista para el indicador del dropdown
const DropdownIndicator = (props) => (
  <RSComponents.DropdownIndicator {...props}>
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 9l6 6 6-6" fill="none" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  </RSComponents.DropdownIndicator>
);

//* Ocultamos la barra separadora de indicadores
const IndicatorSeparator = () => null;

const customStyles = {
  control: (provided, state) => ({
    ...provided,
    backgroundColor: "#FFFFFF",
    border: state.isFocused ? "1px solid #A5B4FC" : "1px solid #E5E7EB", //* gray-200 / indigo-300
    borderRadius: "0.75rem", //* rounded-xl
    minHeight: "2.75rem",
    padding: "0 0.25rem",
    boxShadow: state.isFocused ? "0 0 0 4px rgba(99,102,241,.15)" : "none", //* ring-indigo-500/15
    transition: "border-color 120ms, box-shadow 120ms",
    cursor: "pointer",
  }),
  valueContainer: (provided) => ({
    ...provided,
    padding: "0 0.5rem",
    color: "#111827", //* gray-900
  }),
  placeholder: (provided) => ({
    ...provided,
    color: "#9CA3AF", //* gray-400
  }),
  singleValue: (provided) => ({
    ...provided,
    color: "#111827", //* gray-900
    fontWeight: 600,
  }),
  input: (provided) => ({
    ...provided,
    color: "#111827",
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: "#FFFFFF",
    borderRadius: "0.75rem",
    border: "1px solid #E5E7EB",
    overflow: "hidden",
    boxShadow:
      "0 10px 15px -3px rgba(0,0,0,.1), 0 4px 6px -4px rgba(0,0,0,.1)", //* shadow-lg
    marginTop: 8,
  }),
  menuList: (provided) => ({
    ...provided,
    padding: 0,
    maxHeight: 260,
  }),
  option: (provided, state) => {
    const isSel = state.isSelected;
    const isFocus = state.isFocused;
    return {
      ...provided,
      background:
        isSel
          ? "linear-gradient(135deg,#EEF2FF,#EDE9FE)" //* indigo-50 -> violet-50
          : isFocus
          ? "linear-gradient(135deg,#F5F3FF,#EEF2FF)" //* violet-50 -> indigo-50
          : "#FFFFFF",
      color: isSel ? "#3730A3" : "#1F2937", //* indigo-800 : gray-800
      padding: "0.625rem 0.875rem",
      cursor: "pointer",
    };
  },
  noOptionsMessage: (provided) => ({
    ...provided,
    color: "#6B7280", //* gray-500
    padding: "0.75rem",
  }),
  dropdownIndicator: (provided, state) => ({
    ...provided,
    padding: "0.25rem 0.5rem",
    transition: "transform 120ms",
    transform: state.selectProps.menuIsOpen ? "rotate(180deg)" : "none",
  }),
  clearIndicator: (provided) => ({
    ...provided,
    padding: "0.25rem 0.5rem",
  }),
};

const EspecialidadDropdown = ({ especialidades = [], value, onChange }) => {
  //? 1) Excluir la especialidad 38 y luego mapear
  const opcionesEspecialidades = (Array.isArray(especialidades) ? especialidades : [])
    .filter((esp) => esp.claveespecialidad !== 38)
    .map((esp) => ({
      value: esp.claveespecialidad,
      label: esp.especialidad,
      data: esp,
    }));

  //? 2) Placeholder
  const opcionesConPlaceholder = [
    { value: "", label: "Seleccionar Especialidad", isDisabled: true },
    ...opcionesEspecialidades,
  ];

  //? 3) Opción seleccionada
  const opcionSeleccionada = value
    ? opcionesEspecialidades.find((opt) => opt.value === value)
    : opcionesConPlaceholder[0];

  const handleChange = (selectedOption) => {
    if (!selectedOption || selectedOption.value === "") return;
    onChange(selectedOption.value);
  };

  return (
    <Select
      className="mt-2"
      classNamePrefix="react-select"
      styles={customStyles}
      components={{ DropdownIndicator, IndicatorSeparator }}
      value={opcionSeleccionada}
      onChange={handleChange}
      options={opcionesConPlaceholder}
      placeholder="Seleccionar Especialidad"
      isSearchable
      isOptionDisabled={(opt) => opt.isDisabled}
      filterOption={createFilter({ matchFrom: "any" })}
      noOptionsMessage={() => "Sin resultados"}
      //* Tema (refina colores de foco/selección)
      theme={(theme) => ({
        ...theme,
        colors: {
          ...theme.colors,
          primary: "#4F46E5", //* indigo-600 (focus)
          primary25: "#EEF2FF", //* indigo-50 (hover)
          primary50: "#E0E7FF", //* indigo-100 (active)
          neutral10: "#E0E7FF",
          neutral20: "#E5E7EB", //* border
          neutral30: "#A5B4FC", //* border focus
        },
      })}
    />
  );
};

export default EspecialidadDropdown;
