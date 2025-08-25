@echo off
title Banco Central das Bets - Control Center
:menu
cls
echo ============================================
echo        BANCO CENTRAL DAS BETS - MENU
echo ============================================
echo.
echo [1] Start Admin
echo [2] Stop Admin
echo [3] Restart Admin
echo.
echo [4] Start Site Principal
echo [5] Stop Site Principal
echo [6] Restart Site Principal
echo.
echo [0] Sair
echo.
set /p choice="Escolha uma opcao: "

if "%choice%"=="1" (
    call "C:\CRIAÇÃO DE SITES\SITES\BANCO-CENTRAL-DAS-BETS - ADMIN\bcb-admin\start-admin-clean.bat"
    pause
    goto menu
)
if "%choice%"=="2" (
    call "C:\CRIAÇÃO DE SITES\SITES\BANCO-CENTRAL-DAS-BETS - ADMIN\bcb-admin\stop-admin.bat"
    pause
    goto menu
)
if "%choice%"=="3" (
    call "C:\CRIAÇÃO DE SITES\SITES\BANCO-CENTRAL-DAS-BETS - ADMIN\bcb-admin\restart-admin.bat"
    pause
    goto menu
)
if "%choice%"=="4" (
    call "C:\CRIAÇÃO DE SITES\SITES\BANCO-CENTRAL-DAS-BETS\start-site.bat"
    pause
    goto menu
)
if "%choice%"=="5" (
    call "C:\CRIAÇÃO DE SITES\SITES\BANCO-CENTRAL-DAS-BETS\stop-site.bat"
    pause
    goto menu
)
if "%choice%"=="6" (
    call "C:\CRIAÇÃO DE SITES\SITES\BANCO-CENTRAL-DAS-BETS\restart-site.bat"
    pause
    goto menu
)
if "%choice%"=="0" (
    exit
)
goto menu
