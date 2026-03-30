// src/components/Joystick.js

// import React from "react";
// import { Joystick } from "react-joystick-component";

// const JoystickControl = ({ onMove, onStop }) => {
//     return (
//         <div style={{ marginTop: "50px" }}>
//             <Joystick
//                 size={100}
//                 baseColor="#eee"
//                 stickColor="#333"
//                 move={(e) => onMove(e)}
//                 stop={onStop}
//             />
//         </div>
//     );
// };

// export default JoystickControl;

// src/components/Joystick.js

// src/components/Joystick.js

import React, { useState } from "react";
import { Joystick } from "react-joystick-component";
import "../styles/joystick.css";

const JoystickControl = ({ onMove, onStop }) => {

    const [pos, setPos] = useState({ x: 0, y: 0 });
    const [distance, setDistance] = useState(0);

    const handleMove = (e) => {
        console.log("EVENTO:", e);

        setPos({ x: e.x, y: e.y });
        setDistance(e.distance || 0);

        onMove(e);
    };


    // const currentDirection = pos.x === 0 && pos.y === 0
    //     ? "CENTER"
    //     : (
    //         Math.abs(pos.x) > Math.abs(pos.y)
    //             ? (pos.x > 0 ? "RIGHT" : "LEFT")
    //             : (pos.y > 0 ? "UP" : "DOWN")
    //     );

    const getDirection = (x, y) => {

        if (x === 0 && y === 0) return "CENTER";

        const angle = Math.atan2(y, x) * (180 / Math.PI);

        if (angle >= -22.5 && angle < 22.5) return "RIGHT";
        if (angle >= 22.5 && angle < 67.5) return "UP_RIGHT";
        if (angle >= 67.5 && angle < 112.5) return "UP";
        if (angle >= 112.5 && angle < 157.5) return "UP_LEFT";
        if (angle >= 157.5 || angle < -157.5) return "LEFT";
        if (angle >= -157.5 && angle < -112.5) return "DOWN_LEFT";
        if (angle >= -112.5 && angle < -67.5) return "DOWN";
        if (angle >= -67.5 && angle < -22.5) return "DOWN_RIGHT";

        return "CENTER";
    };

    const currentDirection = getDirection(pos.x, pos.y);


    const handleStop = () => {
        setPos({ x: 0, y: 0 });
        setDistance(0);
        onStop();
    };

    const visualX = pos.x * 50;
    const visualY = pos.y * -50;
    const intensity = Math.min(distance / 100, 1);
    const glowColor = `rgb(${Math.round(255 * intensity)}, 0, ${Math.round(255 * (1 - intensity))})`;
    return (
        <div className="joystick-wrapper">

            <div className="radar">

                {/* 🔥 capa visual */}
                <div className="visual-layer">
                    <div className="center-dot"></div>
                    <div className={`direction up ${currentDirection === "UP" ? "active" : ""}`}>↑</div>
                    <div className={`direction down ${currentDirection === "DOWN" ? "active" : ""}`}>↓</div>
                    <div className={`direction left ${currentDirection === "LEFT" ? "active" : ""}`}>←</div>
                    <div className={`direction right ${currentDirection === "RIGHT" ? "active" : ""}`}>→</div>

                    {/* diagonales */}
                    <div className={`direction up-right ${currentDirection === "UP_RIGHT" ? "active" : ""}`}>↗</div>
                    <div className={`direction up-left ${currentDirection === "UP_LEFT" ? "active" : ""}`}>↖</div>
                    <div className={`direction down-right ${currentDirection === "DOWN_RIGHT" ? "active" : ""}`}>↘</div>
                    <div className={`direction down-left ${currentDirection === "DOWN_LEFT" ? "active" : ""}`}>↙</div>
                    <div
                        className="indicator"
                        style={{
                            transform: `translate(${visualX}px, ${visualY}px)`,
                            background: glowColor,
                            boxShadow: `0 0 ${10 + intensity * 20}px ${glowColor}`
                        }}
                    ></div>
                </div>

                {/* 🔥 joystick REAL */}
                <div className="joystick-hitbox">
                    <Joystick
                        size={150}
                        baseColor="rgba(0,0,0,0.05)"   // 👈 leve visible
                        stickColor="rgba(0,0,0,0.2)"
                        move={handleMove}
                        stop={handleStop}
                    />
                </div>

            </div>

            <div className="info">
                <p>X: {pos.x.toFixed(2)}</p>
                <p>Y: {pos.y.toFixed(2)}</p>
                <p>Fuerza: {Math.round(distance)}</p>
            </div>

        </div>
    );
};

export default JoystickControl;