// const express = require("express");
// const router = express.Router();

// //const { ejecutar } = require("../orangepi");

// const ESP32_URL = "http://192.168.100.114";

// router.get("/adelante", async (req, res) => {
//     const r = await ejecutar("python3 /home/dvcun/control/control.py adelante");
//     res.json({ estado: "ok", r });
// });

// router.get("/atras", async (req, res) => {
//     const r = await ejecutar("python3 /home/dvcun/control/control.py atras");
//     res.json({ estado: "ok", r });
// });

// module.exports = router;

const express = require("express");
const router = express.Router();

const ESP32_URL = "http://192.168.100.103";

let lastCommandTime = Date.now();
let lastSend = 0;

// 🚀 MOVE
router.get("/move", async (req, res) => {

    // 🔥 registrar actividad
    lastCommandTime = Date.now();

    // 🔥 AUTO STOP
    setTimeout(async () => {
        if (Date.now() - lastCommandTime > 200) {
            console.log("AUTO STOP");
            try {
                await fetch(`${ESP32_URL}/stop`);
            } catch (e) {}
        }
    }, 250);

    // 🔥 limitar frecuencia
    const now = Date.now();
    if (now - lastSend < 80) {
        return res.json({ ok: true });
    }
    lastSend = now;

    let x = parseFloat(req.query.x || 0);
    let y = parseFloat(req.query.y || 0);

    // 🔥 ESCALA
    x = x * 8;
    y = y * 8;

    console.log("RAW:", x, y);

    // 🔥 DEAD ZONE
    if (Math.abs(x) < 2 && Math.abs(y) < 2) {
        await fetch(`${ESP32_URL}/stop`);
        return res.json({ ok: true });
    }

    // =========================
    // 🔥 CONTROL POR ÁNGULO
    // =========================
    let angle = Math.atan2(y, x);
    let magnitude = Math.sqrt(x * x + y * y);

    magnitude = Math.min(100, magnitude);

    let left = magnitude * Math.sin(angle + Math.PI / 4);
    let right = magnitude * Math.sin(angle - Math.PI / 4);

    // 🔥 NORMALIZAR
    left = Math.max(-100, Math.min(100, left));
    right = Math.max(-100, Math.min(100, right));

    // 🔥 PWM
    let fl = Math.abs(left) * 2.5;
    let rl = Math.abs(left) * 2.5;
    let fr = Math.abs(right) * 2.5;
    let rr = Math.abs(right) * 2.5;

    // 🔥 MINIMO SOLO SI AVANZA
    const esGiro = Math.abs(y) < 5;
    const MIN_PWM = esGiro ? 0 : 90;

    fl = fl > 0 ? fl + MIN_PWM : 0;
    rl = rl > 0 ? rl + MIN_PWM : 0;
    fr = fr > 0 ? fr + MIN_PWM : 0;
    rr = rr > 0 ? rr + MIN_PWM : 0;

    fl = Math.round(fl);
    rl = Math.round(rl);
    fr = Math.round(fr);
    rr = Math.round(rr);

    console.log("PWM:", fl, rl, fr, rr);

    try {

        if (y >= 0) {
            await fetch(`${ESP32_URL}/adelante?fl=${fl}&rl=${rl}&fr=${fr}&rr=${rr}`);
        } else {
            await fetch(`${ESP32_URL}/atras?fl=${fl}&rl=${rl}&fr=${fr}&rr=${rr}`);
        }

        res.json({ ok: true });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "ESP32 no responde" });
    }
});

// 🛑 STOP
router.get("/stop", async (req, res) => {
    try {
        await fetch(`${ESP32_URL}/stop`);
        res.json({ ok: true });
    } catch {
        res.status(500).json({ error: "Error en stop" });
    }
});

module.exports = router;