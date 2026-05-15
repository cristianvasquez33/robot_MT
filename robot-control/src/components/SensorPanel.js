import { useEffect, useState } from "react";

import { getSensors } from "../api/robotApi";

export default function SensorPanel() {

    const [data, setData] = useState({

        temperatura: 0,
        humedad: 0,
        auto: false,
        color: false

    });

    useEffect(() => {

        const interval = setInterval(async () => {

            const sensores = await getSensors();

            if (sensores) {

                setData(sensores);

            }

        }, 1000);

        return () => clearInterval(interval);

    }, []);

    return (

        <div>

            <h3>Sensores</h3>

            <p>🌡️ Temp: {data.temperatura} °C</p>

            <p>💧 Humedad: {data.humedad} %</p>

            <p>🤖 Auto: {data.auto ? "ON" : "OFF"}</p>

            <p>🎨 Color: {data.color ? "ON" : "OFF"}</p>

        </div>

    );

}