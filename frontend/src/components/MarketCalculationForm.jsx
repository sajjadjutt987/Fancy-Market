import React from "react";

function MarketCalculationForm({ fetchedMarket }) {
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
        Market Calculation Form
      </div>

      <pre style={{ whiteSpace: "pre-wrap" }}>
        {fetchedMarket ? JSON.stringify(fetchedMarket, null, 2) : "No market fetched yet"}
      </pre>
    </div>
  );
}

export default MarketCalculationForm;