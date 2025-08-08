import React, { useState, useEffect } from "react";

const FormMedicamento = ({ onAddMedicamento, message }) => {
  const [formData, setFormData] = useState({
    medicamento: "",
    clasificacion: "",
    presentacion: "",
    ean: "",
    piezas: "",
    minimo: "",
    maximo: "",
    medida: "",
    precio: "", // <-- Nuevo campo precio
  });

  // Estado para las unidades de medida traídas de la API
  const [unidades, setUnidades] = useState([]);

  useEffect(() => {
    const fetchUnidades = async () => {
      try {
        const res = await fetch("/api/farmacia/unidades");
        if (!res.ok) {
          throw new Error("Error al obtener las unidades de medida");
        }
        const data = await res.json();
        setUnidades(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchUnidades();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    onAddMedicamento({
      medicamento: formData.medicamento,
      clasificacion: formData.clasificacion,
      presentacion: parseInt(formData.presentacion, 10),
      ean: formData.ean,
      piezas: parseInt(formData.piezas, 10),
      minimo: parseInt(formData.minimo, 10),
      maximo: parseInt(formData.maximo, 10),
      medida: formData.medida,
      precio: parseFloat(formData.precio), // <-- Convertimos el precio a número con decimales
    });

    // Reset del formulario
    setFormData({
      medicamento: "",
      clasificacion: "",
      presentacion: "",
      ean: "",
      piezas: "",
      minimo: "",
      maximo: "",
      medida: "",
      precio: "",
    });
  };

  return (
    <div className="max-w-7xl mx-auto rounded-3xl ">
      <h2 className="text-2xl font-semibold text-blue-300 mb-8 text-center tracking-wider uppercase">
        💊 Registro de Medicamentos
      </h2>

      {message && (
        <p className="bg-gradient-to-b from-gray-900 to-gray-800 p-2 rounded mb-4 text-center font-medium">
          {message}
        </p>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 ">
        {/* Medicamento */}
        <div className="flex flex-col">
          <label
            htmlFor="medicamento"
            className="mb-1 font-semibold text-blue-300"
          >
            Medicamento:
          </label>
          <input
            type="text"
            id="medicamento"
            name="medicamento"
            value={formData.medicamento}
            onChange={handleChange}
            placeholder="Nombre + gramaje o ml"
            required
            className="p-2 rounded-md border border-blue-300 bg-[#3d3d3e] text-grey-200 
                       focus:outline-none focus:ring-2 focus:ring-blue-300 
                       placeholder:text-white-100 transition-colors"
          />
        </div>

        {/* Clasificación */}
        <div className="flex flex-col">
          <label
            htmlFor="clasificacion"
            className="mb-1 font-semibold text-blue-300"
          >
            Clasificación:
          </label>
          <select
            id="clasificacion"
            name="clasificacion"
            value={formData.clasificacion}
            onChange={handleChange}
            required
            className="p-2 rounded-md border border-blue-300 bg-[#3d3d3e] text-grey-200 
                       focus:outline-none focus:ring-2 focus:ring-blue-300 
                       placeholder:text-white-100 transition-colors"
          >
            <option value="">Seleccione una opción</option>
            <option value="p">PATENTE</option>
            <option value="g">GENÉRICO</option>
            <option value="c">CONTROLADO</option>
            <option value="e">ESPECIALIDAD</option>
          </select>
        </div>

        {/* Unidad de Medida */}
        <div className="flex flex-col">
          <label htmlFor="medida" className="mb-1 font-semibold text-blue-300">
            Unidad de Medida:
          </label>
          <select
            id="medida"
            name="medida"
            value={formData.medida}
            onChange={handleChange}
            required
            className="p-2 rounded-md border border-blue-300 bg-[#3d3d3e] text-grey-200 
                       focus:outline-none focus:ring-2 focus:ring-blue-300 
                       placeholder:text-white-100 transition-colors"
          >
            <option value="">Seleccione una unidad</option>
            {/* Se generan las opciones desde las unidades obtenidas de la API */}
            {unidades.map((unidad) => (
              <option key={unidad.code} value={unidad.code}>
                {unidad.label}
              </option>
            ))}
          </select>
        </div>

        {/* Presentación */}
        <div className="flex flex-col">
          <label
            htmlFor="presentacion"
            className="mb-1 font-semibold text-blue-300"
          >
            Presentación:
          </label>
          <input
            type="text"
            id="presentacion"
            name="presentacion"
            value={formData.presentacion}
            onChange={(e) => {
              const numericValue = e.target.value.replace(/\D/g, "");
              setFormData((prev) => ({
                ...prev,
                presentacion: numericValue,
              }));
            }}
            placeholder="Piezas por caja o sobre o frasco"
            required
            className="p-2 rounded-md border border-blue-300 bg-[#3d3d3e] text-grey-200 
                       focus:outline-none focus:ring-2 focus:ring-blue-300 
                       placeholder:text-white-100 transition-colors"
          />
        </div>

        {/* EAN */}
        <div className="flex flex-col">
          <label htmlFor="ean" className="mb-1 font-semibold text-blue-300">
            EAN (Código de Barras):
          </label>
          <input
            type="text"
            inputMode="numeric"
            id="ean"
            name="ean"
            value={formData.ean}
            onChange={handleChange}
            placeholder="Ingresa el código de barras"
            required
            className="p-2 rounded-md border border-blue-300 bg-[#3d3d3e] text-grey-200 
                       focus:outline-none focus:ring-2 focus:ring-blue-300 
                       placeholder:text-white-100 transition-colors"
          />
        </div>

        {/* Piezas */}
        <div className="flex flex-col">
          <label htmlFor="piezas" className="mb-1 font-semibold text-blue-300">
            Piezas:
          </label>
          <input
            type="number"
            id="piezas"
            name="piezas"
            value={formData.piezas}
            onChange={handleChange}
            placeholder="Ingresa el número de piezas en almacén"
            required
            className="p-2 rounded-md border border-blue-300 bg-[#3d3d3e] text-grey-200 
                       focus:outline-none focus:ring-2 focus:ring-blue-300 
                       placeholder:text-white-100 transition-colors"
          />
        </div>

        {/* Mínimo */}
        <div className="flex flex-col">
          <label htmlFor="minimo" className="mb-1 font-semibold text-blue-300">
            Mínimo:
          </label>
          <input
            type="number"
            id="minimo"
            name="minimo"
            value={formData.minimo}
            onChange={handleChange}
            placeholder="Stock mínimo permitido"
            required
            className="p-2 rounded-md border border-blue-300 bg-[#3d3d3e] text-grey-200 
                       focus:outline-none focus:ring-2 focus:ring-blue-300 
                       placeholder:text-white-100 transition-colors"
          />
        </div>

        {/* Máximo */}
        <div className="flex flex-col">
          <label htmlFor="maximo" className="mb-1 font-semibold text-blue-300">
            Máximo:
          </label>
          <input
            type="number"
            id="maximo"
            name="maximo"
            value={formData.maximo}
            onChange={handleChange}
            placeholder="Stock máximo permitido"
            required
            className="p-2 rounded-md border border-blue-300 bg-[#3d3d3e] text-grey-200 
                       focus:outline-none focus:ring-2 focus:ring-blue-300 
                       placeholder:text-white-100 transition-colors"
          />
        </div>

        {/* Precio */}
        <div className="flex flex-col">
          <label htmlFor="precio" className="mb-1 font-semibold text-blue-300">
            Precio (Costo):
          </label>
          <input
            type="number"
            id="precio"
            name="precio"
            value={formData.precio}
            onChange={handleChange}
            placeholder="Ej. 123.45"
            step="0.01"
            required
            className="p-2 rounded-md border border-blue-300 bg-[#3d3d3e] text-grey-200 
                       focus:outline-none focus:ring-2 focus:ring-blue-300 
                       placeholder:text-white-100 transition-colors"
          />
        </div>

        {/* Botón de envío */}
        <button
          type="submit"
          className="mt-4 px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 
                     hover:from-teal-600 hover:to-cyan-600 text-white font-extrabold 
                     uppercase tracking-wide rounded-full shadow-2xl 
                     transition-transform duration-300 transform hover:scale-105 
                     focus:outline-none focus:ring-2 focus:ring-teal-400"
        >
          Registrar
        </button>
      </form>
    </div>
  );
};

export default FormMedicamento;
