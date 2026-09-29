"""
Origen adicional: cliente MQTT explicito (paho-mqtt), sin el SDK
azure-iot-device. Protocolo/libreria distinta a dev03 y dev10, lo que
lo hace un origen de envio diferenciado segun la seccion 3.

Dev02 - Slot2: carga. Intervalo: 60 s.

Requiere hacer DPS manualmente (reutilizamos iotc_client solo para
provisionar y obtener el hub asignado; el envio de telemetria se hace
100% con paho, sin el SDK de mensajeria).
"""
import base64
import hashlib
import hmac
import json
import os
import random
import ssl
import time
import urllib.parse
from datetime import datetime, timezone

import paho.mqtt.client as mqtt
from azure.iot.device import ProvisioningDeviceClient

DEVICE_ID = os.environ["IOTC_DEVICE_ID"]  # p.ej. dev02-slot2
DEVICE_KEY = os.environ["IOTC_DEVICE_KEY"]
ID_SCOPE = os.environ["IOTC_ID_SCOPE"]
MODEL_ID = "dtmi:unabparking:ParkingSlot;1"
INTERVAL_S = int(os.environ.get("DEV02_INTERVAL_S", "60"))


def generate_sas_token(resource_uri: str, key: str, expiry_s: int = 3600) -> str:
    ttl = int(time.time()) + expiry_s
    sign_key = base64.b64decode(key)
    string_to_sign = f"{urllib.parse.quote_plus(resource_uri)}\n{ttl}".encode("utf-8")
    signature = base64.b64encode(hmac.new(sign_key, string_to_sign, hashlib.sha256).digest())
    return (
        f"SharedAccessSignature sr={urllib.parse.quote_plus(resource_uri)}"
        f"&sig={urllib.parse.quote_plus(signature)}&se={ttl}"
    )


def dps_assign_hub() -> str:
    prov = ProvisioningDeviceClient.create_from_symmetric_key(
        provisioning_host="global.azure-devices-provisioning.net",
        registration_id=DEVICE_ID,
        id_scope=ID_SCOPE,
        symmetric_key=DEVICE_KEY,
    )
    prov.provisioning_payload = {"modelId": MODEL_ID}
    result = prov.register()
    if result.status != "assigned":
        raise RuntimeError(f"DPS fallo: {result.status}")
    return result.registration_state.assigned_hub


def build_payload():
    return {
        "estado_carga": random.choice(["idle", "charging", "full"]),
        "corriente_a": round(random.uniform(0, 2.5), 2),
        "ocupado": random.random() < 0.5,
        "_ts_ingesta_local": datetime.now(timezone.utc).isoformat(),
    }


def main():
    hub = dps_assign_hub()
    resource_uri = f"{hub}/devices/{DEVICE_ID}"
    username = f"{hub}/{DEVICE_ID}/?api-version=2021-04-12&model-id={MODEL_ID}"
    topic = f"devices/{DEVICE_ID}/messages/events/"

    client = mqtt.Client(client_id=DEVICE_ID, protocol=mqtt.MQTTv311)
    client.username_pw_set(username=username, password=generate_sas_token(resource_uri, DEVICE_KEY))
    client.tls_set(cert_reqs=ssl.CERT_REQUIRED)
    client.connect(hub, port=8883)
    client.loop_start()
    print(f"[dev02] conectado via MQTT explicito a {hub}:8883")

    try:
        while True:
            payload = build_payload()
            client.publish(topic, json.dumps(payload), qos=1)
            print("[dev02]", payload)
            time.sleep(INTERVAL_S)
    finally:
        client.loop_stop()
        client.disconnect()


if __name__ == "__main__":
    main()
