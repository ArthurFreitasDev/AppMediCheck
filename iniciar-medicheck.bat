@echo off
cd /d "%~dp0"

start "MediCheck API" cmd /k "if exist .venv\Scripts\python.exe (.venv\Scripts\python.exe -m uvicorn main:app --app-dir API --reload) else (python -m uvicorn main:app --app-dir API --reload)"
start "MediCheck Web" cmd /k "npm.cmd run dev"
