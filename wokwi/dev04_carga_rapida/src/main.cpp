/*
  Dev04 - Slot4 carga rapida. Origen: Wokwi (ESP32 virtual), simulado
  localmente con la extension "Wokwi for VS Code" + PlatformIO.
  Publica SoC estimado, potencia (W) y temperatura del conector
  directamente a IoT Central via MQTT (puerto 8883, TLS).
*/
#include <Arduino.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <DHTesp.h>

const char *WIFI_SSID = "Wokwi-GUEST";
const char *WIFI_PASS = "";

const char *IOTC_HOST = "iotc-f0b960cf-575a-4ba5-aeab-12b00bac6d26.azure-devices.net";
const char *DEVICE_ID = "dev04-slot4-carga";
const char *MQTT_USERNAME = "iotc-f0b960cf-575a-4ba5-aeab-12b00bac6d26.azure-devices.net/dev04-slot4-carga/?api-version=2021-04-12";
// Token SAS valido 7 dias desde su generacion (suficiente para el parcial). Si expira, regenerar.
const char *MQTT_SAS_TOKEN = "SharedAccessSignature sr=iotc-f0b960cf-575a-4ba5-aeab-12b00bac6d26.azure-devices.net%2Fdevices%2Fdev04-slot4-carga&sig=X9bZ5jVDAE2TPVWf8ylRWkSRBYXsD7SoK3LV9ET%2Fb6w%3D&se=1791153892";

WiFiClientSecure net;
PubSubClient mqtt(net);
DHTesp dht;

unsigned long lastSend = 0;
const unsigned long INTERVAL_MS = 15000; // asincronia: 15 s, el mas rapido de la flota

void connectWiFi() {
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  Serial.print("Conectando WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(300);
    Serial.print(".");
  }
  Serial.println(" OK");
}

void connectMQTT() {
  net.setInsecure(); // en Wokwi no se valida la cadena real de CA
  mqtt.setServer(IOTC_HOST, 8883);
  while (!mqtt.connected()) {
    Serial.println("Conectando a IoT Central (MQTT)...");
    if (mqtt.connect(DEVICE_ID, MQTT_USERNAME, MQTT_SAS_TOKEN)) {
      Serial.println("Conectado.");
    } else {
      Serial.print("fallo, rc=");
      Serial.println(mqtt.state());
      delay(2000);
    }
  }
}

void setup() {
  Serial.begin(115200);
  dht.setup(4, DHTesp::DHT22);
  connectWiFi();
}

void loop() {
  if (!mqtt.connected()) connectMQTT();
  mqtt.loop();

  if (millis() - lastSend > INTERVAL_MS) {
    lastSend = millis();
    float tempConector = 25.0 + (analogRead(34) / 4095.0) * 20.0;
    int soc = random(20, 100);
    float potencia = random(50, 300) / 10.0;

    StaticJsonDocument<256> doc;
    doc["soc_estimado"] = soc;
    doc["potencia_w"] = potencia;
    doc["temp_conector"] = tempConector;

    char buffer[256];
    size_t n = serializeJson(doc, buffer);
    String topic = String("devices/") + DEVICE_ID + "/messages/events/";
    mqtt.publish(topic.c_str(), buffer, n);

    Serial.print("[dev04] enviado: ");
    Serial.println(buffer);
  }
}
