from flask import Flask, request, jsonify

from flask_cors import CORS

import serial
import threading
import time

app = Flask(__name__)

CORS(app)

# ======================
# UART
# ======================

ser = serial.Serial(
    '/dev/ttyS5',
    115200,
    timeout=1
)

# ======================
# VARIABLES
# ======================

temperatura = 0
humedad = 0

modo_auto = False
modo_color = False

# ======================
# MECANUM
# ======================

def enviar_joystick(x, y, f):

    x = max(-1, min(1, x))
    y = max(-1, min(1, y))

    fl = y + x
    fr = y - x
    rl = y - x
    rr = y + x

    motor1 = int(fl * 255 * f / 100)
    motor2 = int(rl * 255 * f / 100)
    motor3 = int(rr * 255 * f / 100)
    motor4 = int(fr * 255 * f / 100)

    cmd = f"fl={motor1}&rl={motor2}&fr={motor3}&rr={motor4}\n"

    ser.write(cmd.encode())

    print(cmd)

# ======================
# CONTROL
# ======================

@app.route("/control", methods=["POST"])
def control():

    valores = request.form

    x = float(valores.get("x", 0)) / 100
    y = float(valores.get("y", 0)) / 100
    f = float(valores.get("f", 0))

    enviar_joystick(x, y, f)

    return "OK"

# ======================
# AUTO
# ======================

@app.route("/auto", methods=["POST"])
def auto():

    global modo_auto

    data = request.json

    modo_auto = data["auto"]

    print("AUTO:", modo_auto)

    return jsonify({
        "ok": True
    })

# ======================
# COLOR
# ======================

@app.route("/color", methods=["POST"])
def color():

    global modo_color

    data = request.json

    modo_color = data["color"]

    print("COLOR:", modo_color)

    return jsonify({
        "ok": True
    })

# ======================
# BRAZO
# ======================

@app.route("/brazo", methods=["POST"])
def brazo():

    data = request.json

    parte = data["parte"]
    valor = data["valor"]

    cmd = f"{parte}={valor}\n"

    ser.write(cmd.encode())

    print(cmd)

    return jsonify({
        "ok": True
    })

# ======================
# SENSORES
# ======================

@app.route("/sensors")
def sensors():

    return jsonify({

        "temperatura": temperatura,
        "humedad": humedad,
        "auto": modo_auto,
        "color": modo_color

    })

# ======================
# UART RX
# ======================

def leer_uart():

    global temperatura
    global humedad

    while True:

        try:

            if ser.in_waiting:

                linea = ser.readline().decode().strip()

                print("ESP32:", linea)

                partes = linea.split("&")

                datos = {}

                for p in partes:

                    if "=" in p:

                        k, v = p.split("=")

                        datos[k] = v

                temperatura = float(datos.get("t", 0))
                humedad = float(datos.get("h", 0))

        except Exception as e:

            print(e)

        time.sleep(0.01)

# ======================
# THREAD UART
# ======================

threading.Thread(
    target=leer_uart,
    daemon=True
).start()

# ======================
# MAIN
# ======================

if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )