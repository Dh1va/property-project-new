import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

/**
 * Sidebar - responsive drawer
 * - mobile: fixed off-canvas drawer (z-50) with overlay (z-40)
 * - md+: fixed left column (not scrolling with page)
 *
 * props:
 * - items, logo, rightAction
 */
export default function Sidebar({ items = [], logo = null, rightAction = null }) {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  // lock body scroll when drawer open on mobile
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => (document.body.style.overflow = prev);
    }
  }, [open]);

  const isActive = (itPath, matchPrefix) =>
    pathname === itPath || (matchPrefix && pathname.startsWith(itPath));

  return (
    <>
      {/* Mobile topbar — fixed so it does not push content */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between bg-white border-b px-3 py-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="truncate">{logo ? <div className="truncate">{logo}</div> : <div className="text-lg font-bold">Dashboard</div>}</div>
        </div>

        <div className="flex items-center gap-2">
          {rightAction && <div className="flex items-center">{rightAction}</div>}

          <button
            className="p-2 rounded-md bg-gray-100"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label="Toggle menu"
          >
            {open ? (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M6 18L18 6M6 6l12 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M3 12h18M3 6h18M3 18h18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Overlay (mobile) */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar:
          - fixed h-full on mobile and desktop (so it stays in place)
          - translate-x for mobile off-canvas behavior
      */}
      <aside
        className={`fixed z-50 top-0 left-0 h-full w-64 bg-white border-r transform transition-transform duration-200
          ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
        aria-label="Sidebar"
      >
        {/* add top padding so items are not hidden under the fixed mobile topbar */}
        <div className="flex flex-col h-full overflow-y-auto pt:0">
          <div className="px-6 py-6 border-b flex items-center justify-between">
            <div className="flex items-center gap-3">
              {logo ? <div>{logo}</div> : <div className="text-xl font-bold">Admin</div>}
            </div>

            {/* close btn only on mobile */}
            <div className="md:hidden">
              {/* <button onClick={() => setOpen(false)} aria-label="Close menu" className="p-1 rounded hover:bg-gray-100">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M6 18L18 6M6 6l12 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button> */}
            </div>
          </div>

          <nav className="px-2 py-4 space-y-1">
            {items.map((it) => {
              const active = isActive(it.path, it.matchPrefix);
              return (
                <Link
                  key={it.path}
                  to={it.path}
                  className={`flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium transition
                    ${active ? "bg-black text-white" : "text-gray-700 hover:bg-gray-100"}`}
                  onClick={() => {
                    setOpen(false); // close drawer on mobile
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  {it.icon ? <span className="w-5 h-5 flex-shrink-0">{it.icon}</span> : <span className="w-5 h-5 rounded bg-gray-200" />}
                  <span className="truncate">{it.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="px-4 py-4 border-t mt-auto">
            <p className="text-xs text-gray-500">© {new Date().getFullYear()} Cleverso</p>
          </div>
        </div>
      </aside>
    </>
  );
}
    