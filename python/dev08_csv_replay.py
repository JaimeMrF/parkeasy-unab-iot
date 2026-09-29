"""
Origen adicional: replay de CSV / historico.
Dev08 - Tablero de energia. Intervalo: 45 s.

IMPORTANTE (transparencia academica): este script reproduce un log de
ejemplo (data/dev08_tablero_energia_historico.csv) como si fuera la
serie de un tablero real. El timestamp que llega a IoT Central es el de
REENVIO REAL (ahora), no una fecha falsificada del pasado. Se declara
como "replay de CSV/historico" en el catalogo -- es un origen valido
por si mismo (seccion 3), no una forma de fingir que la ventana de 4
dias ya ocurrio.
"""
import csv
import json
import os
import time
from datetime import datetime, timezone
from pathlib import Path

from iotc_client import provision_and_connect

MODEL_ID = "dtmi:unabparking:EnergyPanel;1"
INTERVAL_S = int(os.environ.get("DEV08_INTERVAL_S", "45"))
CSV_PATH = Path(__file__).parent.parent / "data" / "dev08_tablero_energia_historico.csv"


def load_rows():
    with open(CSV_PATH, newline="") as f:
        return list(csv.DictReader(f))


def main():
    client = provision_and_connect(MODEL_ID)
    rows = load_rows()
    i = 0
    while True:
        row = rows[i % len(rows)]
        payload = {
            "kwh": float(row["kwh"]),
            "corriente_a": float(row["corriente_a"]),
            "estado_breaker": row["estado_breaker"],
            "_ts_ingesta_local": datetime.now(timezone.utc).isoformat(),
            "_origen": "replay_csv",
        }
        client.send_message(json.dumps(payload))
        print("[dev08]", payload)
        i += 1
        time.sleep(INTERVAL_S)


if __name__ == "__main__":
    main()
