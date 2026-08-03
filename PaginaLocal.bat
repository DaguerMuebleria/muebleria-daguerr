@echo off
cd /d "reiz"

for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4"') do (
    set "IP=%%a"
    goto :found
)

:found
set "IP=%IP:~1%"
echo Usando IP automatica: %IP%
npx live-server --host=%IP%
pause