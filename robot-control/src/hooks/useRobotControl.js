// src/hooks/useRobotControl.js

// src/hooks/useRobotControl.js

import { useRef } from "react";
import { move, stop } from "../api/robotApi";

export const useRobotControl = () => {

    const lastSend = useRef(0);

    const handleMove = (event) => {

        const now = Date.now();

        // 🔥 limitar frecuencia (~20 Hz)
        if (now - lastSend.current < 50) return;
        lastSend.current = now;

        let x = event.x * 100;
        let y = event.y * 100;
        let f = event.distance;

        // precisión
        x = Number(x.toFixed(1));
        y = Number(y.toFixed(1));
        f = Math.round(f);

        // zona muerta
        const DEAD_ZONE = 5;

        if (Math.abs(x) < DEAD_ZONE) x = 0;
        if (Math.abs(y) < DEAD_ZONE) y = 0;

        const comando = `x=${x}&y=${y}&f=${f}`;

        console.log("🎮 CMD:", comando);

        move(comando);
    };

    const handleStop = () => {
        console.log("🛑 STOP");
        stop();
    };

    return {
        handleMove,
        handleStop
    };
};