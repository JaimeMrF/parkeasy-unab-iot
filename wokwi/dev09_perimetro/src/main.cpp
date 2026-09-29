/*
  Dev09 - Perimetro / evento nocturno. Origen: segunda instancia Wokwi,
  simulada localmente con la extension "Wokwi for VS Code" + PlatformIO.
  Publica movimiento, lux nocturno y estado de puerta.
*/
#include <Arduino.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

const char *WIFI_SSID = "Wokwi-GUEST";
const char *WIFI_PASS = "";

const char *IOTC_HOST = "iotc-f0b960cf-575a-4ba5-aeab-12b00bac6d26.azure-devices.net";
const char *DEVICE_ID = "dev09-perimetro";
const char *MQTT_USERNAME = "iotc-f0b960cf-575a-4ba5-aeab-12b00bac6d26.azure-devices.net/dev09-perimetro/?api-version=2021-04-12";
// Token SAS valido 7 dias desde su generacion (suficiente para el parcial). Si expira, regenerar.
const char *MQTT_SAS_TOKEN = "SharedAccessSignature sr=iotc-f0b960cf-575a-4ba5-aeab-12b00bac6d26.azure-devices.net%2Fdevices%2Fdev09-perimetro&sig=wIeyLFan3uQKxnPO2wQtUtpfzw4sTRGmVp8Y7XBEzm0%3D&se=1791153896";

const int PIN_PIR = 5;
const int PIN_LDR = 34;

WiFiClientSecure net;
PubSubClient mqtt(net);

unsigned long lastSend = 0;
const unsigned long INTERVAL_MS = 60000; // asincronia: 60 s

bool puertaAbierta = false;

void connectWiFi() {
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  while (WiFi.status() != WL_CONNECTED) delay(300);
}

void connectMQTT() {
  net.setInsecure();
  mqtt.setServer(IOTC_HOST, 8883);
  while (!mqtt.connected()) {
    mqtt.connect(DEVICE_ID, MQTT_USERNAME, MQTT_SAS_TOKEN);
    if (!mqtt.connected()) delay(2000);
  }
}

void setup() {
  Serial.begin(115200);
  pinMode(PIN_PIR, INPUT);
  connectWiFi();
}

void loop() {
  if (!mqtt.connected()) connectMQTT();
  mqtt.loop();

  bool movimiento = digitalRead(PIN_PIR) == HIGH;
  if (movimiento) puertaAbierta = true;

  if (millis() - lastSend > INTERVAL_MS) {
    lastSend = millis();
    float lux = analogRead(PIN_LDR) / 4095.0 * 100.0;

    StaticJsonDocument<256> doc;
    doc["movimiento"] = movimiento;
    doc["lux_nocturno"] = lux;
    doc["puerta"] = puertaAbierta ? "open" : "closed";

    char buffer[256];
    size_t n = serializeJson(doc, buffer);
    String topic = String("devices/") + DEVICE_ID + "/messages/events/";
    mqtt.publish(topic.c_str(), buffer, n);

    Serial.print("[dev09] enviado: ");
    Serial.println(buffer);
    puertaAbierta = false;
  }
}
