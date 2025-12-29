# Happy Gilmore Valve Controller - Complete System

This system controls a valve proportionally based on player scores from the Happy Gilmore ball-hitting game.

## 🎯 System Overview

1. **Web App** (Next.js) - Players enter their ball speed
2. **Backend Server** (Python Flask) - Communicates with Arduino
3. **Arduino** - Controls valve opening based on score

## 📦 Components

### 1. Arduino Hardware
- **Arduino Board** (Uno, Nano, etc.)
- **Pump Motor** connected to pins 5 (positive) and 6 (negative)
- **LED** on pin 1 for status indication
- **Button** on pin 0 for manual stop (optional)
- Controls pump speed and duration based on score

### 2. Backend Server (`backend/server.py`)
- Python Flask API
- Serial communication with Arduino
- Runs on `http://localhost:5000`

### 3. Web App (`../Web/`)
- Next.js frontend
- Score calculation & leaderboard
- Sends scores to backend

## 🚀 Setup Instructions

### Step 1: Upload Arduino Code

1. Open `motors/First_Sketch.ino` in Arduino IDE
2. Select your board and COM port
3. Upload the sketch
4. Note your COM port (e.g., COM9)
5. Wire pump motor to pins 5 (pos) and 6 (neg)

### Step 2: Start Backend Server

1. Update the COM port in `backend/server.py` (line 12):
   ```python
   ARDUINO_PORT = "COM9"  # Change to your Arduino port
   ```

2. Install dependencies and start server:
   ```bash
   cd Arduino/backend
   pip install -r requirements.txt
   python server.py
   ```
   
   Or simply double-click `start.bat`

3. You should see: `✓ Connected to Arduino on COM9`

### Step 3: Start Web App

1. Open a new terminal in the `Web` folder:
   ```bash
   cd Web
   npm install
   npm run dev
   ```

2. Open browser to `http://localhost:3000`

## 🎮 How to Use

1. Enter player name
2. Enter ball speed (km/h)
3. Click "Ajouter"
4. The valve will open proportionally to the score!

### Score Calculation
```
Happy's speed = 67 km/h
Score = max(0, 100 - abs(67 - playerSpeed) * 2)

Examples:
- 67 km/h → Score 100 → Valve 100% open
- 57 km/h → Score 80 → Valve 80% open
- 17 km/h → Score 0 → Valve closed
```

## 🔧 API Endpoints

- `POST /api/control-valve` - Send score to Arduino
  ```json
  {"score": 85, "name": "Player Name", "ballSpeed": 62}
  ```

- `POST /api/reset-valve` - Close valve (score = 0)
- `GET /api/test-connection` - Test Arduino connection
- `GET /api/ports` - List available COM ports

## 🐛 Troubleshooting

**Backend can't connect to Arduino:**
- Check COM port in `server.py`
- Run `GET /api/ports` to list available ports
- Make sure Arduino IDE Serial Monitor is closed

**Web app can't connect to backend:**
- Make sure backend is running on port 5000
- Check browser console for errors

**Valve doesn't move:**
- Check servo connections (pin 9, power, ground)
- Test with `motors/test_valve.py` directly
- Adjust `VALVE_CLOSED` and `VALVE_OPEN` in motors.ino

## 📁 File Structure

```
Arduino/
  ├── backend/
  │   ├── server.py          # Flask backend API
  │   ├── requirements.txt   # Python dependencies
  │   └── start.bat         # Quick start script
  ├── motors/
  │   ├── First_Sketch.ino  # Main Arduino code (pump control)
  │   └── test_valve.py     # Manual testing script
  └── README.md             # This file

Web/
  └── components/
      └── leaderboard-table.tsx  # Sends scores to backend
```

## 🎮 How It Works

When a player's score is calculated:
- **Score 100** → Pump runs at 100% speed for 5 seconds (max liquid)
- **Score 50** → Pump runs at 50% speed for 2.5 seconds
- **Score 0** → Pump doesn't run (no liquid)

The pump automatically stops after the duration. Button on pin 0 can manually stop the pump.
