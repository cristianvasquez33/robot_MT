const BASE_URL = "http://192.168.100.109";

// 🔥 controlador global
let controller = null;

// 🎮 CONTROL PRINCIPAL
export const move = (x, y) => {

    // cancelar petición anterior
    if (controller) {
        controller.abort();
    }

    controller = new AbortController();

    fetch(`${BASE_URL}/move?x=${x}&y=${y}`, {
        signal: controller.signal
    }).catch(() => {});
};

// 🔥 OPCIONAL (ya casi no necesitas estos)
export const adelante = (fl, rl, fr, rr) => {
    fetch(`${BASE_URL}/adelante?fl=${fl}&rl=${rl}&fr=${fr}&rr=${rr}`)
        .catch(() => {});
};

export const atras = (fl, rl, fr, rr) => {
    fetch(`${BASE_URL}/atras?fl=${fl}&rl=${rl}&fr=${fr}&rr=${rr}`)
        .catch(() => {});
};

export const stop = () => {
    fetch(`${BASE_URL}/stop`).catch(() => {});
};