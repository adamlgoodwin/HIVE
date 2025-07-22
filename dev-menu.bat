@echo off
title Educational App - Development Menu
cd /d "%~dp0"
powershell -ExecutionPolicy Bypass -File "dev-workflow.ps1"
pause
