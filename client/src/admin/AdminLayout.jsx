// src/admin/AdminLayout.jsx
import React, { useContext } from "react";
import Sidebar from "../components/Sidebar";
import { AuthContext } from "../components/AuthContext";
import { Link, Outlet } from "react-router-dom";
import { FaFileAlt } from "react-icons/fa";

export default function AdminLayout() {
  const { logout, user } = useContext(AuthContext);

  // base items (order preserved)
  const baseItems = [
    {
      label: "Dashboard",
      path: "/admin",
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" stroke="currentColor">
          <path d="M3 13h8V3H3v10zM3 21h8v-6H3v6zM13 21h8V11h-8v10zM13 3v6h8V3h-8z" />
        </svg>
      ),
    },
    {
      label: "Sellers",
      path: "/admin/sellers",
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" stroke="currentColor">
          <path d="M12 12a4 4 0 100-8 4 4 0 000 8zM6 20a6 6 0 0112 0" />
        </svg>
      ),
    },
    {
      label: "Properties",
      path: "/admin/properties",
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" stroke="currentColor">
          <path d="M3 9l9-7 9 7v11H3z" />
        </svg>
      ),
    },
    {
      label: "Enquiries",
      path: "/admin/enquiries",
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" stroke="currentColor">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14z" />
        </svg>
      ),
    },
  ];

  // clone so we don't mutate the original
  const items = [...baseItems];

  // Insert "Blogs" directly after "Enquiries" — only for admin users
  if (user?.role === "admin") {
    const insertAfterIndex = items.findIndex((it) => it.path === "/admin/enquiries");
    const blogItem = {
      label: "Blogs",
      path: "/admin/blogs",
      icon: <FaFileAlt className="w-4 h-4" />,
    };

    if (insertAfterIndex >= 0) {
      items.splice(insertAfterIndex + 1, 0, blogItem);
    } else {
      items.push(blogItem);
    }
  }

  const logo = (
    <Link to="/admin" className="flex items-center gap-2">
      <div className="w-8 h-8 bg-black text-white rounded flex items-center justify-center font-bold">C</div>
      <span className="font-semibold">Cleverso</span>
    </Link>
  );

  // mobile logout button shown in topbar (passed to Sidebar)
  const mobileLogout = (
    <button className="px-3 py-1 border rounded text-sm" onClick={logout}>
      Logout
    </button>
  );

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar items={items} logo={logo} rightAction={mobileLogout} />

      {/* Content column:
          - md:pl-64 makes room for the fixed sidebar on desktop
          - overflow-y-auto so content scrolls independently
      */}
      <div className="flex-1 relative overflow-y-auto md:pl-64">
        {/* Desktop header absolute top-right (hidden on mobile) */}
        <header className="hidden md:flex items-center justify-end gap-4 px-6 py-3 absolute top-0 right-0 z-20">
          <span className="text-sm text-gray-700">
            Signed in as <strong>{user?.name}</strong>
          </span>
          <button onClick={logout} className="px-3 py-1 rounded text-sm border cursor-pointer">
            Logout
          </button>
        </header>

        {/* Spacer to account for fixed mobile topbar height */}
        <div className="md:hidden h-14" />

        {/* Main content: md:pt-16 leaves space for the absolute desktop header */}
        <main className="p-6 pt-6 md:pt-16">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
