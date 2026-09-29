# Guía rápida: IoT Central + Dashboard "ParkEasy UNAB" (paso a paso, ~45–60 min)

## 1. Crear la aplicación (5 min)
1. https://apps.azureiotcentral.com/ → **Build** → plantilla **Custom app**.
2. Nombre: `ParkEasy UNAB`. Plan: gratuito (7 días) o el del curso.
3. En **Administration → Application settings**, sube el logo del escenario (icono de bicicleta/patineta) y cambia el nombre visible.

## 2. Importar los Device Templates (10 min)
1. **Device templates → + New → IoT device → Custom**.
2. Para cada archivo en `dtdl/*.json`: **Import a model**, sube el JSON, publícalo (**Publish**).
3. Repite para los 6 archivos: `ParkingSlot`, `StationTotem`, `EnvironmentalNode`, `EnergyPanel`, `PerimeterNode`, `SessionGateway`.
4. En cada template, pestaña **Views → Generate default views** para tener algo navegable de inmediato; luego personaliza.

## 3. Crear el enrollment de grupo en DPS (5 min)
1. **Administration → Device connection groups** (o el enrollment de grupo por defecto de IoT Central).
2. Copia el **ID scope** y la **clave primaria de grupo** — estos van en `IOTC_ID_SCOPE` y se usan para derivar `IOTC_DEVICE_KEY` por dispositivo con `compute_derived_symmetric_key` (en `python/iotc_client.py`).

## 4. Dar de alta los 10 dispositivos (5 min)
1. **Devices → + New** por cada uno de los 10, asignando el Device Template correspondiente según la tabla del catálogo (sección 3 del documento).
2. Para `dev01-slot1`, en vez de conectar código real, usa el simulador nativo: al crear el dispositivo marca **Simulated: On** (esto es el origen "Digital Twin / simulador nativo").

## 5. Ejecutar la flota real (según tu tiempo disponible)
1. `pip install -r python/requirements.txt`
2. Copia `scheduler/devices.env.example.csv` → `scheduler/devices.env.csv` y pon las claves derivadas reales.
3. `./scheduler/run_flota.ps1 -IdScope "<tu ID scope>"`
4. Abre los dos proyectos Wokwi (`wokwi/dev04_carga_rapida`, `wokwi/dev09_perimetro`) en https://wokwi.com/, pega el `sketch.ino`, reemplaza host/usuario/token MQTT y dale Play.
5. Deja correr al menos unos minutos para ver `Connected` con telemetría viva en varios dispositivos a la vez.

## 6. Rules (10 min)
Crea en **Rules**, una por categoría, sin mezclar umbrales:
- **Regla de ocupación alta**: `cupos_libres` < 1 → notificación.
- **Regla de sobretemperatura de carga**: `temp_conector` > 45 → notificación.
- **Regla de calidad de aire**: `aqi` > 100 → notificación.
- **Regla de desconexión**: usa la condición de estado de conexión del dispositivo (o un webhook simple) para marcar cuando dev03 pase a Disconnected.

## 7. Dashboard "Control Room" (15–20 min)
**Dashboards → + New → Personal/Application dashboard**, nómbralo `ParkEasy UNAB — Control Room`:
1. Tile de imagen/markdown con el logo y nombre del escenario arriba de todo.
2. Tile **Device group** o KPI mostrando conteo Connected/Disconnected (créalo desde una vista de "Device groups" filtrando por estado).
3. Al menos 4 tiles de gráfico de línea: ocupación (dev01–04), `temp_conector` (dev04), `pm25` (dev07), `kwh` (dev08).
4. Tiles KPI: último valor de `cupos_libres`, máximo `temp_conector` del día, último `pm25`.
5. Tile de **Rules/Notifications** recientes.
6. Tile de imagen estática con el mapa de zonas del parqueadero (puedes generar el mapa como imagen en Figma/PowerPoint y subirlo).

## 8. Desconexión controlada real (para la evidencia y la sustentación)
- Antes de lanzar `dev03_slot_lock.py`, define `DEV03_SIMULATE_DISCONNECT_AFTER=180` (segundos) para que el propio script corte y reconecte la sesión MQTT de forma real, dejando un hueco documentado y verificable en la vista del dispositivo.
- Alternativa manual: cierra la ventana de PowerShell de un dispositivo, espera unos minutos observando el estado pasar a `Disconnected` en Central, y vuelve a lanzarlo. Anota la hora exacta de corte y de reconexión para la sección 6 del documento.

## 9. Para la sustentación en persona
- Equipo 1: `python dev03_slot_lock.py` (Python real).
- Equipo 2: Wokwi abierto en el navegador con `dev04` o `dev09` corriendo.
- Ten el Control Room abierto en un tercer monitor/pestaña, y provoca en vivo el corte de dev03 para mostrar `Connecting → Connected` y el hueco.
