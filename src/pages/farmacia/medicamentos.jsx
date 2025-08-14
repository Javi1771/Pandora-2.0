import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";

import { useMedicamentos } from "../../hooks/farmaciaHook/useMedicamentos";
import FormMedicamento from "./components/formMedicamento";
import MedicamentosTable from "./components/medicamentosTable";
import EditMedicamentoForm from "./components/editMedicamentoForm";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "../../utils/PageHeader"; // ajusta la ruta si lo moviste a /components

// Función auxiliar para leer cookies en el cliente
const getCookie = (name) => {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? match[2] : null;
};

const Medicamentos = () => {
  const {
    medicamentos,
    addMedicamento,
    deleteMedicamento,
    editMedicamento,
    message,
  } = useMedicamentos();

  const [activeView] = useState("registrar");
  const [selectedMedicamento, setSelectedMedicamento] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [closingModal, setClosingModal] = useState(false);
  const [role, setRole] = useState(null);

  const router = useRouter();

  useEffect(() => {
    const rolCookie = getCookie("rol");
    setRole(rolCookie);
  }, []);

  // Cuando hacemos clic en "Editar" en la tabla, abrimos el modal
  const handleEdit = (medicamento) => {
    setSelectedMedicamento(medicamento || {});
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setSelectedMedicamento(null);
    setIsModalOpen(false);
  };

  const handleSalir = () => {
    router.replace("/inicio-servicio-medico");
  };

  const fadeVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  // Props dinámicos para el header
  const statusLabel =
    role === null ? "Cargando…" : role === "9" ? "Sólo consulta" : "Edición";

  const headerSubtitle =
    "Registro y control de medicamentos · Sólo administradores y encargados de farmacia";

  return (
    <div className="min-h-screen text-white bg-gradient-to-b from-blue-900 via-black to-grey-700">
      <div className="flex flex-col lg:flex-row">
        {/* Contenido principal */}
        <div className="flex-grow relative">
          {/* Contenedor centrado con padding */}
          <div className="container mx-auto px-4 py-6">
            {/* Header global */}
            <PageHeader
              title="Gestión de Medicamentos"
              subtitle={headerSubtitle}
              imageSrc="/login_servicio_medico.png" // cambia por tu ícono de farmacia si tienes otro
              onBack={handleSalir}
              statusLabel={statusLabel}
            />

            {/* Si rol !== "9", mostramos el formulario y la tabla */}
            {role !== "9" ? (
              activeView === "registrar" && (
                <motion.div
                  key="registrar"
                  variants={fadeVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex flex-col gap-8">
                    {/* Formulario para registrar medicamento */}
                    <div className="bg-gradient-to-b from-gray-900 to-gray-800 p-6 rounded-2xl">
                      <FormMedicamento
                        onAddMedicamento={addMedicamento}
                        message={message}
                      />
                    </div>

                    {/* Tabla de medicamentos */}
                    <div className="bg-gradient-to-b from-gray-900 to-gray-800 p-6 rounded-2xl">
                      <MedicamentosTable
                        medicamentos={medicamentos || []}
                        onDelete={deleteMedicamento}
                        onEdit={handleEdit}
                      />
                    </div>
                  </div>
                </motion.div>
              )
            ) : (
              // Si rol === "9", solo la tabla
              <div className="bg-[#0b2424] p-6 rounded-2xl shadow-[0_0_40px_rgba(0,255,255,0.2)] border border-teal-500">
                <MedicamentosTable
                  medicamentos={medicamentos || []}
                  onDelete={deleteMedicamento}
                  onEdit={handleEdit}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal para editar medicamento */}
      <AnimatePresence mode="wait">
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onAnimationComplete={() => {
              if (closingModal) {
                setIsModalOpen(false);
                setClosingModal(false);
              }
            }}
          >
            <motion.div
              className="bg-[#0b2424] text-teal-200 p-8 rounded-2xl shadow-2xl border border-teal-500"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
            >
              <EditMedicamentoForm
                medicamento={selectedMedicamento}
                onEdit={(updatedMedicamento) => {
                  editMedicamento(updatedMedicamento);
                  handleModalClose();
                }}
                onCancel={handleModalClose}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Medicamentos;
