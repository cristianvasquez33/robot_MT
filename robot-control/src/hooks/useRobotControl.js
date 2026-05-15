// src/hooks/useRobotControl.js

import { useRef } from "react";

import {
    move,
    stop
} from "../api/robotApi";

export const useRobotControl = () => {

    const lastSend = useRef(0);

    const handleMove = (event) => {

        const now = Date.now();

        // ============================================
        // LIMITAR FRECUENCIA
        // ============================================

        if (now - lastSend.current < 50)
            return;

        lastSend.current = now;

        // ============================================
        // NORMALIZADO -1 A 1
        // ============================================

        let x = event.x;
        let y = event.y;

        // fuerza 0-100
        let f = event.distance || 0;

        // ============================================
        // PRECISION
        // ============================================

        x = Number(x.toFixed(2));
        y = Number(y.toFixed(2));

        f = Math.round(f);

        // ============================================
        // DEAD ZONE
        // ============================================

        const DEAD_ZONE = 0.05;

        if (Math.abs(x) < DEAD_ZONE)
            x = 0;

        if (Math.abs(y) < DEAD_ZONE)
            y = 0;

        // ============================================
        // CMD
        // ============================================

        const comando =
            `x=${x}&y=${y}&f=${f}`;

        console.log(
            "🎮 CMD:",
            comando
        );

        move(comando);
    };

    // ============================================
    // STOP
    // ============================================

    const handleStop = () => {

        console.log("🛑 STOP");

        stop();
    };

    return {

        handleMove,

        handleStop
    };
};