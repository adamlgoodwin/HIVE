@echo off
REM Quick launcher for Educational App Development Manager
title Educational App Dev Manager

REM Set execution policy for this session only
powershell -Command "Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process; .\dev-manager-clean.ps1"

pause
