@echo off
chcp 65001 >nul
title Sistema de Adoção de Animais - AdotaPet

echo ========================================================
echo    🐾 SISTEMA DE ADOÇÃO DE ANIMAIS (100%% LOCAL)
echo ========================================================
echo.
echo Iniciando servidor backend Node.js...
echo.

cd /d "%~dp0\backend"

:: Abre o navegador automaticamente após 2 segundos
start "" cmd /c "timeout /t 2 /nobreak >nul && start http://localhost:3000"

:: Inicia o servidor Express
node server.js

pause
