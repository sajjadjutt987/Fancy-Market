const express = require("express");
const cors = require("cors");
const marketRoutes = require("./routes/market.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Backend is running"
  });
});

app.use("/api/markets", marketRoutes);

module.exports = app;