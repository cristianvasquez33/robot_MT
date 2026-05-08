from flask import Flask, request
from flask_cors import CORS
import serial

app = Flask(__name__)
CORS(app)

# 🔥 UART
ser = serial.Serial('/dev/ttyS5', 115200)

# 🔥 calibración
k = 10  

# ================= FUNCION BASE =================

def enviar_joystick(x, y, f):

    fl = (y + x)
    rl = (y - x)
    fr = (y - x)
    rr = (y + x)

    # corrección
    fl += k
    rl += k
    fr -= k
    rr -= k

    # escala
    fl = int(fl * f / 100)
    rl = int(rl * f / 100)
    fr = int(fr * f / 100)
    rr = int(rr * f / 100)

    # limitar
    fl = max(-255, min(255, fl))
    rl = max(-255, min(255, rl))
    fr = max(-255, min(255, fr))
    rr = max(-255, min(255, rr))

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