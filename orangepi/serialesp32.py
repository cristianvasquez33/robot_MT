from flask import Flask, request
from flask_cors import CORS
import serial

app = Flask(__name__)
CORS(app)

# 🔥 UART
ser = serial.Serial('/dev/ttyS5', 115200)

# ================= FUNCION BASE =================

def enviar_joystick(x, y, f):

    # 🔴 1. limitar joystick (evita valores raros)
    x = max(-1, min(1, x))
    y = max(-1, min(1, y))

    # 🔴 2. mezcla básica (tipo diferencial)
    fl = (y + x)
    rl = (y - x)
    fr = (y - x)
    rr = (y + x)

    # 🔴 3. ESCALA REAL A PWM (0-255)
    fl = int(fl * 255 * f / 100)
    rl = int(rl * 255 * f / 100)
    fr = int(fr * 255 * f / 100)
    rr = int(rr * 255 * f / 100)

    # 🔴 4. limitar seguridad
    fl = max(-255, min(255, fl))
    rl = max(-255, min(255, rl))
    fr = max(-255, min(255, fr))
    rr = max(-255, min(255, rr))

    # 🔴 5. enviar UART
    cmd = f"fl={fl}&rl={rl}&fr={fr}&rr={rr}\n"
    ser.write(cmd.encode())

    print("UART →", cmd)


# ================= ENDPOINT =================

@app.route("/control", methods=["POST"])
def control():

    try:
        valores = request.form

        print("HTTP →", valores)

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