import React, { useRef } from "react";
import JoystickControl from "../components/Joystick";
import { adelante, atras, stop } from "../api/robotApi";

const Control = () => {

    // 🔥 CORRECTO (persistente)
    const lastSend = useRef(0);

    // const handleMove = (event) => {

    //     const now = Date.now();

    //     // 🔥 LIMITAR ENVÍOS (MEJOR 150 ms)
    //     if (now - lastSend.current < 150) return;
    //     lastSend.current = now;

    //     const y = event.y;
    //     const x = event.x;

    //     let base = Math.abs(y) * 2;

    //     let fl = base + 90;
    //     let rl = base + 90;
    //     let fr = base + 90;
    //     let rr = base + 90;

    //     // 🎮 lógica de giro
    //     if (x > 0) {
    //         fr -= x;
    //         rr -= x;
    //     } else {
    //         fl += x;
    //         rl += x;
    //     }

    //     // límites
    //     fl = Math.max(0, Math.min(255, fl));
    //     rl = Math.max(0, Math.min(255, rl));
    //     fr = Math.max(0, Math.min(255, fr));
    //     rr = Math.max(0, Math.min(255, rr));

    //     if (y > 0) {
    //         adelante(fl, rl, fr, rr);
    //     } else {
    //         atras(fl, rl, fr, rr);
    //     }
    // };


const handleMove = (event) => {

    const now = Date.now();
    if (now - lastSend.current < 150) return;
    lastSend.current = now;

    let x = event.x; // giro (-100 a 100)
    let y = event.y; // avance (-100 a 100)

    // 🔥 MEZCLA DIFERENCIAL
    let left = y + x;
    let right = y - x;

    // 🔥 NORMALIZAR
    left = Math.max(-100, Math.min(100, left));
    right = Math.max(-100, Math.min(100, right));

    // 🔥 ESCALAR A PWM
    let fl = Math.abs(left) * 85;
    let rl = Math.abs(left) * 85;
    let fr = Math.abs(right) * 85;
    let rr = Math.abs(right) * 85;

    if (y >= 0) {
        adelante(fl, rl, fr, rr);
    } else {
        atras(fl, rl, fr, rr);
    }
};



    const handleStop = () => {
        stop();
    };

    return (
        <div style={{ textAlign: "center" }}>
            <h1>🤖 Control Robot</h1>
            <JoystickControl onMove={handleMove} onStop={handleStop} />
        </div>
    );
};

export default Control;