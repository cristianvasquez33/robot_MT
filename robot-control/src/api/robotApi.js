// src/api/robotApi.js


//const BASE_URL = "http://localhost:3001/robot";

// 🔥 OPCIONAL (ya casi no necesitas estos)
// export const adelante = (fl, rl, fr, rr) => {
//     fetch(`${BASE_URL}/adelante?fl=${fl}&rl=${rl}&fr=${fr}&rr=${rr}`)
//         .catch(() => {});
// };

// export const atras = (fl, rl, fr, rr) => {
//     fetch(`${BASE_URL}/atras?fl=${fl}&rl=${rl}&fr=${fr}&rr=${rr}`)
//         .catch(() => {});
// };

// export const stop = () => {
//     fetch(`${BASE_URL}/stop`).catch(() => {});
// };

//  /src/api/robotApi.js


// export const move = (x, y) => {
//     fetch(`${BASE_URL}/move?x=${x}&y=${y}`)
//         .catch(() => {});
// };

// export const stop = () => {
//     fetch(`${BASE_URL}/stop`)
//         .catch(() => {});
// };




// src/api/robotApi.js

// 🔥 función interna reutilizable
// src/api/robotApi.js

const BASE_URL = "http://192.168.100.20:5000"; // 🔥 cambia si es necesario

// 🔥 enviar comando joystick
export const move = async (comando) => {

    try {
        console.log("🚗 ENVIANDO:", comando);

        await fetch(`${BASE_URL}/control`, {
            method: "POST",
            headers: {
                "Content-Type": "text/plain"
            },
            body: comando
        });

    } catch (error) {
        console.error("❌ Error:", error);
    }
};

// 🔥 detener robot
export const stop = async () => {

    try {
        await fetch(`${BASE_URL}/control`, {
            method: "POST",
            headers: {
                "Content-Type": "text/plain"
            },
            body: "x=0&y=0&f=0"
        });

    } catch (error) {
        console.error("❌ Error STOP:", error);
    }
};