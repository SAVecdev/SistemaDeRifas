import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './Shared/PrivateRoute';
import RoleGuard from './Shared/RoleGuard';
import Layout from './Shared/Layout';
import Home from './Home/Home';
import RifasActivas from './Rifas/RifasActivas';
import DetalleRifa from './Rifas/DetalleRifa';
import Login from './Auth/Login';
import Registro from './Auth/Registro';
import Perfil from './Perfil/Perfil';
import MisRifas from './Rifas/MisRifas';
import Transacciones from './Usuario/Transacciones';
import ComprarRifas from './Usuario/ComprarRifas';
import MisPremios from './Usuario/MisPremios';
import AdminDashboard from './Admin/AdminDashboard';
import AdminRifas from './Admin/AdminRifas';
import AdminUsuarios from './Admin/AdminUsuarios';
import AdminClientes from './Admin/AdminClientes';
import AdminSesiones from './Admin/AdminSesiones';
import CrearRifa from './Admin/CrearRifa';
import EditarRifa from './Admin/EditarRifa';
import PlantillasPremios from './Admin/PlantillasPremios';
import GestionPremios from './Admin/GestionPremios';
import AdminAreas from './Admin/AdminAreas';
import AdminTipoRifa from './Admin/AdminTipoRifa';
import AdminSorteos from './Admin/AdminSorteos';
import GanadoresRifa from './Admin/GanadoresRifa';
import Configuracion from './Admin/Configuracion';
import AdminReportes from './Admin/AdminReportes';
import AdminImagenes from './Admin/AdminImagenes';
import AdminVentasEliminadas from './Admin/AdminVentasEliminadas';
import ClienteSorteos from './Cliente/ClienteSorteos';
import ClienteUsuarios from './Cliente/ClienteUsuarios';
import VendedorDashboard from './Vendedor/VendedorDashboard';
import SupervisorDashboard from './Supervisor/SupervisorDashboard';
import UsuarioDashboard from './Usuario/UsuarioDashboard';
import Vender from './Vendedor/Vender';
import Ventas from './Vendedor/Ventas';
import Factura from './Vendedor/Factura';
import Historial from './Vendedor/Historial';
import VendedorPremiosPagados from './Vendedor/VendedorPremiosPagados';
import VendedorClientes from './Vendedor/VendedorClientes';
import SupervisorVendedores from './Supervisor/SupervisorVendedores';
import SupervisorReportes from './Supervisor/SupervisorReportes';
import ClienteDashboard from './Cliente/ClienteDashboard';
import ClienteRifas from './Cliente/ClienteRifas';
import Footer from './Shared/Footer';
import './App.css';

function App() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <AuthProvider>
        <Routes>
          {/* Rutas públicas (sin Layout) */}
          <Route path="/" element={<Home />} />
          <Route path="/rifas" element={<RifasActivas />} />
          <Route path="/rifa/:id" element={<DetalleRifa />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/factura" element={<Factura />} />

          {/* Rutas protegidas con Layout y Sidebar */}
          <Route element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }>
            {/* Rutas de Administrador */}
            <Route path="/admin" element={
              <RoleGuard rolesPermitidos={['administrador']}>
                <Navigate to="/admin/dashboard" replace />
              </RoleGuard>
            } />
            <Route path="/admin/dashboard" element={
              <RoleGuard rolesPermitidos={['administrador']}>
                <AdminDashboard />
              </RoleGuard>
            } />
            <Route path="/admin/rifas" element={
              <RoleGuard rolesPermitidos={['administrador']}>
                <AdminRifas />
              </RoleGuard>
            } />
            <Route path="/admin/usuarios" element={
              <RoleGuard rolesPermitidos={['administrador']}>
                <AdminUsuarios />
              </RoleGuard>
            } />
            <Route path="/admin/clientes" element={
              <RoleGuard rolesPermitidos={['administrador']}>
                {/* Administrador puede gestionar clientes */}
                <React.Suspense fallback={<div>Cargando...</div>}>
                  <AdminClientes />
                </React.Suspense>
              </RoleGuard>
            } />
            <Route path="/admin/crear-rifa" element={
              <RoleGuard rolesPermitidos={['administrador']}>
                <CrearRifa />
              </RoleGuard>
            } />
            <Route path="/admin/rifas/editar/:id" element={
              <RoleGuard rolesPermitidos={['administrador']}>
                <EditarRifa />
              </RoleGuard>
            } />
            <Route path="/admin/plantillas-premios" element={
              <RoleGuard rolesPermitidos={['administrador']}>
                <PlantillasPremios />
              </RoleGuard>
            } />
            <Route path="/admin/gestion-premios" element={
              <RoleGuard rolesPermitidos={['administrador']}>
                <GestionPremios />
              </RoleGuard>
            } />
            <Route path="/admin/tipos-rifa" element={
              <RoleGuard rolesPermitidos={['administrador']}>
                <AdminTipoRifa />
              </RoleGuard>
            } />
            <Route path="/admin/areas" element={
              <RoleGuard rolesPermitidos={['administrador']}>
                <AdminAreas />
              </RoleGuard>
            } />
            <Route path="/admin/sorteos" element={
              <RoleGuard rolesPermitidos={['administrador']}>
                <AdminSorteos />
              </RoleGuard>
            } />
            <Route path="/admin/sorteos/:id" element={
              <RoleGuard rolesPermitidos={['administrador']}>
                <GanadoresRifa />
              </RoleGuard>
            } />
            <Route path="/admin/sorteos/:id/sorteo/:sorteo" element={
              <RoleGuard rolesPermitidos={['administrador']}>
                <GanadoresRifa />
              </RoleGuard>
            } />
            <Route path="/admin/reportes" element={
              <RoleGuard rolesPermitidos={['administrador']}>
                <AdminReportes />
              </RoleGuard>
            } />
            <Route path="/admin/imagenes" element={
              <RoleGuard rolesPermitidos={['administrador']}>
                <AdminImagenes />
              </RoleGuard>
            } />
            <Route path="/admin/ventas-eliminadas" element={
              <RoleGuard rolesPermitidos={['administrador']}>
                <AdminVentasEliminadas />
              </RoleGuard>
            } />
            <Route path="/admin/sesiones" element={
              <RoleGuard rolesPermitidos={['administrador']}>
                <AdminSesiones />
              </RoleGuard>
            } />
            <Route path="/admin/configuracion" element={
              <RoleGuard rolesPermitidos={['administrador']}>
                <Configuracion />
              </RoleGuard>
            } />

            {/* Rutas de Supervisor */}
            <Route path="/supervisor" element={
              <RoleGuard rolesPermitidos={['supervisor']}>
                <Navigate to="/supervisor/dashboard" replace />
              </RoleGuard>
            } />
            <Route path="/supervisor/dashboard" element={
              <RoleGuard rolesPermitidos={['supervisor']}>
                <SupervisorDashboard />
              </RoleGuard>
            } />
            <Route path="/supervisor/vendedores" element={
              <RoleGuard rolesPermitidos={['supervisor']}>
                <SupervisorVendedores />
              </RoleGuard>
            } />
            <Route path="/supervisor/reportes" element={
              <RoleGuard rolesPermitidos={['supervisor']}>
                <SupervisorReportes />
              </RoleGuard>
            } />
            <Route path="/supervisor/transacciones" element={
              <RoleGuard rolesPermitidos={['supervisor']}>
                <Transacciones />
              </RoleGuard>
            } />

            {/* Rutas de Vendedor */}
            <Route path="/vendedor" element={
              <RoleGuard rolesPermitidos={['vendedor']}>
                <Navigate to="/vendedor/dashboard" replace />
              </RoleGuard>
            } />
            <Route path="/vendedor/dashboard" element={
              <RoleGuard rolesPermitidos={['vendedor']}>
                <VendedorDashboard />
              </RoleGuard>
            } />
            <Route path="/vendedor/vender" element={
              <RoleGuard rolesPermitidos={['vendedor']}>
                <Vender />
              </RoleGuard>
            } />
            <Route path="/vendedor/clientes" element={
              <RoleGuard rolesPermitidos={['vendedor']}>
                <VendedorClientes />
              </RoleGuard>
            } />
            <Route path="/vendedor/ventas" element={
              <RoleGuard rolesPermitidos={['vendedor']}>
                <Ventas />
              </RoleGuard>
            } />
            <Route path="/vendedor/facturas" element={
              <RoleGuard rolesPermitidos={['vendedor']}>
                <Factura />
              </RoleGuard>
            } />
            <Route path="/vendedor/historial" element={
              <RoleGuard rolesPermitidos={['vendedor']}>
                <Historial />
              </RoleGuard>
            } />
            <Route path="/vendedor/premios-pagados" element={
              <RoleGuard rolesPermitidos={['vendedor']}>
                <VendedorPremiosPagados />
              </RoleGuard>
            } />

            {/* Rutas de Usuario/Cliente */}
            <Route path="/usuario" element={
              <RoleGuard rolesPermitidos={['usuario_registrado', 'cliente']}>
                <Navigate to="/usuario/dashboard" replace />
              </RoleGuard>
            } />
            <Route path="/usuario/dashboard" element={
              <RoleGuard rolesPermitidos={['usuario_registrado', 'cliente']}>
                <UsuarioDashboard />
              </RoleGuard>
            } />
            <Route path="/usuario/rifas" element={
              <RoleGuard rolesPermitidos={['usuario_registrado', 'cliente']}>
                <RifasActivas />
              </RoleGuard>
            } />
            <Route path="/cliente/dashboard" element={
              <RoleGuard rolesPermitidos={['cliente', 'usuario_registrado']}>
                <ClienteDashboard />
              </RoleGuard>
            } />
            <Route path="/cliente/rifas" element={
              <RoleGuard rolesPermitidos={['cliente', 'usuario_registrado']}>
                <ClienteRifas />
              </RoleGuard>
            } />
            <Route path="/cliente/sorteos" element={
              <RoleGuard rolesPermitidos={['cliente', 'usuario_registrado']}>
                <ClienteSorteos />
              </RoleGuard>
            } />
            <Route path="/cliente/perfil" element={
              <RoleGuard rolesPermitidos={['cliente', 'usuario_registrado']}>
                <ClienteUsuarios />
              </RoleGuard>
            } />
            <Route path="/usuario/perfil" element={
              <RoleGuard rolesPermitidos={['usuario_registrado', 'cliente']}>
                <Perfil />
              </RoleGuard>
            } />
            <Route path="/usuario/historial" element={
              <RoleGuard rolesPermitidos={['usuario_registrado', 'cliente']}>
                <MisRifas />
              </RoleGuard>
            } />
            <Route path="/usuario/transacciones" element={
              <RoleGuard rolesPermitidos={['usuario_registrado', 'cliente']}>
                <Transacciones />
              </RoleGuard>
            } />
            <Route path="/usuario/comprar" element={
              <RoleGuard rolesPermitidos={['usuario_registrado', 'cliente']}>
                <ComprarRifas />
              </RoleGuard>
            } />
            <Route path="/usuario/premios" element={
              <RoleGuard rolesPermitidos={['usuario_registrado', 'cliente']}>
                <MisPremios />
              </RoleGuard>
            } />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
