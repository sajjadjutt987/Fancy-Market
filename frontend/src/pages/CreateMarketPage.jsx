import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function CreateMarketPage() {
  const [marketId, setMarketId] = useState("");
  const navigate = useNavigate();

  const handleSubmit = () => {
    if (!marketId.trim()) return;
    navigate(`/market/${marketId.trim()}`);
  };

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <div style={titleStyle}>Fancy Market System</div>

        <div style={sectionTitleStyle}>Create New Market:</div>

        <div style={rowStyle}>
          <div style={labelCellStyle}>Market ID</div>

          <input
            type="text"
            value={marketId}
            onChange={(e) => setMarketId(e.target.value)}
            placeholder="Enter market ID"
            style={inputStyle}
          />

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!marketId.trim()}
            style={{
              ...buttonStyle,
              background: marketId.trim() ? "#2563eb" : "#9ca3af",
              cursor: marketId.trim() ? "pointer" : "not-allowed"
            }}
          >
            Submit
          </button>
        </div>

        <div style={hintStyle}>
          Enter a valid market ID to open the market calculation screen.
        </div>
      </div>
    </div>
  );
}

const pageStyle = {
  minHeight: "100vh",
  background: "#f3f4f6",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "24px",
  boxSizing: "border-box"
};

const cardStyle = {
  width: "100%",
  maxWidth: "980px",
  background: "#ffffff",
  border: "1px solid #cbd5e1",
  borderRadius: "10px",
  padding: "28px",
  boxShadow: "0 4px 14px rgba(0,0,0,0.08)"
};

const titleStyle = {
  fontSize: "30px",
  fontWeight: "700",
  color: "#111827",
  marginBottom: "24px"
};

const sectionTitleStyle = {
  fontSize: "20px",
  fontWeight: "700",
  color: "#1f2937",
  marginBottom: "16px"
};

const rowStyle = {
  display: "grid",
  gridTemplateColumns: "180px 1fr 140px",
  gap: "12px",
  alignItems: "center"
};

const labelCellStyle = {
  fontSize: "28px",
  fontWeight: "700",
  color: "#111827"
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "12px 14px",
  fontSize: "24px",
  border: "1px solid #94a3b8",
  borderRadius: "4px",
  background: "#dcead4"
};

const buttonStyle = {
  border: "none",
  color: "#ffffff",
  borderRadius: "6px",
  padding: "12px 18px",
  fontSize: "22px",
  fontWeight: "700"
};

const hintStyle = {
  marginTop: "14px",
  fontSize: "14px",
  color: "#6b7280"
};

export default CreateMarketPage;