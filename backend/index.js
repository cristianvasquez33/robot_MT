const express = require("express");
const cors = require("cors");

const robotRoutes = require("./routes/robot");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/robot", robotRoutes);

app.listen(3001, () => {
    console.log("http://localhost:3001/robot ");
});