"""
Origen 4 (catalogo): API publica (Open-Meteo, real, sin API key).
Dev06 - Clima del punto de parqueo. Intervalo: 5 min (300 s).

Consulta datos meteorologicos REALES de Bucaramanga (coordenadas del
campus UNAB) y los reenvia a IoT Central. Se conserva timestamp de la
fuente y de ingestion, tal como pide la seccion 3 del enunciado.
"""
import json
import os
import time
from datetime import datetime, timezone

import requests
from iotc_client import provision_and_connect

MODEL_ID = "dtmi:unabparking:EnvironmentalNode;1"
INTERVAL_S = int(os.environ.get("DEV06_INTERVAL_S", "300"))

# Coordenadas aproximadas del campus UNAB, Bucaramanga
LAT, LON = 7.1193, -73.1227
API_URL = (
    f"https://api.open-meteo.com/v1/forecast?latitude={LAT}&longitude={LON}"
    "&current=temperature_2m,relative_humidity_2m,precipitation&timezone=auto"
)


def fetch_weather():
    resp = requests.get(API_URL, timeout=10)
    resp.raise_for_status()
    data = resp.json()["current"]
    return {
        "temp_c": data["temperature_2m"],
        "hr_pct": data["relative_humidity_2m"],
        "lluvia_mm": data["precipitation"],
        "_ts_fuente": data["time"],
    }


def main():
    client = provision_and_connect(MODEL_ID)
    client.patch_twin_reported_properties({"fuente_dato": "Open-Meteo (api.open-meteo.com)"})

    while True:
        try:
            payload = fetch_weather()
            payload["_ts_ingesta_local"] = datetime.now(timezone.utc).isoformat()
            client.send_message(json.dumps(payload))
            print("[dev06]", payload)
        except Exception as exc:
            print("[dev06] error consultando API publica:", exc)
        time.sleep(INTERVAL_S)


if __name__ == "__main__":
    main()
