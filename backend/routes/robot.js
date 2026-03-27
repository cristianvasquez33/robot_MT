const express = require("express");
const router = express.Router();

const { ejecutar } = require("../orangepi");

router.get("/adelante", async (req, res) => {
    const r = await ejecutar("python3 /home/dvcun/control/control.py adelante");
    res.json({ estado: "ok", r });
});

router.get("/atras", async (req, res) => {
    const r = await ejecutar("python3 /home/dvcun/control/control.py atras");
    res.json({ estado: "ok", r });
});

module.exports = router;