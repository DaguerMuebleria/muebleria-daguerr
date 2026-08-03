@echo off
title Panel Admin - Muebleria Daguerr
echo Iniciando servidor local...
cd /d "%~dp0"
start http://localhost:3000/admin
npm start
pause