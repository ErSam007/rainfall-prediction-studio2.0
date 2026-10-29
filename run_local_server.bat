@echo off
title Rainfall Prediction Studio - Live Server
echo =========================================================
echo    Rainfall Prediction & Meteorological AI Studio
echo                Unified Web Server
echo =========================================================
echo.
echo Starting FastAPI & React Studio on http://localhost:8000 ...
echo.

set PYTHON_CMD="C:\Users\swaya\AppData\Local\Programs\Python\Python313\python.exe"
if not exist %PYTHON_CMD% (
    set PYTHON_CMD=python
)

cd backend
%PYTHON_CMD% -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
pause

