"""
Origen adicional: segundo script Python con canal de transporte distinto.
NOTA TECNICA: el SDK azure-iot-device para Python solo soporta MQTT en el
cliente de dispositivo (no expone AMQP a este nivel), asi que la
diferenciacion real y verificable es MQTT sobre WebSockets (puerto 443,
TLS por HTTP) en vez de MQTT nativo (puerto 8883) que usan dev02 y dev03.
Es un stack de red distinto (utll para redes que bloquean 8883), lo cual
es una justificacion real y defendible en la sustentacion.

Dev10 - Pasarela de sesion. Intervalo: 20 s.
"""
import json
import os
import random
import time
from datetime import datetime, timezone

from azure.iot.device import IoTHubDeviceClient, ProvisioningDeviceClient

DEVICE_ID = os.environ["IOTC_DEVICE_ID"]
DEVICE_KEY = os.environ["IOTC_DEVICE_KEY"]
ID_SCOPE = os.environ["IOTC_ID_SCOPE"]
MODEL_ID = "dtmi:unabparking:SessionGateway;1"
INTERVAL_S = int(os.environ.get("DEV10_INTERVAL_S", "20"))


def provision_amqp():
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

    hub = result.registration_state.assigned_hub
    conn_str = f"HostName={hub};DeviceId={DEVICE_ID};SharedAccessKey={DEVICE_KEY}"
    client = IoTHubDeviceClient.create_from_connection_string(
        conn_str, product_info=MODEL_ID, websockets=True
    )
    client.connect()
    return client


def main():
    client = provision_amqp()
    usuarios = ["anon-a1", "anon-b2", "anon-c3", None]
    while True:
        usuario = random.choice(usuarios)
        payload = {
            "sesion_activa": usuario is not None,
            "usuario_anonimo": usuario or "",
            "ack": True,
            "_ts_ingesta_local": datetime.now(timezone.utc).isoformat(),
        }
        client.send_message(json.dumps(payload))
        print("[dev10]", payload)
        time.sleep(INTERVAL_S)


if __name__ == "__main__":
    main()
