#include <Wire.h>
#include <Adafruit_PWMServoDriver.h>
#include <DHT.h>

// ================= PCA9685 =================
Adafruit_PWMServoDriver pca = Adafruit_PWMServoDriver(0x40);

// ================= UART =================
String comando = "";

// ================= DHT22 =================
// ⚠ CAMBIA ESTE PIN SI EL DHT22 FALLA
#define DHTPIN 15
#define DHTTYPE DHT22

DHT dht(DHTPIN, DHTTYPE);

// ================= COLOR =================
int color_detectado = 0;

// ================= PINES MOTORES =================
int IN1 = 14;
int IN2 = 27;
int IN3 = 26;
int IN4 = 13;

int IN5 = 23;           ///blanco
int IN6 = 5;            /// gris
int IN7 = 19;           /// morado
                        
int IN8 = 18 ;            //gris claro 

// ================= PWM MOTORES =================r
int ENA_IZQ = 33;
int ENB_IZQ = 25;
int ENA_DER = 32;       //azul
int ENB_DER = 4;        //cafe

// ================= PISTÓN =================
int PISTON_IN1 = 12;
int PISTON_IN2 = 2;

// ================= VARIABLES =================
int fl_actual = 0, rl_actual = 0, fr_actual = 0, rr_actual = 0;
int fl_target = 0, rl_target = 0, fr_target = 0, rr_target = 0;

// pistón
int piston_actual = 0;
int piston_target = 0;

// ================= SERVOS =================
int servo1 = 90;
int servo2 = 90;
int servo3 = 90;
int servo4 = 90;

// =====================================================
// FUNCIONES
// =====================================================

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

// =====================================================
// DIRECCIÓN MOTORES
// =====================================================

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

// =====================================================
// SERVOS PCA9685
// =====================================================

void moverServo(int canal, int angulo) {

  if (canal == 2 && angulo > 120) {
    angulo = 120;
  }

  int pulso = map(angulo, 0, 180, 100, 500);

  pca.setPWM(canal, 0, pulso);
}

// =====================================================
// LEDS PCA9685
// =====================================================

void actualizarLED() {

  pca.setPWM(4, 0, 0);
  pca.setPWM(5, 0, 0);
  pca.setPWM(6, 0, 0);

  if (color_detectado == 1) {

    pca.setPWM(4, 0, 4095);
  }
  else if (color_detectado == 2) {

    pca.setPWM(5, 0, 4095);
  }
  else if (color_detectado == 3) {

    pca.setPWM(6, 0, 4095);
  }
}

// =====================================================
// PISTÓN PWM DESDE PCA9685
// Canal 7 del PCA9685 -> ENA del L298N
// =====================================================

void moverPiston(int velocidad) {

  int pwm = abs(velocidad);

  // convertir 0-255 a 0-4095
  int pwmPCA = map(pwm, 0, 255, 0, 4095);

  if (velocidad > 0) {

    digitalWrite(PISTON_IN1, HIGH);
    digitalWrite(PISTON_IN2, LOW);
  }
  else if (velocidad < 0) {

    digitalWrite(PISTON_IN1, LOW);
    digitalWrite(PISTON_IN2, HIGH);
  }
  else {

    digitalWrite(PISTON_IN1, LOW);
    digitalWrite(PISTON_IN2, LOW);
  }

  // PWM PCA9685 canal 7
  pca.setPWM(7, 0, pwmPCA);
}

// =====================================================
// PROCESAR COMANDOS
// =====================================================

void procesar(String cmd) {

  int fl = getValue(cmd, "fl", 0);
  int rl = getValue(cmd, "rl", 0);
  int fr = getValue(cmd, "fr", 0);
  int rr = getValue(cmd, "rr", 0);

  servo1 = getValue(cmd, "s1", servo1);
  servo2 = getValue(cmd, "s2", servo2);
  servo3 = getValue(cmd, "s3", servo3);
  servo4 = getValue(cmd, "s4", servo4);

  color_detectado = getValue(cmd, "c", color_detectado);

  piston_target = getValue(cmd, "p", piston_target);

  Serial.println(cmd);

  // dirección motores
  setMotor(IN1, IN2, fl);
  setMotor(IN3, IN4, rl);
  setMotor(IN5, IN6, fr);
  setMotor(IN7, IN8, rr);

  // velocidad motores
  fl_target = abs(fl);
  rl_target = abs(rl);
  fr_target = abs(fr);
  rr_target = abs(rr);
}

// =====================================================
// SETUP
// =====================================================

void setup() {

  Serial.begin(115200);

  Serial2.begin(115200, SERIAL_8N1, 16, 17);

  // motores
  pinMode(IN1, OUTPUT);
  pinMode(IN2, OUTPUT);

  pinMode(IN3, OUTPUT);
  pinMode(IN4, OUTPUT);

  pinMode(IN5, OUTPUT);
  pinMode(IN6, OUTPUT);

  pinMode(IN7, OUTPUT);
  pinMode(IN8, OUTPUT);

  // pistón
  pinMode(PISTON_IN1, OUTPUT);
  pinMode(PISTON_IN2, OUTPUT);

  // PWM motores ESP32
  ledcAttach(ENA_IZQ, 1000, 8);
  ledcAttach(ENB_IZQ, 1000, 8);
  ledcAttach(ENA_DER, 1000, 8);
  ledcAttach(ENB_DER, 1000, 8);

  // I2C PCA9685
  Wire.begin(21, 22);

  pca.begin();

  pca.setPWMFreq(50);

  // DHT
  dht.begin();

  Serial.println("SISTEMA OK");
}

// =====================================================
// LOOP
// =====================================================

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

  // =================================================
  // SUAVIZAR MOTORES
  // =================================================

  fl_actual = suavizar(fl_actual, fl_target);
  rl_actual = suavizar(rl_actual, rl_target);
  fr_actual = suavizar(fr_actual, fr_target);
  rr_actual = suavizar(rr_actual, rr_target);

  ledcWrite(ENA_IZQ, fl_actual);
  ledcWrite(ENB_IZQ, rl_actual);
  ledcWrite(ENA_DER, fr_actual);
  ledcWrite(ENB_DER, rr_actual);

  // =================================================
  // PISTÓN
  // =================================================

  piston_actual = suavizar(piston_actual, piston_target);

  moverPiston(piston_actual);

  // =================================================
  // SERVOS
  // =================================================

  moverServo(0, servo1);
  moverServo(1, servo2);
  moverServo(2, servo3);
  moverServo(3, servo4);

  // =================================================
  // LEDS
  // =================================================

  actualizarLED();

  // =================================================
  // DHT22
  // =================================================

  static unsigned long lastDHT = 0;

  if (millis() - lastDHT > 2000) {

    float temp = dht.readTemperature();
    float hum  = dht.readHumidity();

    if (!isnan(temp) && !isnan(hum)) {

      Serial.print("T:");
      Serial.print(temp);

      Serial.print(" H:");
      Serial.println(hum);
    }
    else {

      Serial.println("Error leyendo DHT22");
    }

    lastDHT = millis();
  }
}