import { useState } from "react";

import "../styles/brazo.css";

export default function BrazoControl() {

    const [base, setBase] = useState(90);

    const [hombro, setHombro] = useState(90);

    const [codo, setCodo] = useState(90);

    const [gripper, setGripper] = useState(false);

    // ============================================
    // ENVIAR
    // ============================================

    const enviar = async (servo, valor) => {

        try {

            await fetch(
                "http://192.168.100.128:5000/servo",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        servo: servo,
                        valor: valor
                    })
                }
            );

        } catch (e) {

            console.log(
                "ERROR SERVO:",
                e
            );
        }
    };

    // ============================================
    // UI
    // ============================================

    return (

        <div className="brazo-container">

            <h3>🦾 Control del Brazo</h3>

            {/* ================================= */}
            {/* BASE */}
            {/* ================================= */}

            <div className="control">

                <label>
                    Base: {base}°
                </label>

                <input
                    type="range"
                    min="0"
                    max="180"
                    value={base}

                    onChange={(e) => {

                        const valor = Number(
                            e.target.value
                        );

                        setBase(valor);

                        enviar("s1", valor);
                    }}
                />
            </div>

            {/* ================================= */}
            {/* HOMBRO */}
            {/* ================================= */}

            <div className="control">

                <label>
                    Hombro: {hombro}°
                </label>

                <input
                    type="range"
                    min="0"
                    max="180"
                    value={hombro}

                    onChange={(e) => {

                        const valor = Number(
                            e.target.value
                        );

                        setHombro(valor);

                        enviar("s2", valor);
                    }}
                />
            </div>

            {/* ================================= */}
            {/* CODO */}
            {/* ================================= */}

            <div className="control">

                <label>
                    Codo: {codo}°
                </label>

                <input
                    type="range"
                    min="0"
                    max="180"
                    value={codo}

                    onChange={(e) => {

                        const valor = Number(
                            e.target.value
                        );

                        setCodo(valor);

                        enviar("s3", valor);
                    }}
                />
            </div>

            {/* ================================= */}
            {/* GRIPPER */}
            {/* ================================= */}

            <div className="control">

                <label>
                    Gripper
                </label>

                <button

                    className={`btn ${
                        gripper
                        ? "cerrado"
                        : "abierto"
                    }`}

                    onClick={() => {

                        const nuevo = !gripper;

                        setGripper(nuevo);

                        // abierto/cerrado
                        enviar(
                            "s4",
                            nuevo ? 180 : 90
                        );
                    }}

                >
                    {gripper ? "Cerrar" : "Abrir"}

                </button>
            </div>
        </div>
    );
}