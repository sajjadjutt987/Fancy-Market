import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import CreateMarketPage from "./pages/CreateMarketPage";
import CalculationPage from "./pages/CalculationPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CreateMarketPage />} />
        <Route path="/market/:marketId" element={<CalculationPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;