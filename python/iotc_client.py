"""
Helper compartido: provisiona un dispositivo contra IoT Central via DPS
(Device Provisioning Service) y devuelve un cliente MQTT listo para usar.

Credenciales SIEMPRE por variable de entorno, nunca en claro en el codigo
(ver seccion "Repositorio" del enunciado). Definir antes de ejecutar:

    setx IOTC_ID_SCOPE "0ne00XXXXXX"
    setx IOTC_DEVICE_ID "dev01-slot1"
    setx IOTC_DEVICE_KEY "clave-simetrica-derivada-o-individual"

La clave se deriva desde la "clave primaria de grupo" del enrollment con
compute_derived_symmetric_key(group_key, device_id) si el grupo usa
attestation por SAS de grupo, o se usa la clave individual del dispositivo.
"""
import os
import base64
import hmac
import hashlib
from azure.iot.device import ProvisioningDeviceClient, IoTHubDeviceClient


def compute_derived_symmetric_key(group_symmetric_key: str, registration_id: str) -> str:
    key = base64.b64decode(group_symmetric_key)
    signed = hmac.new(key, registration_id.encode("utf-8"), hashlib.sha256).digest()
    return base64.b64encode(signed).decode("utf-8")


def provision_and_connect(model_id: str | None = None) -> IoTHubDeviceClient:
    id_scope = os.environ["IOTC_ID_SCOPE"]
    device_id = os.environ["IOTC_DEVICE_ID"]
    device_key = os.environ["IOTC_DEVICE_KEY"]

    prov_client = ProvisioningDeviceClient.create_from_symmetric_key(
        provisioning_host="global.azure-devices-provisioning.net",
        registration_id=device_id,
        id_scope=id_scope,
        symmetric_key=device_key,
    )
    if model_id:
        prov_client.provisioning_payload = {"modelId": model_id}

    registration_result = prov_client.register()

    if registration_result.status != "assigned":
        raise RuntimeError(f"DPS registration failed: {registration_result.status}")

    hub = registration_result.registration_state.assigned_hub
    conn_str = (
        f"HostName={hub};DeviceId={device_id};SharedAccessKey={device_key}"
    )
    client = IoTHubDeviceClient.create_from_connection_string(
        conn_str,
        product_info=model_id or "",
    )
    client.connect()
    return client
