import { useState } from "react";

import "../styles/control.css";

export default function SwitchColor() {

    const [activo, setActivo] = useState(false);

    // ============================================
    // TOGGLE
    // ============================================

    const toggle = async () => {

        const nuevoEstado = !activo;

        setActivo(nuevoEstado);

        try {

            await fetch(
                "http://192.168.100.128:5000/modo_color",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        activo: nuevoEstado
                    })
                }
            );

            if (nuevoEstado) {

                console.log(
                    "🎯 COLOR ACTIVADO"
                );

            } else {

                console.log(
                    "🚫 COLOR DESACTIVADO"
                );
            }

        } catch (e) {

            console.log(
                "ERROR COLOR:",
                e
            );
        }
    };

    // ============================================
    // UI
    // ============================================

    return (

        <div className="auto-container">

            <span>
                {activo ? "COLOR ON" : "COLOR OFF"}
            </span>

            <label className="switch">

                <input
                    type="checkbox"
                    checked={activo}
                    onChange={toggle}
                />

                <span className="slider"></span>

            </label>

        </div>
    );
}