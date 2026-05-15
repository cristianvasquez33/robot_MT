from flask import Flask, request, jsonify
from flask_cors import CORS

import serial
import threading
import time

import cv2
import numpy as np

# =====================================================
# FLASK
# =====================================================

app = Flask(__name__)
CORS(app)

# =====================================================
# UART ESP32
# =====================================================

ser = serial.Serial(
    '/dev/ttyS5',
    115200,
    timeout=0.1
)

# =====================================================
# VARIABLES GLOBALES
# =====================================================

modo_auto = False
modo_color = False

temperatura = 0
humedad = 0

ultimo_color = 0

# =====================================================
# CAMARAS
# =====================================================

# video1 -> navegación
cam_nav = cv2.VideoCapture(1)

cam_nav.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
cam_nav.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)

# video0 -> color
cam_color = cv2.VideoCapture(0)

cam_color.set(cv2.CAP_PROP_FRAME_WIDTH, 320)
cam_color.set(cv2.CAP_PROP_FRAME_HEIGHT, 240)

# =====================================================
# UART RX
# =====================================================

def leer_uart():

    global temperatura
    global humedad

    while True:

        try:

            if ser.in_waiting:

                linea = ser.readline().decode(
                    errors='ignore'
                ).strip()

                if linea:

                    print("ESP32 ->", linea)

                    # T:25.1 H:60
                    if "T:" in linea and "H:" in linea:

                        partes = linea.split(" ")

                        temperatura = float(
                            partes[0].replace("T:", "")
                        )

                        humedad = float(
                            partes[1].replace("H:", "")
                        )

        except Exception as e:

            print("UART RX ERROR:", e)

        time.sleep(0.01)

# =====================================================
# UART TX
# =====================================================

def enviar_uart(cmd):

    try:

        ser.write(cmd.encode())

        print("UART TX ->", cmd.strip())

    except Exception as e:

        print("UART TX ERROR:", e)

# =====================================================
# MECANUM
# =====================================================

def enviar_joystick(x, y, f):

    # ============================================
    # LIMITAR
    # ============================================

    x = max(-1, min(1, x))
    y = max(-1, min(1, y))

    f = max(0, min(100, f))

    # ============================================
    # MECANUM
    # ============================================

    fl = (y + x)
    fr = (y - x)
    rl = (y - x)
    rr = (y + x)

    # ============================================
    # NORMALIZAR
    # ============================================

    maximo = max(
        abs(fl),
        abs(fr),
        abs(rl),
        abs(rr),
        1
    )

    fl /= maximo
    fr /= maximo
    rl /= maximo
    rr /= maximo

    # ============================================
    # MAPEO HARDWARE
    # ============================================

    motor1 = fl
    motor2 = rl
    motor3 = rr
    motor4 = fr

    # ============================================
    # ESCALAR PWM
    # ============================================

    motor1 = int(motor1 * 255 * f / 100)
    motor2 = int(motor2 * 255 * f / 100)
    motor3 = int(motor3 * 255 * f / 100)
    motor4 = int(motor4 * 255 * f / 100)

    # ============================================
    # LIMITAR
    # ============================================

    motor1 = max(-255, min(255, motor1))
    motor2 = max(-255, min(255, motor2))
    motor3 = max(-255, min(255, motor3))
    motor4 = max(-255, min(255, motor4))

    # ============================================
    # UART
    # ============================================

    cmd = (
        f"fl={motor1}"
        f"&rl={motor2}"
        f"&fr={motor3}"
        f"&rr={motor4}\n"
    )

    enviar_uart(cmd)

# =====================================================
# SERVOS
# =====================================================

def mover_servo(servo, valor):

    valor = max(0, min(180, valor))

    cmd = f"{servo}={valor}\n"

    enviar_uart(cmd)

# =====================================================
# PISTON
# =====================================================

def mover_piston(valor):

    valor = max(-255, min(255, valor))

    cmd = f"p={valor}\n"

    enviar_uart(cmd)

# =====================================================
# DETECCION COLOR RGB
# =====================================================

def detectar_color():

    global ultimo_color

    ret, frame = cam_color.read()

    if not ret:
        return

    # ============================================
    # ROI CENTRAL INFERIOR
    # ============================================

    h, w, _ = frame.shape

    roi = frame[
        int(h * 0.6):h,
        int(w * 0.3):int(w * 0.7)
    ]

    # ============================================
    # PROMEDIO RGB
    # ============================================

    promedio = roi.mean(axis=(0,1))

    b = promedio[0]
    g = promedio[1]
    r = promedio[2]

    color = 0

    # ============================================
    # ROJO
    # ============================================

    if r > 140 and g < 100 and b < 100:

        color = 1

    # ============================================
    # AMARILLO
    # ============================================

    elif r > 140 and g > 140 and b < 100:

        color = 2

    # ============================================
    # VERDE
    # ============================================

    elif g > 140 and r < 120:

        color = 3

    # ============================================
    # CAMBIO COLOR
    # ============================================

    if color != ultimo_color:

        ultimo_color = color

        cmd = f"c={color}\n"

        enviar_uart(cmd)

        print("COLOR:", color)

    # ============================================
    # DEBUG
    # ============================================

    texto = f"R:{int(r)} G:{int(g)} B:{int(b)}"

    cv2.putText(
        frame,
        texto,
        (20,40),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.8,
        (0,255,0),
        2
    )

    cv2.rectangle(
        frame,
        (int(w*0.3), int(h*0.6)),
        (int(w*0.7), h),
        (0,255,0),
        2
    )

    cv2.imshow("COLOR", frame)

# =====================================================
# LOOP COLOR
# =====================================================

def loop_color():

    global modo_color

    while True:

        if modo_color:

            detectar_color()

        if cv2.waitKey(1) == 27:
            break

        time.sleep(0.1)

# =====================================================
# NAVEGACION AUTONOMA
# =====================================================

def seguir_linea():

    global modo_auto

    kp = 0.003

    velocidad = 0.45

    while True:

        if not modo_auto:

            time.sleep(0.05)
            continue

        ret, frame = cam_nav.read()

        if not ret:
            continue

        # ============================================
        # RESIZE
        # ============================================

        frame = cv2.resize(frame, (640,480))

        h, w, _ = frame.shape

        # ============================================
        # ROI
        # ============================================

        roi = frame[
            int(h * 0.6):h,
            :
        ]

        # ============================================
        # HSV
        # ============================================

        hsv = cv2.cvtColor(
            roi,
            cv2.COLOR_BGR2HSV
        )

        # ============================================
        # AMARILLO
        # ============================================

        lower = np.array([20,100,100])
        upper = np.array([35,255,255])

        mask = cv2.inRange(
            hsv,
            lower,
            upper
        )

        # ============================================
        # LIMPIEZA
        # ============================================

        kernel = np.ones((5,5), np.uint8)

        mask = cv2.morphologyEx(
            mask,
            cv2.MORPH_OPEN,
            kernel
        )

        # ============================================
        # MOMENTS
        # ============================================

        M = cv2.moments(mask)

        if M["m00"] > 0:

            cx = int(M["m10"] / M["m00"])

            error = cx - (w // 2)

            giro = error * kp

            x = giro
            y = velocidad

            enviar_joystick(x, y, 100)

            # DEBUG
            cv2.circle(
                roi,
                (cx,50),
                10,
                (0,255,0),
                -1
            )

            cv2.line(
                roi,
                (w//2,0),
                (w//2,200),
                (255,0,0),
                2
            )

            print("ERROR:", error)

        else:

            enviar_joystick(0,0,0)

        # DEBUG
        cv2.imshow("MASK", mask)
        cv2.imshow("ROI", roi)

        if cv2.waitKey(1) == 27:
            break

        time.sleep(0.03)

# =====================================================
# CONTROL MANUAL
# =====================================================

@app.route("/control", methods=["POST"])
def control():

    global modo_auto

    try:

        # bloquear joystick si auto activo
        if modo_auto:

            return "AUTO ACTIVO"

        data = request.data.decode()

        partes = {}

        for item in data.split("&"):

            if "=" in item:

                k, v = item.split("=")

                partes[k] = v

        x = float(partes.get("x", 0))
        y = float(partes.get("y", 0))
        f = float(partes.get("f", 0))

        enviar_joystick(x, y, f)

        return "OK"

    except Exception as e:

        print("CONTROL ERROR:", e)

        return "ERROR", 400

# =====================================================
# SERVOS API
# =====================================================

@app.route("/servo", methods=["POST"])
def servo():

    try:

        data = request.json

        servo = data["servo"]

        valor = int(data["valor"])

        mover_servo(servo, valor)

        print("SERVO:", servo, valor)

        return "OK"

    except Exception as e:

        print("SERVO ERROR:", e)

        return "ERROR", 400

# =====================================================
# PISTON API
# =====================================================

@app.route("/piston", methods=["POST"])
def piston():

    try:

        data = request.json

        valor = int(data["valor"])

        mover_piston(valor)

        print("PISTON:", valor)

        return "OK"

    except Exception as e:

        print("PISTON ERROR:", e)

        return "ERROR", 400

# =====================================================
# AUTO API
# =====================================================

@app.route("/auto", methods=["POST"])
def auto():

    global modo_auto

    try:

        data = request.json

        modo_auto = data["auto"]

        print("AUTO:", modo_auto)

        return "OK"

    except Exception as e:

        print("AUTO ERROR:", e)

        return "ERROR", 400

# =====================================================
# COLOR API
# =====================================================

@app.route("/modo_color", methods=["POST"])
def modo_color_api():

    global modo_color

    try:

        data = request.json

        modo_color = data["activo"]

        print("MODO COLOR:", modo_color)

        return "OK"

    except Exception as e:

        print("COLOR MODE ERROR:", e)

        return "ERROR", 400

# =====================================================
# SENSOR API
# =====================================================

@app.route("/sensor")
def sensor():

    return jsonify({

        "temperatura": temperatura,

        "humedad": humedad

    })

# =====================================================
# START
# =====================================================

if __name__ == "__main__":

    threading.Thread(
        target=leer_uart,
        daemon=True
    ).start()

    threading.Thread(
        target=seguir_linea,
        daemon=True
    ).start()

    threading.Thread(
        target=loop_color,
        daemon=True
    ).start()

    app.run(
        host="0.0.0.0",
        port=5000
    )