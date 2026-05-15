import serial
import time

# Abrir puerto UART
ser = serial.Serial(
    port='/dev/ttyS5',
    baudrate=115200,
    timeout=1
)

print("UART iniciado")

while True:

    # ENVIAR
    mensaje = "Hola ESP32\n"
    ser.write(mensaje.encode())

    print("Enviado:", mensaje)

    time.sleep(1)

    # RECIBIR
    if ser.in_waiting > 0:
        data = ser.readline().decode().strip()
        print("Recibido:", data)

    time.sleep(1)