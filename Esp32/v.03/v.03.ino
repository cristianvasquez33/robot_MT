#include <Wire.h>
#include <Adafruit_PWMServoDriver.h>
#include "DHT.h"

// ================= PCA9685 =================
Adafruit_PWMServoDriver pca = Adafruit_PWMServoDriver(0x40);

// ================= UART =================
String comando = "";

// ================= DHT22 =================
#define DHTPIN 34
#define DHTTYPE DHT22
DHT dht(DHTPIN, DHTTYPE);

// ================= COLOR =================
int color_detectado = 0;
// 0 = nada
// 1 = rojo
// 2 = amarillo
// 3 = verde

// ================= PINES MOTORES =================
int IN1 = 14;
int IN2 = 27;
int IN3 = 26;
int IN4 = 13;

int IN5 = 18;
int IN6 = 19;
int IN7 = 23;
int IN8 = 5;

// PWM motores
int ENA_IZQ = 33;
int ENB_IZQ = 25;
int ENA_DER = 32;
int ENB_DER = 4;

// ================= PISTÓN =================
int PISTON_IN1 = 12;
int PISTON_IN2 = 2;
int PISTON_EN  = 15;

// ================= VARIABLES =================
int fl_actual = 0;
int rl_actual = 0;
int fr_actual = 0;
int rr_actual = 0;

int fl_target = 0;
int rl_target = 0;
int fr_target = 0;
int rr_target = 0;

// ================= SERVOS =================
int servo1 = 90;
int servo2 = 90;
int servo3 = 90;
int servo4 = 90;

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

// ================= SERVOS =================
void moverServo(int canal, int angulo) {

  // protección mínima servo 3
  if (canal == 2 && angulo > 120) angulo = 120;

  int pulso = map(angulo, 0, 180, 100, 500);
  pca.setPWM(canal, 0, pulso);
}

// ================= LED PCA9685 =================
void actualizarLED() {

  // apagar todos
  pca.setPWM(4, 0, 0);
  pca.setPWM(5, 0, 0);
  pca.setPWM(6, 0, 0);

  if (color_detectado == 1) pca.setPWM(4, 0, 4095);
  else if (color_detectado == 2) pca.setPWM(5, 0, 4095);
  else if (color_detectado == 3) pca.setPWM(6, 0, 4095);
}

// ================= PISTÓN =================
void moverPiston(int velocidad) {

  int pwm = abs(velocidad);

  if (pwm > 200) pwm = 200; // protección opcional

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

  ledcWrite(PISTON_EN, pwm);
}

// ================= PROCESAR =================
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

  int p = getValue(cmd, "p", 0);

  Serial.println(cmd);

  setMotor(IN1, IN2, fl);
  setMotor(IN3, IN4, rl);
  setMotor(IN5, IN6, fr);
  setMotor(IN7, IN8, rr);

  fl_target = abs(fl);
  rl_target = abs(rl);
  fr_target = abs(fr);
  rr_target = abs(rr);

  moverPiston(p);
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

  pinMode(PISTON_IN1, OUTPUT);
  pinMode(PISTON_IN2, OUTPUT);

  ledcAttach(ENA_IZQ, 1000, 8);
  ledcAttach(ENB_IZQ, 1000, 8);
  ledcAttach(ENA_DER, 1000, 8);
  ledcAttach(ENB_DER, 1000, 8);
  ledcAttach(PISTON_EN, 1000, 8);

  Wire.begin(21, 22);
  pca.begin();
  pca.setPWMFreq(50);

  dht.begin();

  Serial.println("SISTEMA COMPLETO OK");
}

// ================= LOOP =================

void loop() {

  // UART
  while (Serial2.available()) {
    char c = Serial2.read();

    if (c == '\r') continue;

    if ((c >= 32 && c <= 126) || c == '\n') {

      if (c == '\n') {
        if (comando.length() > 0) procesar(comando);
        comando = "";
      } 
      else {
        comando += c;
        if (comando.length() > 50) comando = "";
      }
    }
  }

  // suavizado motores
  fl_actual = suavizar(fl_actual, fl_target);
  rl_actual = suavizar(rl_actual, rl_target);
  fr_actual = suavizar(fr_actual, fr_target);
  rr_actual = suavizar(rr_actual, rr_target);

  ledcWrite(ENA_IZQ, fl_actual);
  ledcWrite(ENB_IZQ, rl_actual);
  ledcWrite(ENA_DER, fr_actual);
  ledcWrite(ENB_DER, rr_actual);

  // servos
  moverServo(0, servo1);
  moverServo(1, servo2);
  moverServo(2, servo3);
  moverServo(3, servo4);

  // LED automático
  actualizarLED();

  // DHT22 cada 2s
  static unsigned long lastDHT = 0;
  if (millis() - lastDHT > 2000) {

    float temp = dht.readTemperature();
    float hum = dht.readHumidity();

    if (!isnan(temp) && !isnan(hum)) {
      Serial.print("T:");
      Serial.print(temp);
      Serial.print(" H:");
      Serial.println(hum);
    }

    lastDHT = millis();
  }
}