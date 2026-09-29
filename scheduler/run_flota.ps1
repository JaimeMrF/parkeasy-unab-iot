# Lanza cada script Python de la flota como un Job en segundo plano DENTRO
# de esta misma sesion de PowerShell (no abre ventanas nuevas, evita el
# problema de asociacion de archivos .ps1 / "que quieres abrir esto?").
#
# Copiar devices.env.example.csv a devices.env.csv y llenar las claves
# reales antes de ejecutar. NO commitear devices.env.csv (ya excluido
# en .gitignore).
#
# Uso:
#   powershell -ExecutionPolicy Bypass -File run_flota.ps1 -IdScope "0ne00XXXXXX"
#
# Para ver el log en vivo de un dispositivo:    Receive-Job -Name dev03-slot3 -Keep
# Para ver todos los jobs activos:              Get-Job
# Para detener toda la flota:                   Get-Job | Stop-Job; Get-Job | Remove-Job

param(
    [Parameter(Mandatory = $true)]
    [string]$IdScope
)

$csvPath = Join-Path $PSScriptRoot "devices.env.csv"
if (-not (Test-Path $csvPath)) {
    Write-Error "Falta $csvPath (copia devices.env.example.csv y llena las claves reales)."
    exit 1
}

$pythonDir = Join-Path $PSScriptRoot "..\python"
$rows = Import-Csv $csvPath

foreach ($row in $rows) {
    $scriptPath = Join-Path $pythonDir $row.script
    $deviceId = $row.device_id
    $deviceKey = $row.device_key

    Write-Host "Lanzando job: $deviceId -> $($row.script)"

    Start-Job -Name $deviceId -ScriptBlock {
        param($idScope, $devId, $devKey, $pyDir, $scriptFile)
        $env:IOTC_ID_SCOPE = $idScope
        $env:IOTC_DEVICE_ID = $devId
        $env:IOTC_DEVICE_KEY = $devKey
        $env:PYTHONUNBUFFERED = "1"
        Set-Location $pyDir
        python -u $scriptFile
    } -ArgumentList $IdScope, $deviceId, $deviceKey, $pythonDir, $scriptPath | Out-Null
}

Write-Host ""
Write-Host "Flota lanzada como jobs en segundo plano. Dev01 (Digital Twin nativo) y dev04/dev09 (Wokwi) se manejan aparte."
Write-Host ""
Write-Host "Comandos utiles:"
Write-Host "  Get-Job                         -> ver estado de todos los jobs"
Write-Host "  Receive-Job -Name dev03-slot3 -Keep  -> ver el log en vivo de un dispositivo"
Write-Host "  Get-Job | Stop-Job; Get-Job | Remove-Job  -> detener y limpiar toda la flota"
Write-Host ""
Write-Host "Para la desconexion controlada real: setea DEV03_SIMULATE_DISCONNECT_AFTER=300 antes de lanzar dev03, o corre 'Stop-Job -Name dev03-slot3' unos minutos y documenta la hora exacta antes de relanzarlo."
