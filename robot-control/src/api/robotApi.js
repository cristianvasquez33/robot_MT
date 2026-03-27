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
export const move = (x, y) => {
    fetch(`${BASE_URL}/move?x=${x}&y=${y}`)
        .catch(() => {});
};

export const stop = () => {
    fetch(`${BASE_URL}/stop`)
        .catch(() => {});
};
