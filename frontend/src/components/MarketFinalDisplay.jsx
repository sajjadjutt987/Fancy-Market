import React from "react";

function MarketFinalDisplay({ result }) {
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #d1d5db",
        borderRadius: "8px",
        padding: "16px"
      }}
    >
      <div style={{ fontWeight: "bold", marginBottom: "10px" }}>
        Final Display
      </div>

      <pre style={{ whiteSpace: "pre-wrap" }}>
        {result ? JSON.stringify(result, null, 2) : "No calculation yet"}
      </pre>
    </div>
  );
}

export default MarketFinalDisplay;