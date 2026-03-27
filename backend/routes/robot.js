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
const fetch = require("node-fetch");

// 🔥 IP DEL ESP32
const ESP32_URL = "http://192.168.100.114";
let enMovimiento = false;
// 🔥 curva suave (tipo lógica difusa simple)
const curva = (v) => {
    let sign = v >= 0 ? 1 : -1;
    return sign * (v * v / 100);
};

// 🚀 MOVE
router.get("/move", async (req, res) => {

    let x = parseFloat(req.query.x || 0);
    let y = parseFloat(req.query.y || 0);

    // 🔥 DEAD ZONE (MUY IMPORTANTE)
    if (Math.abs(x) < 1 && Math.abs(y) < 1) {
        console.log("STOP por zona muerta");

        await fetch(`${ESP32_URL}/stop`);

        return res.json({ ok: true, stop: true });
    }

    console.log("RAW:", x, y);

    // 🔥 suavizar joystick
    x = curva(x);
    y = curva(y);

    // 🔥 menos giro si va rápido (clave)
    let factorGiro = 1 - Math.abs(y) / 100;
    x = x * factorGiro;

    // 🔥 mezcla diferencial
    let left = y + x;
    let right = y - x;

    left = Math.max(-100, Math.min(100, left));
    right = Math.max(-100, Math.min(100, right));

    // 🔥 PWM
    let fl = Math.abs(left) * 2.5;
    let rl = Math.abs(left) * 2.5;
    let fr = Math.abs(right) * 2.5;
    let rr = Math.abs(right) * 2.5;

    // 🔥 mínimo para mover motor
    const MIN_PWM = 80;

    fl = fl > 0 ? fl + MIN_PWM : 0;
    rl = rl > 0 ? rl + MIN_PWM : 0;
    fr = fr > 0 ? fr + MIN_PWM : 0;
    rr = rr > 0 ? rr + MIN_PWM : 0;

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
        console.log("Conectando a ESP32...");

        const response = await fetch(`${ESP32_URL}/stop`);

        const text = await response.text();

        console.log("RESPUESTA ESP32:", text);

        res.json({ ok: true });
    } catch {
        console.error("ERROR REAL:", err);
        res.status(500).json({ error: "Error en stop" });
    }
});

module.exports = router;