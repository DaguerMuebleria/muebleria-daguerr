@echo off
title Sincronizar Muebleria Daguerr con GitHub
echo ==========================================
echo   Cambiando a la carpeta del proyecto...
echo ==========================================

:: REEMPLAZA ESTA RUTA si tu carpeta está en otro directorio exacto
cd /d C:\Users\Luis Garza\muebleria-daguerr

echo.
echo ==========================================
echo   Subiendo cambios a GitHub automaticamente...
echo ==========================================

git add .
set /p mensaje="Escribe un mensaje para el commit (o presiona Enter para usar uno por defecto): "
if "%mensaje%"=="" set mensaje="Actualizacion rapida desde script bat"

git commit -m "%mensaje%"
git push

echo.
echo ==========================================
echo   ¡Proceso finalizado con exito!
echo ==========================================
pause