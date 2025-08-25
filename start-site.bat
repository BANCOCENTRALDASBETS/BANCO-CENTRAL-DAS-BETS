@echo off
setlocal

REM === Ir para a pasta correta ===
cd /d "C:\CRIAÇÃO DE SITES\SITES\BANCO-CENTRAL-DAS-BETS"

REM === Subir o servidor em nova janela e abrir o navegador ===
start "" cmd /c http-server -a 127.0.0.1 -p 9090
timeout /t 2 >NUL
start "" "http://127.0.0.1:9090/index.html"

echo Site principal iniciado com sucesso!
pause
