import cv2
import numpy as np

from config import *

camera = cv2.VideoCapture(
    CAMERA_COLOR
)

# =========================
# DETECTAR RGB
# =========================

def detectar_color():

    success, frame = camera.read()

    if not success:

        return None, "NONE"

    frame = cv2.resize(
        frame,
        (320,240)
    )

    h, w, _ = frame.shape

    x1 = int(w/2 - 50)
    y1 = int(h/2 - 50)

    x2 = int(w/2 + 50)
    y2 = int(h/2 + 50)

    roi = frame[y1:y2, x1:x2]

    promedio = np.mean(
        roi,
        axis=(0,1)
    )

    b = promedio[0]
    g = promedio[1]
    r = promedio[2]

    color = "NONE"

    if r > 150 and r > g and r > b:

        color = "RED"

    elif g > 150 and g > r and g > b:

        color = "GREEN"

    elif r > 120 and g > 120 and b < 100:

        color = "YELLOW"

    cv2.rectangle(
        frame,
        (x1,y1),
        (x2,y2),
        (0,255,0),
        2
    )

    cv2.putText(
        frame,
        color,
        (20,40),
        cv2.FONT_HERSHEY_SIMPLEX,
        1,
        (0,255,0),
        2
    )

    return frame, color