// src/hooks/useRobotControl.js

import { useRef } from "react";
import { move, stop } from "../api/robotApi";

export const useRobotControl = () => {

    const lastSend = useRef(0);

    const handleMove = (event) => {

        const now = Date.now();

        if (now - lastSend.current < 100) return;
        lastSend.current = now;

        let x = event.x * 100;
        let y = event.y * 100;

        // 🔥 mantener precisión
        x = Number(x.toFixed(1));
        y = Number(y.toFixed(1));

        // 🔥 zona muerta
        const DEAD_ZONE = 5;

        if (Math.abs(x) < DEAD_ZONE) x = 0;
        if (Math.abs(y) < DEAD_ZONE) y = 0;

        console.log("LOGICA → X:", x, "Y:", y);

        move(x, y);
    };

    const handleStop = () => {
        console.log("LOGICA → STOP");
        stop();
    };

    return {
        handleMove,
        handleStop
    };
};