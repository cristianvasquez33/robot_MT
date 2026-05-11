from flask import Flask, request
from flask_cors import CORS
import serial

app = Flask(__name__)
CORS(app)

# 🔥 UART
ser = serial.Serial('/dev/ttyS5', 115200)

# ================= FUNCION BASE =================

def enviar_joystick(x, y, f):

    # limitar
    x = max(-1, min(1, x))
    y = max(-1, min(1, y))

    # 🔴 MECANUM CORREGIDO SEGÚN TU HARDWARE
    fl = (y + x)
    fr = (y - x)
    rl = (y - x)
    rr = (y + x)

    # 🔴 REORDENAMIENTO A TU MAPEO
    motor1 = fl   # FL
    motor2 = rl   # RL
    motor3 = rr   # RR (antes fr)
    motor4 = fr   # FR (antes rr)

    # escalar
    motor1 = int(motor1 * 255 * f / 100)
    motor2 = int(motor2 * 255 * f / 100)
    motor3 = int(motor3 * 255 * f / 100)
    motor4 = int(motor4 * 255 * f / 100)

    # limitar
    motor1 = max(-255, min(255, motor1))
    motor2 = max(-255, min(255, motor2))
    motor3 = max(-255, min(255, motor3))
    motor4 = max(-255, min(255, motor4))

    # enviar (IMPORTANTE ORDEN)
    cmd = f"fl={motor1}&rl={motor2}&fr={motor3}&rr={motor4}\n"

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