import cv2

from config import *

from uart import mecanum

camera = cv2.VideoCapture(
    CAMERA_LINE
)

# =========================
# AUTONOMO U
# =========================

def seguir_franjas():

    success, frame = camera.read()

    if not success:

        return None

    frame = cv2.resize(
        frame,
        (320,240)
    )

    h, w, _ = frame.shape

    roi = frame[
        int(h*0.7):h,
        :
    ]

    gray = cv2.cvtColor(
        roi,
        cv2.COLOR_BGR2GRAY
    )

    blur = cv2.GaussianBlur(
        gray,
        (5,5),
        0
    )

    _, thresh = cv2.threshold(
        blur,
        100,
        255,
        cv2.THRESH_BINARY_INV
    )

    contours, _ = cv2.findContours(
        thresh,
        cv2.RETR_EXTERNAL,
        cv2.CHAIN_APPROX_SIMPLE
    )

    cx = w // 2

    if contours:

        largest = max(
            contours,
            key=cv2.contourArea
        )

        M = cv2.moments(largest)

        if M["m00"] != 0:

            cx = int(
                M["m10"] / M["m00"]
            )

    center = w // 2

    error = cx - center

    correction = error * KP

    x = correction

    y = 1

    mecanum(
        x,
        y,
        AUTO_SPEED
    )

    cv2.line(
        frame,
        (center,0),
        (center,h),
        (0,255,0),
        2
    )

    cv2.circle(
        frame,
        (cx,int(h*0.85)),
        8,
        (0,0,255),
        -1
    )

    return frame