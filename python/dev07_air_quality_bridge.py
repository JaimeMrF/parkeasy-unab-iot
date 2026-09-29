"""
Origen 5 (catalogo): Atlas Weather o equivalente.
Equivalente usado: Open-Meteo Air Quality API (dominio distinto al de
dev06, que consume el endpoint de pronostico). Real, publico, sin key.

Dev07 - Calidad de aire del anden. Intervalo: 60 s.
Justificar en el documento: se sustituye Atlas Weather (feed de pago /
convenio institucional no disponible) por un feed real de calidad de
aire de dominio distinto, documentado explicitamente como sustituto.
"""
import json
import os
import time
from datetime import datetime, timezone

import requests
from iotc_client import provision_and_connect

MODEL_ID = "dtmi:unabparking:EnvironmentalNode;1"
INTERVAL_S = int(os.environ.get("DEV07_INTERVAL_S", "60"))

LAT, LON = 7.1193, -73.1227
API_URL = (
    f"https://air-quality-api.open-meteo.com/v1/air-quality?latitude={LAT}"
    f"&longitude={LON}&current=pm2_5,us_aqi&timezone=auto"
)


def fetch_air_quality():
    resp = requests.get(API_URL, timeout=10)
    resp.raise_for_status()
    data = resp.json()["current"]
    return {
        "pm25": data["pm2_5"],
        "aqi": data["us_aqi"],
        "_ts_fuente": data["time"],
    }


def main():
    client = provision_and_connect(MODEL_ID)
    client.patch_twin_reported_properties(
        {"fuente_dato": "Open-Meteo Air Quality API (sustituto documentado de Atlas Weather)"}
    )

    while True:
        try:
            payload = fetch_air_quality()
            payload["_ts_ingesta_local"] = datetime.now(timezone.utc).isoformat()
            client.send_message(json.dumps(payload))
            print("[dev07]", payload)
        except Exception as exc:
            print("[dev07] error consultando API de calidad de aire:", exc)
        time.sleep(INTERVAL_S)


if __name__ == "__main__":
    main()
