"""
Origen 3 (catalogo): Python + azure-iot-device (DPS + MQTT).
Dev03 - Slot 3: seguro y ocupacion. Intervalo: 15 s (rapido, uso activo).

Incluye:
- Envio periodico de telemetria.
- Manejo de property writable (intervalo_muestreo_s).
- Manejo de comando toggleLock (para la demo en vivo / sustentacion).
- Punto de desconexion controlada: variable DEV03_SIMULATE_DISCONNECT_AFTER
  permite cortar la conexion N segundos despues de iniciar, para dejar
  evidencia real de Disconnected -> reconexion (no simulada por edicion
  de datos, sino un corte real del proceso).
"""
import json
import os
import random
import time
from datetime import datetime, timezone

from azure.iot.device import MethodResponse
from iotc_client import provision_and_connect

MODEL_ID = "dtmi:unabparking:ParkingSlot;1"
INTERVAL_S = int(os.environ.get("DEV03_INTERVAL_S", "15"))
DISCONNECT_AFTER_S = os.environ.get("DEV03_SIMULATE_DISCONNECT_AFTER")

lock_state = "closed"


def build_payload():
    return {
        "lock_state": lock_state,
        "ocupado": random.random() < 0.6,
        "lux": round(random.uniform(50, 400), 1),
    }


def on_command(request):
    global lock_state
    if request.name == "toggleLock":
        estado = request.payload.get("estado", "closed")
        lock_state = estado
        print(f"[CMD] toggleLock -> {estado}")
        request_response = MethodResponse.create_from_method_request(
            request, 200, {"result": "ok", "lock_state": lock_state}
        )
    else:
        request_response = MethodResponse.create_from_method_request(
            request, 404, {"result": "unknown command"}
        )
    return request_response


def main():
    client = provision_and_connect(MODEL_ID)
    client.on_method_request_received = lambda req: client.send_method_response(on_command(req))

    started = time.monotonic()
    while True:
        payload = build_payload()
        payload["_ts_ingesta_local"] = datetime.now(timezone.utc).isoformat()
        client.send_message(json.dumps(payload))
        print("[dev03]", payload)

        if DISCONNECT_AFTER_S and time.monotonic() - started > float(DISCONNECT_AFTER_S):
            print("[dev03] Desconexion controlada real para evidencia de la flota...")
            client.disconnect()
            time.sleep(120)  # hueco real y documentado
            client.connect()
            started = time.monotonic()
            os.environ.pop("DEV03_SIMULATE_DISCONNECT_AFTER", None)

        time.sleep(INTERVAL_S)


if __name__ == "__main__":
    main()
