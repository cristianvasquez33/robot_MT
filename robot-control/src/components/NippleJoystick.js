import React, { useEffect, useRef } from "react";
import nipplejs from "nipplejs";

const NippleJoystick = ({ onMove, onStop }) => {

    const joystickRef = useRef(null);

    useEffect(() => {

        console.log("Joystick montado");

        const manager = nipplejs.create({
            zone: joystickRef.current,
            mode: "dynamic", // 🔥 IMPORTANTE (antes estaba en static)
            color: "blue",
            size: 120
        });

        manager.on("move", (evt, data) => {
            if (!data) return;

            let x = data.vector.x * 100;
            let y = data.vector.y * 100;

            // 🔥 invertir eje Y
            y = y * -1;

            console.log("MOVE EVENT:", x, y);

            onMove({ x, y });
        });

        manager.on("end", () => {
            console.log("STOP EVENT");
            onStop();
        });

        return () => {
            manager.destroy();
        };

    }, []);

    return (
        <div
            ref={joystickRef}
            style={{
                width: "200px",
                height: "200px",
                margin: "50px auto",
                position: "relative",
                border: "1px solid #ccc" // 🔥 opcional para ver el área
            }}
        />
    );
};

export default NippleJoystick;