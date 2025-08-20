/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';

const TratamientoInput = ({ med, index, handleMedicamentoChange, phraseTemplates }) => {
  //* Valor inicial
  const initialDays = med.tratamientoDias || 30;
  const [selectedDays, setSelectedDays] = useState(initialDays);
  const [message, setMessage] = useState(med.tratamiento || "");

  //* Formatea el texto de la plantilla con singular/plural correcto
  const buildMessage = (days) => {
    const i = Math.floor(Math.random() * phraseTemplates.length);
    let txt = phraseTemplates[i].replace("__", days === 1 ? "un" : days);
    if (days === 1) {
      //* Cambia "días" por "día" si corresponde
      txt = txt.replace(/días\b/gi, "día");
    }
    return txt;
  };

  //* Mensaje inicial si no existe
  useEffect(() => {
    if (!med.tratamiento) {
      const formattedMessage = buildMessage(selectedDays);
      setMessage(formattedMessage);
      handleMedicamentoChange(index, "tratamiento", formattedMessage.toUpperCase());
      handleMedicamentoChange(index, "tratamientoDias", selectedDays);
    }
  }, []);

  //* Actualiza tratamiento con días
  const updateTreatment = (days) => {
    setSelectedDays(days);
    const formattedMessage = buildMessage(days);
    setMessage(formattedMessage);
    handleMedicamentoChange(index, "tratamiento", formattedMessage.toUpperCase());
    handleMedicamentoChange(index, "tratamientoDias", days);
  };

  const pluralLabel = selectedDays === 1 ? "DÍA" : "DÍAS";

  return (
    <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-white to-indigo-50/70 shadow p-4 sm:p-5">
      {/* Encabezado */}
      <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
        Tratamiento
      </label>
      {/* + Separación extra respecto a los números del rango */}
      <p className="mt-1 mb-4 text-sm text-gray-600">¿Por cuántos días?</p>

      {/* Slider + extremos */}
      <div className="mt-8">
        <div className="relative">
          {/* pista decorativa */}
          <div className="absolute inset-0 top-1/2 -translate-y-1/2 h-2 rounded-full bg-gradient-to-r from-indigo-200 via-indigo-300 to-purple-200" />
          {/* marcas extremos (un poco más separadas del texto superior) */}
          <div className="absolute -top-5 left-0 text-[11px] text-gray-500 select-none">1</div>
          <div className="absolute -top-5 right-0 text-[11px] text-gray-500 select-none">30</div>

          {/* input range sobre la pista */}
          <input
            type="range"
            value={selectedDays}
            onChange={(e) => {
              const days = Math.max(1, Math.min(30, parseInt(e.target.value, 10) || 1));
              updateTreatment(days);
            }}
            min="1"
            max="30"
            aria-label="Días de tratamiento"
            className="relative z-10 w-full h-2 bg-transparent appearance-none cursor-pointer focus:outline-none"
          />

          {/* estilo del thumb (webkit/moz) */}
          <style jsx>{`
            input[type="range"]::-webkit-slider-thumb{
              -webkit-appearance:none;
              appearance:none;
              width:22px;height:22px;border-radius:9999px;
              background:#4F46E5;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,.15)
            }
            input[type="range"]::-moz-range-thumb{
              width:22px;height:22px;border-radius:9999px;
              background:#4F46E5;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,.15)
            }
            input[type="range"]::-webkit-slider-runnable-track{
              height:2px;background:transparent;
            }
            input[type="range"]::-moz-range-track{
              height:2px;background:transparent;
            }
          `}</style>
        </div>

        {/* Input numérico + chip */}
        <div className="mt-5 flex items-center gap-3">
          <input
            type="number"
            value={selectedDays}
            onChange={(e) => {
              const days = Math.max(1, Math.min(30, parseInt(e.target.value, 10) || 1));
              updateTreatment(days);
            }}
            min="1"
            max="30"
            className="w-24 h-11 rounded-xl bg-white border border-gray-300 text-gray-900 text-center font-bold
              focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200">
            Rango: 1–30 días
          </span>
        </div>
      </div>

      {/* Mensaje final */}
      <div className="mt-4">
        <div className="px-3 py-2 rounded-xl bg-white ring-1 ring-indigo-100 text-[13px] text-gray-700 uppercase">
          {selectedDays} {pluralLabel} — {message}
        </div>
      </div>
    </div>
  );
};

export default TratamientoInput;
