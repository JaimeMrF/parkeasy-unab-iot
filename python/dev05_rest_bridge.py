"""
Origen adicional: puente HTTP/REST.
Un endpoint Flask local recibe POST /totem (como si un sistema externo
de la universidad publicara el estado del totem via REST) y esta
funcion reenvia cada evento recibido hacia IoT Central. Simula un
sistema de terceros con el que no se comparte protocolo IoT nativo.

Dev05 - Totem de estacion. Intervalo: variable segun llegada de eventos,
con un heartbeat de reenvio cada 30 s si no hay eventos nuevos.

Ejecutar:
    python dev05_rest_bridge.py
Probar el puente:
    curl -X POST http://localhost:5005/totem -H "Content-Type: application/json" \
         -d "{\"cupos_libres\": 3, \"cupos_totales\": 4, \"lock_maestro\": \"armed\"}"
"""
import json
import os
import threading
import time
from datetime import datetime, timezone

from flask import Flask, request, jsonify
from iotc_client import provision_and_connect

MODEL_ID = "dtmi:unabparking:StationTotem;1"
HEARTBEAT_S = int(os.environ.get("DEV05_HEARTBEAT_S", "30"))

app = Flask(__name__)
_last_state = {"cupos_libres": 4, "cupos_totales": 4, "lock_maestro": "armed"}
_client = None


@app.post("/totem")
def receive_totem_event():
    global _last_state
    _last_state = request.get_json(force=True)
    _forward(_last_state)
    return jsonify({"status": "forwarded"})


def _forward(state: dict):
    payload = dict(state)
    payload["_ts_ingesta_local"] = datetime.now(timezone.utc).isoformat()
    _client.send_message(json.dumps(payload))
    print("[dev05] reenviado a IoT Central:", payload)


def _heartbeat_loop():
    while True:
        time.sleep(HEARTBEAT_S)
        _forward(_last_state)


def main():
    global _client
    _client = provision_and_connect(MODEL_ID)
    threading.Thread(target=_heartbeat_loop, daemon=True).start()
    app.run(host="0.0.0.0", port=5005)


if __name__ == "__main__":
    main()
