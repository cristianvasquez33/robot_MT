from flask import Flask, request
from flask_cors import CORS
import serial

app = Flask(__name__)
CORS(app)

# 🔥 UART
ser = serial.Serial('/dev/ttyS5', 115200)

# 🔥 calibración lateral
k = 10  

# 🔥 PWM rango útil
PWM_MIN = 200   # ~80%
PWM_MAX = 255   # 100%

# ================= FUNCION PRINCIPAL =================

def enviar_joystick(x, y, f):

    # 🔹 zona muerta (evita vibración)
    if abs(x) < 5: x = 0
    if abs(y) < 5: y = 0

    # 🔹 si no hay fuerza → parar
    if f < 5:
        fl = rl = fr = rr = 0
    else:

        # 🔹 mecanum base
        fl = (y + x)
        rl = (y - x)
        fr = (y - x)
        rr = (y + x)

        # 🔥 corrección lateral
        fl += k
        rl += k
        fr -= k
        rr -= k

        # 🔹 normalizar (clave)
        max_val = max(abs(fl), abs(rl), abs(fr), abs(rr), 1)

        fl /= max_val
        rl /= max_val
        fr /= max_val
        rr /= max_val

        # 🔥 escalar PWM 80–100%
        pwm = PWM_MIN + (PWM_MAX - PWM_MIN) * (f / 100)

        fl = int(fl * pwm)
        rl = int(rl * pwm)
        fr = int(fr * pwm)
        rr = int(rr * pwm)

    # 🔹 enviar UART
    cmd = f"fl={fl}&rl={rl}&fr={fr}&rr={rr}\n"
    ser.write(cmd.encode())

    print("UART →", cmd)


# ================= ENDPOINT =================

@app.route("/control", methods=["POST"])
def control():

    data = request.data.decode()
    print("HTTP →", data)

    try:
        valores = dict(item.split("=") for item in data.split("&"))

        x = float(valores.get("x", 0))
        y = float(valores.get("y", 0))
        f = float(valores.get("f", 0))

        enviar_joystick(x, y, f)

        return "OK"

    except Exception as e:
        print("ERROR:", e)
        return "ERROR", 400


# ================= RUN =================

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)