/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, {
  ReactNode,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import {
  FaUserCheck,
  FaBookMedical,
  FaStethoscope,
  FaLaptopMedical,
  FaChartLine,
  FaMedkit,
  FaBars,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { BiLogoReact } from "react-icons/bi";
import {
  MdLogout,
  MdOutlineFullscreen,
  MdOutlineFullscreenExit,
} from "react-icons/md";
import Cookies from "js-cookie";

// Loader sin SSR (tu componente actual)
const LoaderGeneral = dynamic(
  () => import("../pages/estadisticas/Loaders/Loader-general"),
  { ssr: false }
);

interface PresidenteLayoutProps {
  children: ReactNode;
}

/** Rutas donde NUNCA se usa el layout (por ejemplo, vistas de impresión) */
const NO_LAYOUT_ROUTES = [
  "/consultas/recetas/generar-receta-farmacia",
  "/consultas/recetas/generar-receta-paciente",
  "/capturas/recetas/generar-receta-paciente-pase",
  "/capturas/recetas/generar-receta-farmacia-pase",
  "/capturas/laboratorio/generar-ordenes",
  "/capturas/incapacidades/generar-incapacidad",
];

const STORAGE_KEYS = {
  focus: "ui:focusMode",
  collapsed: "ui:sidebarCollapsed",
  openSection: "ui:openMenu",
};

const PresidenteLayout: React.FC<PresidenteLayoutProps> = ({ children }) => {
  const router = useRouter();

  // ---- STATE ----
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fromSidebar, setFromSidebar] = useState(false);
  const [focusMode, setFocusMode] = useState(false); // Ocultar layout
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // Colapsar sidebar desktop

  // --- Montaje: restaurar preferencias ---
  useEffect(() => {
    setMounted(true);
    try {
      const f = localStorage.getItem(STORAGE_KEYS.focus);
      const c = localStorage.getItem(STORAGE_KEYS.collapsed);
      const s = localStorage.getItem(STORAGE_KEYS.openSection);
      if (f) setFocusMode(f === "1");
      if (c) setSidebarCollapsed(c === "1");
      if (s) setOpenMenu(s);
    } catch {
      /* ignore */
    }
  }, []);

  // --- Persistencia ---
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.focus, focusMode ? "1" : "0");
    } catch {}
  }, [focusMode]);
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.collapsed, sidebarCollapsed ? "1" : "0");
    } catch {}
  }, [sidebarCollapsed]);
  useEffect(() => {
    try {
      if (openMenu) localStorage.setItem(STORAGE_KEYS.openSection, openMenu);
      else localStorage.removeItem(STORAGE_KEYS.openSection);
    } catch {}
  }, [openMenu]);

  // --- Scroll lock en drawer móvil ---
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev || "";
    };
  }, [mobileMenuOpen]);

  // --- Loader solo si la navegación viene desde el sidebar ---
  useEffect(() => {
    const handleStart = () => fromSidebar && setIsLoading(true);
    const handleEnd = () => {
      setIsLoading(false);
      setFromSidebar(false);
      setMobileMenuOpen(false);
    };
    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleEnd);
    router.events.on("routeChangeError", handleEnd);
    return () => {
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleEnd);
      router.events.off("routeChangeError", handleEnd);
    };
  }, [fromSidebar, router.events]);

  // --- Atajo teclado para Focus Mode (Ctrl/Cmd + K) ---
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const cmdOrCtrl = e.ctrlKey || e.metaKey;
      if (cmdOrCtrl && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setFocusMode((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Menú
  const menuOptions = useMemo(
    () => [
      {
        title: "Consultas",
        icon: <FaStethoscope className="text-indigo-500 text-xl shrink-0" />,
        options: [
          { name: "Signos Vitales", path: "/consultas/signos-vitales" },
          { name: "Diagnóstico", path: "/consultas/diagnostico" },
        ],
      },
      {
        title: "Especialista",
        icon: <FaUserCheck className="text-indigo-500 text-xl shrink-0" />,
        options: [
          { name: "Consulta Especialista", path: "/especialista/consulta-especialista" },
        ],
      },
      {
        title: "Catálogos",
        icon: <FaBookMedical className="text-indigo-500 text-xl shrink-0" />,
        options: [
          { name: "Beneficiarios", path: "/catalogos/beneficiarios" },
          { name: "Especialidades", path: "/catalogos/especialidades" },
          { name: "Enfermedades Crónicas", path: "/catalogos/enfermedades-cronicas" },
          { name: "Usuarios y Proveedores", path: "/catalogos/usuarios-y-proveedores" },
          { name: "Historial Incapacidades Completo", path: "/catalogos/historial-incapacidades-completo" },
          { name: "Estudios", path: "/catalogos/estudios" },
        ],
      },
      {
        title: "Capturas",
        icon: <FaLaptopMedical className="text-indigo-500 text-xl shrink-0" />,
        options: [
          { name: "Pases a Especialidades", path: "/capturas/pases-a-especialidades" },
          { name: "Surtimientos", path: "/capturas/surtimientos" },
          { name: "Orden de Estudio de Laboratorio", path: "/capturas/orden-de-estudio-de-laboratorio" },
          { name: "Incapacidades", path: "/capturas/incapacidades" },
          { name: "Costos", path: "/capturas/costos" },
          { name: "Cancelaciones", path: "/capturas/cancelaciones" },
        ],
      },
      {
        title: "Reportes",
        icon: <FaChartLine className="text-indigo-500 text-xl shrink-0" />,
        options: [
          { name: "Incapacidades", path: "/reportes/incapacidades" },
          { name: "Beneficiarios Activos", path: "/reportes/beneficiarios-activos" },
        ],
      },
      {
        title: "Farmacia",
        icon: <FaMedkit className="text-indigo-500 text-xl shrink-0" />,
        options: [
          { name: "Medicamentos", path: "/farmacia/medicamentos" },
          { name: "Farmacia Medicamentos", path: "/farmacia/farmacia-surtimientos" },
          { name: "Alertas de Stock", path: "/farmacia/alertas-de-stock" },
          { name: "Unidades de Medida", path: "/farmacia/unidades-de-medida" },
          { name: "Recetas Pendientes", path: "/farmacia/recetas-pendientes" },
        ],
      },
      {
        title: "Dashboard",
        icon: <BiLogoReact className="text-indigo-500 text-xl shrink-0" />,
        options: [{ name: "Actividades", path: "/dashboard/actividades" }],
      },
    ],
    []
  );

  // Abrir automáticamente la sección activa según la ruta
  useEffect(() => {
    const sec = menuOptions.find((m) =>
      m.options.some((o) => router.pathname.startsWith(o.path))
    );
    if (sec) setOpenMenu(sec.title);
  }, [router.pathname, menuOptions]);

  // Helpers
  const isActive = useCallback(
    (path: string) => router.pathname === path || router.pathname.startsWith(path + "/"),
    [router.pathname]
  );

  const navigateTo = useCallback(
    (path: string) => {
      setFromSidebar(true);
      router.replace(path);
    },
    [router]
  );

  const toggleMenu = useCallback((menu: string) => {
    setOpenMenu((prev) => (prev === menu ? null : menu));
  }, []);

  const handleLogout = useCallback(() => {
    Cookies.remove("token");
    Cookies.remove("rol");
    router.replace("/");
  }, [router]);

  const skipLayout = NO_LAYOUT_ROUTES.includes(router.pathname);

  // ---- RENDER ----
  return (
    <>
      {/* FAB de Focus Mode */}
      {!skipLayout && (
        <button
          onClick={() => setFocusMode((v) => !v)}
          aria-label={focusMode ? "Mostrar layout" : "Ocultar layout / Modo enfoque"}
          className={`fixed z-[10000] bottom-4 right-4 sm:bottom-6 sm:right-6 rounded-2xl px-4 py-3 font-semibold shadow-2xl
            backdrop-blur-xl ring-1 transition
            ${
              focusMode
                ? "bg-gradient-to-r from-sky-500 to-indigo-500 text-white ring-sky-200"
                : "bg-white/80 hover:bg-white text-slate-700 ring-slate-200"
            }`}
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 12px)" }}
        >
          <span className="inline-flex items-center gap-2">
            {focusMode ? <MdOutlineFullscreenExit /> : <MdOutlineFullscreen />}
            <span className="hidden sm:inline">
              {focusMode ? "Salir de enfoque" : "Modo enfoque"}
            </span>
          </span>
          <span className="block text-[10px] opacity-70">
            Ctrl/Cmd + K
          </span>
        </button>
      )}

      {skipLayout || focusMode ? (
        // Modo sin layout — contenido full en tema CLARO con degradados azules→morado
        <div className="min-h-screen bg-gradient-to-br from-white via-sky-50 to-indigo-50 text-slate-800 relative">
          {/* Fondos suaves tipo "Aurora" */}
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -top-24 -left-24 w-80 h-80 bg-sky-300/30 blur-3xl rounded-full" />
            <div className="absolute top-1/3 -right-24 w-96 h-96 bg-indigo-300/30 blur-3xl rounded-full" />
            <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-fuchsia-300/20 blur-[90px] rounded-full" />
          </div>
          <main className="relative p-3 sm:p-6">{children}</main>
        </div>
      ) : (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-white via-sky-50 to-indigo-50 text-slate-800">
          {/* Header Top */}
          <header className="sticky top-0 z-40 flex items-center justify-between px-4 sm:px-6 py-3 bg-white/80 backdrop-blur-xl border-b border-slate-200">
            <div className="flex items-center gap-3">
              {/* Toggle menú móvil */}
              <button
                className="md:hidden p-2 rounded-xl bg-white shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-indigo-300"
                onClick={() => setMobileMenuOpen((v) => !v)}
                aria-label={mobileMenuOpen ? "Cerrar navegación" : "Abrir navegación"}
              >
                {mobileMenuOpen ? (
                  <FaTimes className="text-xl" />
                ) : (
                  <FaBars className="text-xl" />
                )}
              </button>

              {/* Marca */}
              <button
                onClick={() => router.replace("/inicio-presidente")}
                className="text-[clamp(16px,3.5vw,20px)] font-extrabold tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-sky-600 to-indigo-700"
                aria-label="Ir al inicio"
              >
                PANDORA <span className="text-slate-800">Dashboard</span>
              </button>
            </div>

            {/* Acciones derechas */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Colapsar sidebar (desktop) */}
              <button
                onClick={() => setSidebarCollapsed((v) => !v)}
                className="hidden md:inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white shadow-sm hover:shadow ring-1 ring-slate-200"
                aria-label={sidebarCollapsed ? "Expandir barra lateral" : "Colapsar barra lateral"}
              >
                {sidebarCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
                <span className="hidden lg:inline text-sm">
                  {sidebarCollapsed ? "Expandir" : "Colapsar"}
                </span>
              </button>

              {/* Cerrar sesión */}
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:brightness-110 shadow"
              >
                <MdLogout className="text-lg" />
                <span className="text-sm font-semibold hidden sm:inline">
                  Cerrar sesión
                </span>
              </button>
            </div>
          </header>

          <div className="flex flex-1">
            {/* Sidebar Desktop */}
            <aside
              className={`hidden md:flex flex-col fixed top-[56px] lg:top-[56px] bottom-0 left-0 
                ${sidebarCollapsed ? "w-20" : "w-80"} 
                transition-all duration-300
                bg-white/80 backdrop-blur-xl border-r border-slate-200 shadow-[0_10px_40px_-10px_rgba(2,6,23,0.15)]`}
            >
              {/* Decoración aurora dentro del aside */}
              <div aria-hidden className="pointer-events-none absolute inset-0 opacity-70">
                <div className="absolute -top-24 left-8 w-40 h-40 bg-sky-300/25 blur-3xl rounded-full" />
                <div className="absolute bottom-6 -right-10 w-44 h-44 bg-indigo-300/20 blur-[60px] rounded-full" />
              </div>

              {/* Navegación */}
              <nav className="relative flex-1 overflow-y-auto px-3 py-4 custom-scroll">
                <ul className="space-y-3">
                  {menuOptions.map((menu, i) => {
                    const expanded = openMenu === menu.title;
                    return (
                      <li key={i}>
                        <button
                          className={`w-full flex items-center gap-3 ${
                            sidebarCollapsed ? "justify-center" : "px-3"
                          } py-2 rounded-xl bg-white/70 hover:bg-white transition-colors ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-300`}
                          onClick={() => toggleMenu(menu.title)}
                          aria-expanded={expanded}
                          aria-controls={`section-${i}`}
                          title={sidebarCollapsed ? menu.title : undefined}
                        >
                          {menu.icon}
                          {!sidebarCollapsed && (
                            <>
                              <span className="text-sm font-semibold text-slate-800">
                                {menu.title}
                              </span>
                              <span className="ml-auto text-xs text-slate-500">
                                {expanded ? "—" : "+"}
                              </span>
                            </>
                          )}
                        </button>

                        {/* Opciones */}
                        <ul
                          id={`section-${i}`}
                          className={`mt-2 space-y-1 transition-[height,opacity] ${
                            expanded && !sidebarCollapsed
                              ? "opacity-100"
                              : "opacity-0 h-0 overflow-hidden"
                          }`}
                          aria-hidden={!expanded || sidebarCollapsed}
                        >
                          {menu.options.map((opt, j) => (
                            <li key={j}>
                              <button
                                onClick={() => navigateTo(opt.path)}
                                onMouseEnter={() => router.prefetch?.(opt.path)}
                                className={`w-full ${
                                  sidebarCollapsed ? "px-2 justify-center" : "px-4 justify-start"
                                } text-left py-2 rounded-lg text-[13px] inline-flex items-center gap-2 transition-colors ring-1
                                  ${
                                    isActive(opt.path)
                                      ? "bg-gradient-to-r from-sky-500 to-indigo-500 text-white ring-indigo-300 shadow"
                                      : "bg-white/0 text-slate-700 ring-slate-200 hover:bg-white/70"
                                  }`}
                                aria-current={isActive(opt.path) ? "page" : undefined}
                                title={sidebarCollapsed ? opt.name : undefined}
                              >
                                {isActive(opt.path) && (
                                  <span className="inline-block h-2 w-2 rounded-full bg-white" aria-hidden="true" />
                                )}
                                <span className={`${sidebarCollapsed ? "sr-only" : ""}`}>
                                  {opt.name}
                                </span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </aside>

            {/* Drawer móvil */}
            {mobileMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-[2px]"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-hidden="true"
                />
                <aside
                  className="md:hidden fixed z-50 top-[56px] bottom-0 left-0 w-[82vw] max-w-[340px] bg-white/85 backdrop-blur-2xl shadow-2xl p-4 overflow-y-auto ring-1 ring-slate-200"
                  role="dialog"
                  aria-label="Menú de navegación"
                  style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
                >
                  <nav>
                    <ul className="space-y-3">
                      {menuOptions.map((menu, i) => (
                        <li key={i}>
                          <button
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl bg-white hover:shadow transition-colors ring-1 ring-slate-200"
                            onClick={() =>
                              setOpenMenu((prev) => (prev === menu.title ? null : menu.title))
                            }
                            aria-expanded={openMenu === menu.title}
                            aria-controls={`m-section-${i}`}
                          >
                            {menu.icon}
                            <span className="text-sm font-semibold text-slate-800">
                              {menu.title}
                            </span>
                            <span className="ml-auto text-xs text-slate-500">
                              {openMenu === menu.title ? "—" : "+"}
                            </span>
                          </button>

                          <ul
                            id={`m-section-${i}`}
                            className={`mt-1 space-y-1 ${openMenu === menu.title ? "block" : "hidden"}`}
                          >
                            {menu.options.map((opt, j) => (
                              <li key={j}>
                                <button
                                  onClick={() => navigateTo(opt.path)}
                                  className={`w-full text-left px-4 py-2 rounded-lg text-[13px] transition-colors ring-1
                                    ${
                                      isActive(opt.path)
                                        ? "bg-gradient-to-r from-sky-500 to-indigo-500 text-white ring-indigo-300 shadow"
                                        : "bg-white/0 text-slate-700 ring-slate-200 hover:bg-white"
                                    }`}
                                  aria-current={isActive(opt.path) ? "page" : undefined}
                                >
                                  <span className="inline-flex items-center gap-2">
                                    {isActive(opt.path) && (
                                      <span className="inline-block h-2 w-2 rounded-full bg-white" aria-hidden="true" />
                                    )}
                                    {opt.name}
                                  </span>
                                </button>
                              </li>
                            ))}
                          </ul>
                        </li>
                      ))}
                    </ul>
                  </nav>

                  <div className="mt-6">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-3 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:brightness-110 transition focus:outline-none focus:ring-2 focus:ring-pink-300 shadow"
                    >
                      <MdLogout className="text-xl" />
                      <span className="text-sm font-semibold">Cerrar sesión</span>
                    </button>
                  </div>
                </aside>
              </>
            )}

            {/* Contenido principal */}
            <main
              className={`relative flex-1 p-4 sm:p-6 w-full ${sidebarCollapsed ? "md:ml-20" : "md:ml-80"}`}
            >
              {/* Fondo aurora en el área de contenido */}
              <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
                <div className="absolute top-10 left-8 w-64 h-64 bg-sky-300/25 blur-3xl rounded-full" />
                <div className="absolute top-1/2 -right-10 w-72 h-72 bg-indigo-300/30 blur-3xl rounded-full" />
                <div className="absolute bottom-10 left-1/3 w-56 h-56 bg-fuchsia-300/20 blur-[90px] rounded-full" />
              </div>

              {isLoading && fromSidebar && (
                <div className="absolute inset-0 z-30 grid place-items-center bg-white/70 backdrop-blur-sm">
                  <LoaderGeneral size={120} />
                </div>
              )}

              <div
                className={`transition-all duration-300 ${
                  isLoading ? "opacity-0 translate-y-3" : "opacity-100 translate-y-0"
                } ${mounted ? "" : "opacity-0"}`}
              >
                {children}
              </div>
            </main>
          </div>

          {/* Global styles */}
          <style jsx global>{`
            /* Scrollbar fino */
            .custom-scroll::-webkit-scrollbar,
            aside::-webkit-scrollbar {
              width: 8px;
              height: 8px;
            }
            .custom-scroll::-webkit-scrollbar-thumb,
            aside::-webkit-scrollbar-thumb {
              background: linear-gradient(180deg, rgba(14,165,233,.55), rgba(99,102,241,.55));
              border-radius: 8px;
            }
            .custom-scroll::-webkit-scrollbar-track,
            aside::-webkit-scrollbar-track {
              background: transparent;
            }

            /* Grid sutil sobre el fondo (claro) */
            body:before {
              content: "";
              position: fixed;
              inset: 0;
              pointer-events: none;
              background-image:
                radial-gradient(circle at 25% 10%, rgba(56,189,248,0.10), transparent 40%),
                radial-gradient(circle at 80% 30%, rgba(99,102,241,0.08), transparent 50%),
                linear-gradient(transparent 0, transparent 31px, rgba(2,6,23,0.04) 31px),
                linear-gradient(90deg, transparent 0, transparent 31px, rgba(2,6,23,0.04) 31px);
              background-size: auto, auto, 32px 32px, 32px 32px;
              z-index: -1;
            }

            @media (prefers-reduced-motion: reduce) {
              * {
                animation-duration: 0.001ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.001ms !important;
                scroll-behavior: auto !important;
              }
            }
          `}</style>
        </div>
      )}
    </>
  );
};

export default PresidenteLayout;
