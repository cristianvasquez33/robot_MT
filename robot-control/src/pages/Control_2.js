// src/pages/Control.js

import React, { useRef } from "react";
import JoystickControl from "../components/Joystick";
//import { adelante, atras, stop } from "../api/robotApi";

import { move, stop } from "../api/robotApi";
// const Control = () => {

//     const lastSend = useRef(0);

//     // 🔥 para evitar ruido
//     let lastX = useRef(0);
//     let lastY = useRef(0);

//     // 🔥 control de stop continuo
//     let stopInterval = useRef(null);

//     const handleMove = (event) => {

//         const now = Date.now();

//         // 🔥 limitar frecuencia (mejorado)
//         if (now - lastSend.current < 100) return;
//         lastSend.current = now;

//         let x = Math.round(event.x);
//         let y = Math.round(event.y);

//         // 🔥 filtro de ruido (muy importante)
//         // if (Math.abs(x - lastX.current) < 5 && Math.abs(y - lastY.current) < 5) {
//         //     return;
//         // }

//         lastX.current = x;
//         lastY.current = y;

//         // 🔥 detener interval de stop si estaba activo
//         if (stopInterval.current) {
//             clearInterval(stopInterval.current);
//             stopInterval.current = null;
//         }

//         // 🔥 MEZCLA DIFERENCIAL (CORRECTA)
//         let left = y + x;
//         let right = y - x;
//         console.log("MOVE", x, y);
//         // 🔥 normalizar
//         left = Math.max(-100, Math.min(100, left));
//         right = Math.max(-100, Math.min(100, right));

//         // 🔥 convertir a PWM
//         let fl = Math.abs(left) * 2.5;
//         let rl = Math.abs(left) * 2.5;
//         let fr = Math.abs(right) * 2.5;
//         let rr = Math.abs(right) * 2.5;

//         if (y >= 0) {
//             adelante(fl, rl, fr, rr);
//         } else {
//             atras(fl, rl, fr, rr);
//         }
//     };

//     const handleStop = () => {

//         // limpiar si ya había uno
//         if (stopInterval.current) {
//             clearInterval(stopInterval.current);
//         }

//         // 🔥 enviar varios stop (SOLUCIÓN CLAVE)
//         stopInterval.current = setInterval(() => {
//             stop();
//         }, 50);

//         // detener después de 300 ms
//         setTimeout(() => {
//             if (stopInterval.current) {
//                 clearInterval(stopInterval.current);
//                 stopInterval.current = null;
//             }
//         }, 300);
//     };

//     return (
//         <div style={{ textAlign: "center" }}>
//             <h1>🤖 Control Robot</h1>
//             <JoystickControl onMove={handleMove} onStop={handleStop} />
//         </div>
//     );
// };


const Control = () => {

    const lastSend = useRef(0);

    const handleMove = (event) => {

        const now = Date.now();
        if (now - lastSend.current < 100) return;
        lastSend.current = now;

        let x = Math.round(event.x);
        let y = Math.round(event.y);

        console.log("MOVE:", x, y);

        move(x, y);
    };

    // ✅ SOLO usamos el stop importado
    const handleStop = () => {
        stop();
    };

    return (
        <div style={{ textAlign: "center" }}>
            <h1>🤖 Control --------Robot</h1>
            <JoystickControl onMove={handleMove} onStop={handleStop} />
        </div>
    );
};

export default Control;