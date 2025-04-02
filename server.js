require("dotenv").config();
const cookieParser = require("cookie-parser");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const potionsRouter = require("./routes/potions");
const analyticsRouter = require("./routes/analytics");
const sanitizeMiddleware = require("sanitize").middleware;
const authMiddleware = require("./authMiddleware");
const swaggerView = require("./swagger");
const authRouter = require("./routes/auth");
const app = express();

app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.use(sanitizeMiddleware);

app.use("/auth", authRouter);
app.use("/potions", potionsRouter);
app.use("/analytics", analyticsRouter);
app.use("/api-docs", swaggerView);

mongoose
.connect(process.env.MONGO_URI)
.then(() => console.log("Connecté à MongoDB"))
.catch((err) => console.error("Erreur MongoDB :", err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});
