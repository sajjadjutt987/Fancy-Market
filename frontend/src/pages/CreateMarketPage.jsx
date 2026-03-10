import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function CreateMarketPage() {
  const [eventId, setEventId] = useState("");
  const navigate = useNavigate();

  const handleSubmit = () => {
    if (!eventId.trim()) return;
    navigate(`/event/${eventId.trim()}`);
  };

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <div style={titleStyle}>Fancy Market System</div>
        <div style={subTitleStyle}>Enter Event ID</div>

        <div style={rowStyle}>
          <div style={labelStyle}>Event ID</div>

          <input
            type="text"
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
            placeholder="Enter event ID"
            style={inputStyle}
          />

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!eventId.trim()}
            style={{
              ...buttonStyle,
              opacity: !eventId.trim() ? 0.6 : 1,
              cursor: !eventId.trim() ? "not-allowed" : "pointer"
            }}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}

const pageStyle = {
  minHeight: "100vh",
  background: "#f3f4f6",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "24px",
  boxSizing: "border-box"
};

const cardStyle = {
  width: "100%",
  maxWidth: "900px",
  background: "#ffffff",
  border: "1px solid #d1d5db",
  borderRadius: "12px",
  padding: "28px"
};

const titleStyle = {
  fontSize: "30px",
  fontWeight: "800",
  color: "#111827",
  marginBottom: "10px"
};

const subTitleStyle = {
  fontSize: "20px",
  fontWeight: "700",
  color: "#374151",
  marginBottom: "18px"
};

const rowStyle = {
  display: "grid",
  gridTemplateColumns: "180px 1fr 140px",
  gap: "12px",
  alignItems: "center"
};

const labelStyle = {
  fontSize: "28px",
  fontWeight: "700",
  color: "#111827"
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "12px 14px",
  fontSize: "24px",
  border: "1px solid #9ca3af",
  borderRadius: "6px",
  background: "#dcead4"
};

const buttonStyle = {
  border: "none",
  background: "#2563eb",
  color: "#ffffff",
  borderRadius: "8px",
  padding: "12px 16px",
  fontSize: "20px",
  fontWeight: "700"
};

export default CreateMarketPage;