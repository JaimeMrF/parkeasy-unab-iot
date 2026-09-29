# ParkEasy UNAB — Parcial 1 IoT Central

Escenario 5.5 (Parqueo de bicicletas y patinetas UNAB). Ver `docs/documento_proyecto.md`
para el documento completo del proyecto y `docs/guia_dashboard_control_room.md` para
el paso a paso de despliegue en Azure IoT Central.

## Orden de ejecución sugerido (ver guía completa en docs/)
1. Crear la app en IoT Central e importar `dtdl/*.json`.
2. Dar de alta los 10 dispositivos y configurar el enrollment de grupo (DPS).
3. `pip install -r python/requirements.txt`
4. Configurar `scheduler/devices.env.csv` (no se commitea) y correr `scheduler/run_flota.ps1`.
5. Abrir los proyectos de `wokwi/` en wokwi.com.
6. Armar Rules + Dashboard Control Room en el portal.

## Seguridad
Ninguna clave real va en este repositorio. Todo por variables de entorno o
`scheduler/devices.env.csv` (ignorado por git).

## Decisiones de diseño
- **Un origen distinto por dispositivo**: Digital Twin nativo (dev01), paho-mqtt (dev02), azure-iot-device (dev03), Wokwi (dev04, dev09), puente REST (dev05), Open-Meteo forecast (dev06), Open-Meteo Air Quality como equivalente de Atlas Weather (dev07), replay de CSV (dev08) y MQTT sobre WebSockets 443 (dev10).
- **Aprovisionamiento**: enrollment de grupo en DPS con clave simétrica derivada por dispositivo; ningún secreto en el repo.
- **Asincronía**: 15 s, 20 s, 45 s, 60 s, 300 s y evento + heartbeat de 30 s.
- **Dos códigos de la sustentación**: dev03 (Python + azure-iot-device) y dev02 (Python + paho-mqtt), en equipos distintos (`scheduler/ensayo_dos_codigos.ps1`).
- **Limitación conocida**: los grupos de dispositivos de IoT Central no permiten unir varias plantillas con "O"; el KPI de flota queda limitado al grupo `ParkingSlot` (ver `docs/documento_proyecto.md`, sección 7).
- **Wokwi**: cada proyecto en `wokwi/` se abre en wokwi.com (SSID `Wokwi-GUEST`).
