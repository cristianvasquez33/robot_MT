#include <WiFi.h>

const char* ssid = "IdenticaIngenieriaWIFI";
const char* password = "Identica6045500ING";

WiFiServer server(80);

// 🔹 Pines dirección

// IZQUIERDA
int IN1 = 14;
int IN2 = 27;
int IN3 = 26;
int IN4 = 13;

// DERECHA
int IN5 = 18;
int IN6 = 19;
int IN7 = 21;
int IN8 = 22;

// 🔹 PWM
int ENA_IZQ = 33; // FL
int ENB_IZQ = 25; // RL
int ENA_DER = 32; // FR
int ENB_DER = 4;  // RR

// 🔥 VARIABLES ACTUALES
int fl_actual = 0;
int rl_actual = 0;
int fr_actual = 0;
int rr_actual = 0;

// 🔥 VARIABLES OBJETIVO
int fl_target = 0;
int rl_target = 0;
int fr_target = 0;
int rr_target = 0;

// 🔹 FUNCIONES

int getValue(String req, String key, int def) {
  int index = req.indexOf(key + "=");
  if (index == -1) return def;

  int start = index + key.length() + 1;
  int end = req.indexOf("&", start);

  if (end == -1) end = req.length();

  return req.substring(start, end).toInt();
}

// 🔥 SUAVIZADO
int suavizar(int actual, int objetivo) {
  int paso = 15; // 🔧 AJUSTA SI QUIERES

  if (actual < objetivo) {
    actual += paso;
    if (actual > objetivo) actual = objetivo;
  } else if (actual > objetivo) {
    actual -= paso;
    if (actual < objetivo) actual = objetivo;
  }

  return actual;
}

// 🔹 ADELANTE (solo define objetivo)
void adelante4(int fl, int rl, int fr, int rr) {

  digitalWrite(IN1, HIGH);
  digitalWrite(IN2, LOW);

  digitalWrite(IN3, HIGH);
  digitalWrite(IN4, LOW);

  digitalWrite(IN5, HIGH);
  digitalWrite(IN6, LOW);

  digitalWrite(IN7, HIGH);
  digitalWrite(IN8, LOW);

  fl_target = fl;
  rl_target = rl;
  fr_target = fr;
  rr_target = rr;
}

// 🔹 ATRÁS (solo define objetivo)
void atras4(int fl, int rl, int fr, int rr) {

  digitalWrite(IN1, LOW);
  digitalWrite(IN2, HIGH);

  digitalWrite(IN3, LOW);
  digitalWrite(IN4, HIGH);

  digitalWrite(IN5, LOW);
  digitalWrite(IN6, HIGH);

  digitalWrite(IN7, LOW);
  digitalWrite(IN8, HIGH);

  fl_target = fl;
  rl_target = rl;
  fr_target = fr;
  rr_target = rr;
}

// 🔹 STOP
void parar() {

  digitalWrite(IN1, LOW);
  digitalWrite(IN2, LOW);
  digitalWrite(IN3, LOW);
  digitalWrite(IN4, LOW);

  digitalWrite(IN5, LOW);
  digitalWrite(IN6, LOW);
  digitalWrite(IN7, LOW);
  digitalWrite(IN8, LOW);

  fl_target = 0;
  rl_target = 0;
  fr_target = 0;
  rr_target = 0;
}

// 🚀 SETUP
void setup() {
  Serial.begin(115200);

  pinMode(IN1, OUTPUT);
  pinMode(IN2, OUTPUT);
  pinMode(IN3, OUTPUT);
  pinMode(IN4, OUTPUT);

  pinMode(IN5, OUTPUT);
  pinMode(IN6, OUTPUT);
  pinMode(IN7, OUTPUT);
  pinMode(IN8, OUTPUT);

  // PWM
  ledcAttach(ENA_IZQ, 1000, 8);
  ledcAttach(ENB_IZQ, 1000, 8);
  ledcAttach(ENA_DER, 1000, 8);
  ledcAttach(ENB_DER, 1000, 8);

  WiFi.begin(ssid, password);

  Serial.print("Conectando...");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nConectado!");
  Serial.println(WiFi.localIP());

  server.begin();
}

// 🌐 LOOP
void loop() {

  // 🔥 CONTROL CONTINUO (CLAVE)
  fl_actual = suavizar(fl_actual, fl_target);
  rl_actual = suavizar(rl_actual, rl_target);
  fr_actual = suavizar(fr_actual, fr_target);
  rr_actual = suavizar(rr_actual, rr_target);

  ledcWrite(ENA_IZQ, fl_actual);
  ledcWrite(ENB_IZQ, rl_actual);
  ledcWrite(ENA_DER, fr_actual);
  ledcWrite(ENB_DER, rr_actual);

  // 🌐 SERVIDOR
  WiFiClient client = server.available();

  if (client) {

    client.setTimeout(10);
    String request = client.readString();

    Serial.println(request);

    client.flush();

    if (request.indexOf("/adelante") != -1) {

      int fl = getValue(request, "fl", 150);
      int rl = getValue(request, "rl", 150);
      int fr = getValue(request, "fr", 150);
      int rr = getValue(request, "rr", 150);

      adelante4(fl, rl, fr, rr);
    }

    if (request.indexOf("/atras") != -1) {

      int fl = getValue(request, "fl", 150);
      int rl = getValue(request, "rl", 150);
      int fr = getValue(request, "fr", 150);
      int rr = getValue(request, "rr", 150);

      atras4(fl, rl, fr, rr);
    }

    if (request.indexOf("/stop") != -1) {
      parar();
    }

    client.println("HTTP/1.1 200 OK");
    client.println("Connection: close");
    client.println("Access-Control-Allow-Origin: *"); 
    client.println("Content-Type: text/plain");
    client.println("");
    client.println("OK");

    client.stop();
  }
}
//v.2