@echo off
title Upload Rainfall Prediction to GitHub
echo =========================================================
echo    Rainfall Prediction & Meteorological AI Studio
echo              GitHub Repository Uploader
echo =========================================================
echo.

set PYTHON_CMD="C:\Users\swaya\AppData\Local\Programs\Python\Python313\python.exe"
if not exist %PYTHON_CMD% (
    set PYTHON_CMD=python
)

%PYTHON_CMD% upload_to_github.py
pause

