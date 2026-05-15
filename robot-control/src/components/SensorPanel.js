import { useEffect, useState } from "react";

import { getSensors } from "../api/robotApi";

export default function SensorPanel() {

    const [data, setData] = useState({

        temperatura: 0,

        humedad: 0

    });

    // ============================================
    // LOOP
    // ============================================

    useEffect(() => {

        const interval = setInterval(async () => {

            const sensores = await getSensors();

            if (sensores) {

                setData(sensores);

            }

        }, 1000);

        return () => clearInterval(interval);

    }, []);

    // ============================================
    // UI
    // ============================================

    return (

        <div className="sensor-panel">

            <h3>Sensores</h3>

            <p>
                🌡️ Temperatura:
                {" "}
                {data.temperatura}
                {" "}
                °C
            </p>

            <p>
                💧 Humedad:
                {" "}
                {data.humedad}
                {" "}
                %
            </p>

        </div>
    );
}