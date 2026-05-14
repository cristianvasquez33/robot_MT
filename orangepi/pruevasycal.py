from flask import Flask, request
from flask_cors import CORS
import serial

app = Flask(__name__)
CORS(app)

# 🔥 UART
ser = serial.Serial('/dev/ttyS5', 115200)

# ================= FUNCION BASE =================

def enviar_joystick(x, y, f): 
    motor1 = 0 # FL
    motor2 = 0 # RL
    motor3 = 0 # RR m
    motor4 = 0 # FR


    cmd = f"fl={motor1}&rl={motor2}&fr={motor3}&rr={motor4}\n" 


    ser.write(cmd.encode())
    print("TEST LATERAL →", cmd)


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