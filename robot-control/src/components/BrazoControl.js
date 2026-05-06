import { useState } from "react";
import "../styles/brazo.css";

export default function BrazoControl() {
    const [base, setBase] = useState(90);
    const [hombro, setHombro] = useState(90);
    const [codo, setCodo] = useState(90);
    const [gripper, setGripper] = useState(false);

    // 🔌 Función para enviar datos (puedes cambiar la URL)
    const enviar = (parte, valor) => {
        console.log(parte, valor);
        // fetch(`http://TU_API/${parte}?value=${valor}`);
    };

    return (
        <div className="brazo-container">

            <h3>🦾 Control del Brazo</h3>

            {/* BASE */}
            <div className="control">
                <label>Base: {base}°</label>
                <input
                    type="range"
                    min="0"
                    max="180"
                    value={base}
                    onChange={(e) => {
                        setBase(e.target.value);
                        enviar("base", e.target.value);
                    }}
                />
            </div>

            {/* HOMBRO */}
            <div className="control">
                <label>Hombro: {hombro}°</label>
                <input
                    type="range"
                    min="0"
                    max="180"
                    value={hombro}
                    onChange={(e) => {
                        setHombro(e.target.value);
                        enviar("hombro", e.target.value);
                    }}
                />
            </div>

            {/* CODO */}
            <div className="control">
                <label>Codo: {codo}°</label>
                <input
                    type="range"
                    min="0"
                    max="180"
                    value={codo}
                    onChange={(e) => {
                        setCodo(e.target.value);
                        enviar("codo", e.target.value);
                    }}
                />
            </div>

            {/* GRIPPER */}
            <div className="control">
                <label>Gripper</label>

                <button
                    className={`btn ${gripper ? "cerrado" : "abierto"}`}
                    onClick={() => {
                        const nuevo = !gripper;
                        setGripper(nuevo);
                        enviar("gripper", nuevo ? "cerrar" : "abrir");
                    }}
                >
                    {gripper ? "Cerrar" : "Abrir"}
                </button>
            </div>

        </div>
    );
}

