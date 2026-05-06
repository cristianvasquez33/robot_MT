import cv2
import numpy as np
from http.server import BaseHTTPRequestHandler, HTTPServer

INPUT_URL = "http://192.168.100.153:8080/?action=stream"
cap = cv2.VideoCapture(INPUT_URL)

class StreamHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/':
            self.send_response(200)
            self.send_header('Content-type','multipart/x-mixed-replace; boundary=frame')
            self.end_headers()

            while True:
                ret, frame = cap.read()
                if not ret:
                    continue

                # ðŸ”§ Reducir tamaÃ±o para que no se congele
                frame = cv2.resize(frame, (720, 680))

                # Copia del frame original (IMPORTANTE para detectar rojo)
                frame_original = frame.copy()

                # Crear imagen gris vacÃ­a
                img_gray = np.zeros((frame.shape[0], frame.shape[1]))

                # ðŸ”´ PROCESAMIENTO
                for i in range(frame.shape[0]):
                    for j in range(frame.shape[1]):

                        # Valores originales (BGR)
                        B = frame_original[i,j,0]
                        G = frame_original[i,j,1]
                        R = frame_original[i,j,2]

                        # 1ï¸âƒ£ Convertir a gris (TU fÃ³rmula)
                        gris = 0.299*R + 0.587*G + 0.114*B

                        # 2ï¸âƒ£ Detectar rojo
                        if(R >100) and (R > G*1.2) and (R > B*1.2):
                            # Pintar verde
                            frame[i,j] = [0,255,0]
                        else:
                            # Poner gris en los 3 canales
                            frame[i,j] = [gris, gris, gris]

                # ðŸ”´ Normalizar
                frame = (frame / np.max(frame)) * 255
                frame = frame.astype(np.uint8)

                # Codificar
                _, jpeg = cv2.imencode('.jpg', frame)

                self.wfile.write(b'--frame\r\n')
                self.send_header('Content-Type', 'image/jpeg')
                self.send_header('Content-Length', str(len(jpeg)))
                self.end_headers()
                self.wfile.write(jpeg.tobytes())
                self.wfile.write(b'\r\n')

def run():
    server = HTTPServer(('0.0.0.0', 8090), StreamHandler)
    print("ðŸ”¥ Gris + detecciÃ³n rojoâ†’verde en puerto 8090")
    server.serve_forever()

if __name__ == '__main__':
    run()
