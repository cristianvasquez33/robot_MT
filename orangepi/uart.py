import serial

from config import *

ser = serial.Serial(
    UART_PORT,
    UART_BAUD,
    timeout=1
)

# =========================
# UART TX
# =========================

def send_uart(cmd):

    ser.write(
        (cmd + "\n").encode()
    )

    print("UART:", cmd)

# =========================
# MECANUM
# =========================

def mecanum(x, y, f):

    fl = y + x
    fr = y - x
    rl = y - x
    rr = y + x

    motor1 = int(fl * 255 * f / 100)
    motor2 = int(rl * 255 * f / 100)
    motor3 = int(rr * 255 * f / 100)
    motor4 = int(fr * 255 * f / 100)

    motor1 = max(-255, min(255, motor1))
    motor2 = max(-255, min(255, motor2))
    motor3 = max(-255, min(255, motor3))
    motor4 = max(-255, min(255, motor4))

    cmd = (
        f"fl={motor1}"
        f"&rl={motor2}"
        f"&fr={motor3}"
        f"&rr={motor4}"
    )

    send_uart(cmd)

# =========================
# BRAZO
# =========================

def mover_servo(parte, valor):

    cmd = f"{parte}={valor}"

    send_uart(cmd)

# =========================
# LEDS MINAS
# =========================

def set_led(color):

    cmd = f"led={color}"

    send_uart(cmd)