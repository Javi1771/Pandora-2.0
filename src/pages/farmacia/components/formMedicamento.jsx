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
    precio: "",
  });

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
      precio: parseFloat(formData.precio),
    });

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
    <div className="max-w-6xl mx-auto rounded-3xl bg-gradient-to-br from-gray-800 to-gray-900 p-6 shadow-2xl border border-gray-700">
      <div className="flex items-center justify-center mb-6">
        <div className="bg-blue-500 p-3 rounded-full mr-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-blue-300 tracking-wide uppercase">
          Registro de Medicamentos
        </h2>
      </div>

      {message && (
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-3 rounded-lg mb-6 text-center font-medium shadow-lg animate-pulse">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Columna 1 */}
          <div className="space-y-6">
            {/* Medicamento */}
            <div className="bg-gray-700 p-4 rounded-xl border border-gray-600 transition-all hover:border-blue-400 hover:shadow-lg">
              <label htmlFor="medicamento" className="block text-blue-300 font-semibold mb-2">
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Medicamento
                </span>
              </label>
              <input
                type="text"
                id="medicamento"
                name="medicamento"
                value={formData.medicamento}
                onChange={handleChange}
                placeholder="Nombre + gramaje o ml"
                required
                className="w-full p-3 rounded-lg bg-gray-600 text-white border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-400 transition-all"
              />
            </div>

            {/* Clasificación */}
            <div className="bg-gray-700 p-4 rounded-xl border border-gray-600 transition-all hover:border-blue-400 hover:shadow-lg">
              <label htmlFor="clasificacion" className="block text-blue-300 font-semibold mb-2">
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Clasificación
                </span>
              </label>
              <select
                id="clasificacion"
                name="clasificacion"
                value={formData.clasificacion}
                onChange={handleChange}
                required
                className="w-full p-3 rounded-lg bg-gray-600 text-white border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-400 transition-all"
              >
                <option value="" className="text-gray-400">Seleccione una opción</option>
                <option value="p" className="text-white">PATENTE</option>
                <option value="g" className="text-white">GENÉRICO</option>
                <option value="c" className="text-white">CONTROLADO</option>
                <option value="e" className="text-white">ESPECIALIDAD</option>
              </select>
            </div>

            {/* Unidad de Medida */}
            <div className="bg-gray-700 p-4 rounded-xl border border-gray-600 transition-all hover:border-blue-400 hover:shadow-lg">
              <label htmlFor="medida" className="block text-blue-300 font-semibold mb-2">
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                  </svg>
                  Unidad de Medida
                </span>
              </label>
              <select
                id="medida"
                name="medida"
                value={formData.medida}
                onChange={handleChange}
                required
                className="w-full p-3 rounded-lg bg-gray-600 text-white border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-400 transition-all"
              >
                <option value="" className="text-gray-400">Seleccione una unidad</option>
                {unidades.map((unidad) => (
                  <option key={unidad.code} value={unidad.code} className="text-white">
                    {unidad.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Presentación */}
            <div className="bg-gray-700 p-4 rounded-xl border border-gray-600 transition-all hover:border-blue-400 hover:shadow-lg">
              <label htmlFor="presentacion" className="block text-blue-300 font-semibold mb-2">
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  Presentación
                </span>
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
                placeholder="Piezas por caja/sobre/frasco"
                required
                className="w-full p-3 rounded-lg bg-gray-600 text-white border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-400 transition-all"
              />
            </div>
          </div>

          {/* Columna 2 */}
          <div className="space-y-6">
            {/* EAN */}
            <div className="bg-gray-700 p-4 rounded-xl border border-gray-600 transition-all hover:border-blue-400 hover:shadow-lg">
              <label htmlFor="ean" className="block text-blue-300 font-semibold mb-2">
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  EAN (Código de Barras)
                </span>
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
                className="w-full p-3 rounded-lg bg-gray-600 text-white border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-400 transition-all"
              />
            </div>

            {/* Piezas */}
            <div className="bg-gray-700 p-4 rounded-xl border border-gray-600 transition-all hover:border-blue-400 hover:shadow-lg">
              <label htmlFor="piezas" className="block text-blue-300 font-semibold mb-2">
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                  </svg>
                  Piezas
                </span>
              </label>
              <input
                type="number"
                id="piezas"
                name="piezas"
                value={formData.piezas}
                onChange={handleChange}
                placeholder="Piezas en almacén"
                required
                className="w-full p-3 rounded-lg bg-gray-600 text-white border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-400 transition-all"
              />
            </div>

            {/* Mínimo y Máximo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-700 p-4 rounded-xl border border-gray-600 transition-all hover:border-blue-400 hover:shadow-lg">
                <label htmlFor="minimo" className="block text-blue-300 font-semibold mb-2">
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                    Mínimo
                  </span>
                </label>
                <input
                  type="number"
                  id="minimo"
                  name="minimo"
                  value={formData.minimo}
                  onChange={handleChange}
                  placeholder="Stock mínimo"
                  required
                  className="w-full p-3 rounded-lg bg-gray-600 text-white border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-400 transition-all"
                />
              </div>

              <div className="bg-gray-700 p-4 rounded-xl border border-gray-600 transition-all hover:border-blue-400 hover:shadow-lg">
                <label htmlFor="maximo" className="block text-blue-300 font-semibold mb-2">
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Máximo
                  </span>
                </label>
                <input
                  type="number"
                  id="maximo"
                  name="maximo"
                  value={formData.maximo}
                  onChange={handleChange}
                  placeholder="Stock máximo"
                  required
                  className="w-full p-3 rounded-lg bg-gray-600 text-white border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-400 transition-all"
                />
              </div>
            </div>

            {/* Precio */}
            <div className="bg-gray-700 p-4 rounded-xl border border-gray-600 transition-all hover:border-blue-400 hover:shadow-lg">
              <label htmlFor="precio" className="block text-blue-300 font-semibold mb-2">
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Precio (Costo)
                </span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-400">$</span>
                <input
                  type="number"
                  id="precio"
                  name="precio"
                  value={formData.precio}
                  onChange={handleChange}
                  placeholder="Ej. 123.45"
                  step="0.01"
                  required
                  className="w-full pl-8 p-3 rounded-lg bg-gray-600 text-white border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-400 transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Botón de envío */}
        <div className="flex justify-center mt-8">
          <button
            type="submit"
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 
                     hover:from-blue-600 hover:to-cyan-600 text-white font-bold 
                     uppercase tracking-wide rounded-full shadow-2xl flex items-center
                     transition-all duration-300 hover:scale-105 
                     focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Registrar Medicamento
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormMedicamento;