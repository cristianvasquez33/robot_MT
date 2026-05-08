// ================= UART =================
String comando = "";

// ================= PINES =================
int IN1 = 14;
int IN2 = 27;
int IN3 = 26;
int IN4 = 13;

int IN5 = 18;
int IN6 = 19;
int IN7 = 21;
int IN8 = 22;

// PWM
int ENA_IZQ = 33;
int ENB_IZQ = 25;
int ENA_DER = 32;
int ENB_DER = 4;

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

int getValue(String data, String key, int def) {
  int index = data.indexOf(key + "=");
  if (index == -1) return def;

  int start = index + key.length() + 1;
  int end = data.indexOf("&", start);

  if (end == -1) end = data.length();

  return data.substring(start, end).toInt();
}

int suavizar(int actual, int objetivo) {
  int paso = 5;

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

// 🔥 SOLO EJECUTA
void procesar(String cmd) {

  int fl = getValue(cmd, "fl", 0);
  int rl = getValue(cmd, "rl", 0);
  int fr = getValue(cmd, "fr", 0);
  int rr = getValue(cmd, "rr", 0);

  Serial.println(cmd);

  setMotor(IN1, IN2, fl);
  setMotor(IN3, IN4, rl);
  setMotor(IN5, IN6, fr);
  setMotor(IN7, IN8, rr);

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

  Serial.println("ESP32 DRIVER PURO");
}

// ================= LOOP =================

void loop() {

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

        if (comando.length() > 50) {
          comando = "";
        }
      }
    }
  }

  // suavizado
  fl_actual = suavizar(fl_actual, fl_target);
  rl_actual = suavizar(rl_actual, rl_target);
  fr_actual = suavizar(fr_actual, fr_target);
  rr_actual = suavizar(rr_actual, rr_target);

  ledcWrite(ENA_IZQ, fl_actual);
  ledcWrite(ENB_IZQ, rl_actual);
  ledcWrite(ENA_DER, fr_actual);
  ledcWrite(ENB_DER, rr_actual);
}