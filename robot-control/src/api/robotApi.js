const BASE_URL = "http://192.168.100.114";

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