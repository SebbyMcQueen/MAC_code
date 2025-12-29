@echo off
echo Installing dependencies...
pip install -r requirements.txt

echo.
echo Starting Happy Gilmore Backend Server...
python server.py
pause
