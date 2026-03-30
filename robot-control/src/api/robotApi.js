// src/api/robotApi.js


const BASE_URL = "http://localhost:3001/robot";

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






// 🔥 función interna reutilizable
const sendRequest = async (endpoint) => {
    try {
        const url = `${BASE_URL}${endpoint}`;

        console.log("🌐 REQUEST:", url);

        const response = await fetch(url);

        if (!response.ok) {
            console.error("❌ Error HTTP:", response.status);
        }

    } catch (error) {
        console.error("❌ Error de red:", error.message);
    }
};

// 🔥 mover robot
export const move = (x, y) => {

    // 🧠 validación básica
    if (x === 0 && y === 0) return;

    console.log("🚗 MOVE:", x, y);

    sendRequest(`/move?x=${x}&y=${y}`);
};

// 🔥 detener robot
export const stop = () => {
    console.log("🛑 STOP");

    sendRequest(`/stop`);
};