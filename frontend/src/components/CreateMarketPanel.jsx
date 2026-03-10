import React, { useState } from "react";
import api from "../services/api";

function CreateMarketPanel({ onMarketFetched }) {
  const [marketId, setMarketId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFetchMarket = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(`/markets/source/${marketId}`);

      if (onMarketFetched) {
        onMarketFetched(response.data.data);
      }
    } catch (err) {
      setError("Unable to fetch market data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #d1d5db",
        borderRadius: "8px",
        padding: "16px"
      }}
    >
      <div
        style={{
          fontWeight: "bold",
          marginBottom: "12px"
        }}
      >
        Create New Market:
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "180px 220px 120px",
          gap: "10px",
          alignItems: "center"
        }}
      >
        <div style={{ fontSize: "28px", color: "#111827" }}>Market ID</div>

        <input
          type="text"
          value={marketId}
          onChange={(e) => setMarketId(e.target.value)}
          placeholder="Enter market ID"
          style={{
            padding: "10px 12px",
            border: "1px solid #9ca3af",
            borderRadius: "4px",
            fontSize: "24px",
            background: "#dcead4"
          }}
        />

        <button
          type="button"
          onClick={handleFetchMarket}
          disabled={loading || !marketId.trim()}
          style={{
            padding: "10px 14px",
            border: "1px solid #9ca3af",
            borderRadius: "4px",
            background: "#ffffff",
            cursor: loading || !marketId.trim() ? "not-allowed" : "pointer",
            fontSize: "24px"
          }}
        >
          {loading ? "..." : "Submit"}
        </button>
      </div>

      {error ? (
        <div style={{ marginTop: "10px", color: "#b91c1c", fontSize: "14px" }}>
          {error}
        </div>
      ) : null}
    </div>
  );
}

export default CreateMarketPanel;