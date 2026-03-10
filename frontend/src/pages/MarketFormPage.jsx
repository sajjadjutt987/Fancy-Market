import React, { useState } from "react";
import CreateMarketPanel from "../components/CreateMarketPanel";
import MarketCalculationForm from "../components/MarketCalculationForm";
import MarketFinalDisplay from "../components/MarketFinalDisplay";

function MarketFormPage() {
  const [fetchedMarket, setFetchedMarket] = useState(null);
  const [calculatedResult, setCalculatedResult] = useState(null);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f3f4f6",
        padding: "20px",
        boxSizing: "border-box"
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto"
        }}
      >
        <h1
          style={{
            marginTop: 0,
            marginBottom: "20px",
            fontSize: "28px",
            fontWeight: "bold",
            color: "#111827"
          }}
        >
          Fancy Market System
        </h1>

        <div
          style={{
            display: "grid",
            gap: "20px"
          }}
        >
          <CreateMarketPanel onMarketFetched={setFetchedMarket} />

          <MarketCalculationForm
            fetchedMarket={fetchedMarket}
            onCalculated={setCalculatedResult}
          />

          <MarketFinalDisplay result={calculatedResult} />
        </div>
      </div>
    </div>
  );
}

export default MarketFormPage;