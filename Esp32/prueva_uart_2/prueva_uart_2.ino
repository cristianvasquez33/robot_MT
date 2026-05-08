// ================= UART =================
String comando = "";

// ================= PINES =================

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

// PWM
int ENA_IZQ = 33; // FL
int ENB_IZQ = 25; // RL
int ENA_DER = 32; // FR
int ENB_DER = 4;  // RR

// ================= VARIABLES =================

int fl_actual = 0;
int rl_actual = 0;
int fr_actual = 0;
int rr_actual = 0;

int fl_target = 0;
int rl_target = 0;
int fr_target = 0;
int rr_target = 0;

// ================= FUNCIONES =================

// 🔹 parser (igual que usabas en WiFi)
int getValue(String data, String key, int def) {
  int index = data.indexOf(key + "=");
  if (index == -1) return def;

  int start = index + key.length() + 1;
  int end = data.indexOf("&", start);

  if (end == -1) end = data.length();

  return data.substring(start, end).toInt();
}

// 🔹 suavizado
int suavizar(int actual, int objetivo) {
  int paso = 5; // más suave

  if (actual < objetivo) {
    actual += paso;
    if (actual > objetivo) actual = objetivo;
  } 
  else if (actual > objetivo) {
    actual -= paso;
    if (actual < objetivo) actual = objetivo;
  }

  return actual;
}

// 🔹 dirección motor
void setMotor(int in1, int in2, int velocidad) {

  if (velocidad > 0) {
    digitalWrite(in1, HIGH);
    digitalWrite(in2, LOW);
  } 
  else if (velocidad < 0) {
    digitalWrite(in1, LOW);
    digitalWrite(in2, HIGH);
  } 
  else {
    digitalWrite(in1, LOW);
    digitalWrite(in2, LOW);
  }
}

// 🔥 PROCESAR UART (JOYSTICK)
void procesar(String cmd) {

  cmd.trim();

  int x = getValue(cmd, "x", 0);
  int y = getValue(cmd, "y", 0);
  int f = getValue(cmd, "f", 0);

  Serial.print("X: "); Serial.print(x);
  Serial.print(" Y: "); Serial.print(y);
  Serial.print(" F: "); Serial.println(f);

  // 🔥 mecanum cartesiano
  int fl = (y + x) * f / 100;
  int rl = (y - x) * f / 100;
  int fr = (y - x) * f / 100;
  int rr = (y + x) * f / 100;

  // limitar
  fl = constrain(fl, -255, 255);
  rl = constrain(rl, -255, 255);
  fr = constrain(fr, -255, 255);
  rr = constrain(rr, -255, 255);

  // dirección
  setMotor(IN1, IN2, fl);
  setMotor(IN3, IN4, rl);
  setMotor(IN5, IN6, fr);
  setMotor(IN7, IN8, rr);

  // PWM (solo magnitud)
  fl_target = abs(fl);
  rl_target = abs(rl);
  fr_target = abs(fr);
  rr_target = abs(rr);
}

// ================= SETUP =================

void setup() {

  Serial.begin(115200);
  Serial2.begin(115200, SERIAL_8N1, 16, 17);

  pinMode(IN1, OUTPUT);
  pinMode(IN2, OUTPUT);
  pinMode(IN3, OUTPUT);
  pinMode(IN4, OUTPUT);

  pinMode(IN5, OUTPUT);
  pinMode(IN6, OUTPUT);
  pinMode(IN7, OUTPUT);
  pinMode(IN8, OUTPUT);

  ledcAttach(ENA_IZQ, 1000, 8);
  ledcAttach(ENB_IZQ, 1000, 8);
  ledcAttach(ENA_DER, 1000, 8);
  ledcAttach(ENB_DER, 1000, 8);

  Serial.println("🚀 ESP32 LISTO - UART JOYSTICK");
}

// ================= LOOP =================

void loop() {

  // 🔥 UART recepción limpia
  while (Serial2.available()) {
    char c = Serial2.read();

    if (c == '\r') continue;

    if ((c >= 32 && c <= 126) || c == '\n') {

      if (c == '\n') {

        if (comando.length() > 0) {
          procesar(comando);
        }

        comando = "";
      } 
      else {
        comando += c;

        if (comando.length() > 40) {
          comando = "";
        }
      }
    }
  }

  // 🔥 suavizado continuo
  fl_actual = suavizar(fl_actual, fl_target);
  rl_actual = suavizar(rl_actual, rl_target);
  fr_actual = suavizar(fr_actual, fr_target);
  rr_actual = suavizar(rr_actual, rr_target);

  ledcWrite(ENA_IZQ, fl_actual);
  ledcWrite(ENB_IZQ, rl_actual);
  ledcWrite(ENA_DER, fr_actual);
  ledcWrite(ENB_DER, rr_actual);
}