# Ensayo local de la parte "dos codigos en dos equipos distintos" de la
# sustentacion (seccion 8 del enunciado), pero desde UNA sola maquina.
#
# Abre dev03 (Python + azure-iot-device) y dev02 (Python + paho-mqtt
# explicito) en DOS VENTANAS de consola independientes, cada una con su
# propio log en vivo -- para practicar el flujo (Connecting/Connected,
# desconexion, reconexion) sin depender de un segundo portatil.
#
# IMPORTANTE: esto es solo para ENSAYO. El dia real de la sustentacion el
# enunciado exige dos EQUIPOS FISICOS distintos ejecutando cada codigo
# (seccion 8: "Ejecuta dos codigos en dos equipos distintos"). Este script
# no reemplaza eso, solo te deja validar antes que ambos conectan sin
# chocar entre si (mismo Id Scope, credenciales distintas).
#
# Requisitos previos:
#   - scheduler/devices.env.csv con filas reales para dev02-slot2-carga y
#     dev03-slot3 (copiar de devices.env.example.csv y llenar las claves).
#   - python y las dependencias de python/requirements.txt instaladas.
#
# Uso:
#   powershell -ExecutionPolicy Bypass -File ensayo_dos_codigos.ps1 -IdScope "0ne00XXXXXX"
#
# Ensayar tambien la desconexion controlada de dev03 (corta la conexion a
# los N segundos, espera 120 s y reconecta solo, para practicar el punto 6
# del guion sin tener que matar el proceso a mano):
#   powershell -ExecutionPolicy Bypass -File ensayo_dos_codigos.ps1 -IdScope "0ne00XXXXXX" -DisconnectAfterSeconds 180

param(
    [Parameter(Mandatory = $true)]
    [string]$IdScope,

    [int]$DisconnectAfterSeconds = 0
)

$ErrorActionPreference = "Stop"

$csvPath = Join-Path $PSScriptRoot "devices.env.csv"
if (-not (Test-Path $csvPath)) {
    Write-Error "Falta $csvPath. Copia devices.env.example.csv a devices.env.csv y llena las claves reales de dev02 y dev03 antes de ensayar."
    exit 1
}

$pythonDir = Join-Path $PSScriptRoot "..\python"
$rows = Import-Csv $csvPath

$dev03 = $rows | Where-Object { $_.device_id -eq "dev03-slot3" }
$dev02 = $rows | Where-Object { $_.device_id -eq "dev02-slot2-carga" }

if (-not $dev03) { Write-Error "No encontre la fila dev03-slot3 en devices.env.csv"; exit 1 }
if (-not $dev02) { Write-Error "No encontre la fila dev02-slot2-carga en devices.env.csv"; exit 1 }

function Start-EnsayoWindow {
    param(
        [string]$Titulo,
        [string]$DeviceId,
        [string]$DeviceKey,
        [string]$ScriptFile,
        [string]$ExtraEnvLine = ""
    )

    $inner = @"
`$Host.UI.RawUI.WindowTitle = '$Titulo'
`$env:IOTC_ID_SCOPE = '$IdScope'
`$env:IOTC_DEVICE_ID = '$DeviceId'
`$env:IOTC_DEVICE_KEY = '$DeviceKey'
`$env:PYTHONUNBUFFERED = '1'
$ExtraEnvLine
Set-Location '$pythonDir'
Write-Host '=== $Titulo ===' -ForegroundColor Cyan
Write-Host 'Ctrl+C corta la conexion (simula la desconexion controlada del guion).' -ForegroundColor DarkGray
Write-Host ''
python -u '$ScriptFile'
"@

    $tmpScript = [System.IO.Path]::GetTempFileName() + ".ps1"
    Set-Content -Path $tmpScript -Value $inner -Encoding UTF8

    Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-File", "`"$tmpScript`""
}

$extraDev03 = ""
if ($DisconnectAfterSeconds -gt 0) {
    $extraDev03 = "`$env:DEV03_SIMULATE_DISCONNECT_AFTER = '$DisconnectAfterSeconds'"
    Write-Host "dev03 se desconectara solo a los $DisconnectAfterSeconds s, esperara 120 s (hueco real) y reconectara." -ForegroundColor Yellow
}

Write-Host "Abriendo ventana 1/2: dev03 (equipo 1 simulado, azure-iot-device)..." -ForegroundColor Green
Start-EnsayoWindow -Titulo "EQUIPO 1 - dev03 (azure-iot-device)" -DeviceId $dev03.device_id -DeviceKey $dev03.device_key -ScriptFile "dev03_slot_lock.py" -ExtraEnvLine $extraDev03

Start-Sleep -Seconds 2

Write-Host "Abriendo ventana 2/2: dev02 (equipo 2 simulado, paho-mqtt)..." -ForegroundColor Green
Start-EnsayoWindow -Titulo "EQUIPO 2 - dev02 (paho-mqtt)" -DeviceId $dev02.device_id -DeviceKey $dev02.device_key -ScriptFile "dev02_mqtt_paho.py"

Write-Host ""
Write-Host "Listo. Dos ventanas abiertas, cada una con su propio proceso y credenciales." -ForegroundColor Cyan
Write-Host "Verifica en IoT Central que dev02-slot2-carga y dev03-slot3 pasen a Connected casi al mismo tiempo."
Write-Host "Para cortar el ensayo: cierra ambas ventanas o Ctrl+C en cada una."
