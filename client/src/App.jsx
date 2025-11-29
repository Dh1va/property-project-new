// src/App.jsx
import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";

/* Public pages */
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import Buy from "./pages/Buy";
import Contact from "./pages/Contact";
import PropertyDetails from "./pages/PropertyDetails";
import PropertyListPage from "./pages/PropertyListPage";

/* Auth & protection */
import ProtectedRoute from "./components/ProtectedRoute";

/* Admin area (nested) */
import AdminLogin from "./admin/AdminLogin";
import AdminLayout from "./admin/AdminLayout";
import AdminHome from "./admin/AdminHome";
import ManageSellers from "./admin/ManageSellers";
import ManageProperties from "./admin/ManageProperties";
// import AdminEnquiries from "./admin/AdminEnquiries"; // create this when ready

/* Seller area (nested) */
import SellerLogin from "./seller/SellerLogin";
import SellerLayout from "./seller/SellerLayout";
import SellerDashboard from "./seller/SellerDashboard";
import MyProperties from "./seller/MyProperties";

/* Shared property form (create + edit) */
import SharedPropertyForm from "./shared/PropertyForm";
import AdminEnquiries from "./admin/AdminEnquires";
import SellerRegister from "./seller/SellerRegister";

/* 404 */
const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-3xl font-bold mb-4">404 — Page Not Found</h1>
      <p className="text-gray-600">The page you requested does not exist.</p>
    </div>
  </div>
);

/* Helper: hide public shell for admin/seller routes */
function isAdminOrSellerPath(pathname) {
  if (!pathname) return false;
  const p = pathname.toLowerCase();
  return p === "/admin" || p.startsWith("/admin/") || p === "/seller" || p.startsWith("/seller/");
}

export default function AppWrapper() {
  const { pathname } = useLocation();
  const hidePublicShell = isAdminOrSellerPath(pathname);

  return (
    <>
      <ScrollToTop />
      {!hidePublicShell && <Navbar />}

      <Routes>
        {/* Public */}
        <Route path="/" element={<Buy />} />
        <Route path="/buy" element={<Buy />} />
        <Route path="/property/:id" element={<PropertyDetails />} />
        <Route path="/properties/:category" element={<PropertyListPage />} />
        <Route path="/contact" element={<Contact />} />

        {/* Admin nested */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute role="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminHome />} />
          <Route path="sellers" element={<ManageSellers />} />
          <Route path="properties" element={<ManageProperties />} />
          <Route path="properties/new" element={<SharedPropertyForm redirectTo="/admin/properties" />} />
          <Route path="properties/:id" element={<SharedPropertyForm redirectTo="/admin/properties" />} />
          <Route path="enquiries" element={<AdminEnquiries />} />
        </Route>

        {/* Seller nested */}
        <Route path="/seller/login" element={<SellerLogin />} />
        <Route path="/seller/register" element={<SellerRegister />} />

        <Route
          path="/seller/*"
          element={
            <ProtectedRoute role="seller">
              <SellerLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<SellerDashboard />} />
          <Route path="properties" element={<MyProperties />} />
          <Route path="properties/new" element={<SharedPropertyForm redirectTo="/seller/properties" />} />
          <Route path="properties/:id" element={<SharedPropertyForm redirectTo="/seller/properties" />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>

      {!hidePublicShell && <Footer />}
    </>
  );
}
