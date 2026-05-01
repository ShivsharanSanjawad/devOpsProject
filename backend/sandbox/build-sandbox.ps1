Write-Host "--- Devhacks Sandbox Build Tool ---" -ForegroundColor Cyan

# Check if Docker is running
docker ps >$null 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}

$sandboxDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Write-Host "Building image from: $sandboxDir" -ForegroundColor Gray

docker build -t devhacks-sandbox "$sandboxDir"

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n[SUCCESS] Sandbox image 'devhacks-sandbox' is ready." -ForegroundColor Green
    Write-Host "The backend will now use this for secure code execution." -ForegroundColor White
} else {
    Write-Host "`n[ERROR] Failed to build the sandbox image." -ForegroundColor Red
    exit $LASTEXITCODE
}
