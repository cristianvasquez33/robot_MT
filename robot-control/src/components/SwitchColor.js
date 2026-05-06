import { useState } from "react";
import "../styles/control.css";

export default function SwitchColor() {
    const [activo, setActivo] = useState(false);

    const toggle = () => {
        const nuevoEstado = !activo;
        setActivo(nuevoEstado);

        if (nuevoEstado) {
            console.log("🎯 Reconocimiento de color ACTIVADO");
            // fetch("http://TU_API/color/on");
        } else {
            console.log("🚫 Reconocimiento de color DESACTIVADO");
            // fetch("http://TU_API/color/off");
        }
    };

    return (
        <div className="auto-container">
            <span>{activo ? "COLOR ON" : "COLOR OFF"}</span>

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