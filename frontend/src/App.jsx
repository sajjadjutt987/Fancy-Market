import React from "react";
import { Routes, Route } from "react-router-dom";
import CreateMarketPage from "./pages/CreateMarketPage";
import CalculationPage from "./pages/CalculationPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<CreateMarketPage />} />
      <Route path="/event/:eventId" element={<CalculationPage />} />
    </Routes>
  );
}

export default App;