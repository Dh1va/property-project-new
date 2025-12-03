// src/components/EnquiryFormPanel.jsx
import React, { useEffect, useState } from "react";
import API from "../services/api";

/**
 * EnquiryFormPanel
 *
 * Props:
 * - propertyTitle (string)
 * - propertyId (string)
 * - propertyRef (string)
 * - agentPhone (string)  // ignored now, we use fixed number
 */
export default function EnquiryFormPanel({
  propertyTitle = "",
  propertyId = "",
  propertyRef = "",
  agentPhone = "",
}) {
  const FIXED_AGENT_PHONE = "+91 95003 06566";

  // helper to build suggested text
  const buildSuggested = (title, ref) => {
    const t = title ? `${title}` : "the property";
    const r = ref ? ` (Ref: ${ref})` : "";
    return `Hi, I'm interested in ${t}${r}. Please contact me.`;
  };

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    // default message is the predefined message
    message: buildSuggested(propertyTitle, propertyRef),
  });
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");

  // If propertyTitle/propertyRef change and user hasn't edited message, update it.
  useEffect(() => {
    setForm((s) => {
      const currentSuggestion = buildSuggested(propertyTitle, propertyRef);
      if (!s.message || s.message.startsWith("Hi, I'm interested")) {
        return { ...s, message: currentSuggestion };
      }
      return s;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyTitle, propertyRef]);

  const handleChange = (e) =>
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const getPredefinedMessage = () => buildSuggested(propertyTitle, propertyRef);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("");
    if (!form.name || !form.email || !form.message) {
      setStatus("Please fill Name, Email and Message.");
      return;
    }

    setBusy(true);
    try {
      const payload = {
        ...form,
        propertyTitle: propertyTitle || undefined,
        propertyId: propertyId || undefined,
        propertyRef: propertyRef || undefined,
      };
      const res = await API.post("/enquiry", payload);
      if (res?.data?.success) {
        setStatus(`Sent — ref ${res.data.refNumber || "N/A"}`);
        setForm({
          name: "",
          email: "",
          phone: "",
          message: buildSuggested(propertyTitle, propertyRef),
        });
      } else {
        setStatus("Failed to send enquiry.");
      }
    } catch (err) {
      console.error("enquiry send error:", err);
      setStatus(err?.response?.data?.message || "Server error");
    } finally {
      setBusy(false);
    }
  };

  const handleWhatsApp = () => {
    const text = form.message?.trim() || getPredefinedMessage();
    const raw = FIXED_AGENT_PHONE.replace(/[^\d]/g, ""); // +919500306566
    const url = `https://wa.me/${raw}?text=${encodeURIComponent(
      `${text}\n\nName: ${form.name || ""}\nPhone: ${form.phone || ""}\nEmail: ${
        form.email || ""
      }\nProperty: ${propertyTitle || ""}${
        propertyRef ? ` (Ref: ${propertyRef})` : ""
      }`
    )}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleCall = () => {
    const raw = FIXED_AGENT_PHONE;
    window.location.href = `tel:${raw}`;
  };

  // Icons
  const UserSvg = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      className="w-5 h-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
      />
    </svg>
  );

  const EmailSvg = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      className="w-5 h-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
      />
    </svg>
  );

  const CallSvg = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      className="w-5 h-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"
      />
    </svg>
  );

  const MessageSvg = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      className="w-5 h-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 0 1 1.037-.443 48.282 48.282 0 0 0 5.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
      />
    </svg>
  );

  return (
    <div className="rounded-2xl">
      {/* Card: white bg */}
      <div className="bg-white text-gray-900 rounded-2xl shadow-md p-6">
        <div className="mb-3">
          <h3 className="text-lg font-semibold">Interested in this property?</h3>
        
            
          
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {/* NAME */}
          <label className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-[#EDEAE3]">
              <UserSvg />
            </span>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Your name"
              required
              className="flex-1 bg-[#EDEAE3] text-gray-900 placeholder-gray-600 px-4 py-3 rounded-full outline-none text-sm"
            />
          </label>

          {/* EMAIL */}
          <label className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-[#EDEAE3]">
              <EmailSvg />
            </span>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email address"
              required
              className="flex-1 bg-[#EDEAE3] text-gray-900 placeholder-gray-600 px-4 py-3 rounded-full outline-none text-sm"
            />
          </label>

          {/* PHONE */}
          <label className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-[#EDEAE3]">
              <CallSvg />
            </span>
            <input
              name="phone"
              required
              value={form.phone}
              onChange={handleChange}
              placeholder="Phone"
              className="flex-1 bg-[#EDEAE3] text-gray-900 placeholder-gray-600 px-4 py-3 rounded-full outline-none text-sm"
            />
          </label>

          {/* MESSAGE */}
          <label className="flex items-start gap-3">
            <span className="inline-flex items-start justify-center w-11 h-11 rounded-full bg-[#EDEAE3] pt-3">
              <MessageSvg />
            </span>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              rows={4}
              className="flex-1 bg-[#EDEAE3] text-gray-900 placeholder-gray-600 px-4 py-3 rounded-2xl outline-none text-sm resize-none"
            />
          </label>

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={busy}
            className="w-full bg-gray-900 text-white font-semibold py-3 rounded-full cursor-pointer hover:brightness-95 transition"
          >
            {busy ? "Sending…" : "Send Inquiry"}
          </button>

          {/* WhatsApp + Call row */}
          <div className="mt-2 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleWhatsApp}
              className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-full bg-green-600 text-white font-medium hover:brightness-95 transition cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 16 16"
                fill="currentColor"
              >
                <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232" />
              </svg>
              <span className="text-sm">WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={handleCall}
              className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-full font-medium text-sm transition bg-white/90 border text-gray-900 cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"
                />
              </svg>
              <span>Call</span>
            </button>
          </div>

          {status && (
            <p className="text-sm text-gray-600 mt-3 text-center break-words">
              {status}
            </p>
          )}

          <p className="text-xs text-gray-400 mt-2 text-center">
            By contacting you agree to be contacted regarding this property.
          </p>
        </form>
      </div>
    </div>
  );
}
