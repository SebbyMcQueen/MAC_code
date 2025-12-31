from flask import Flask, request, jsonify
from flask_cors import CORS
import serial
import serial.tools.list_ports
import time
import sys

app = Flask(__name__)
CORS(app)  # Allow requests from the Next.js frontend

# Arduino configuration
ARDUINO_PORT = "COM5"  # Change this to your Arduino port
BAUD_RATE = 9600
ser = None

def get_serial_connection():
    """Get or create serial connection to Arduino"""
    global ser
    if ser is None or not ser.is_open:
        try:
            ser = serial.Serial(ARDUINO_PORT, BAUD_RATE, timeout=1)
            time.sleep(2)  # Wait for Arduino to reset
            print(f"[OK] Connected to Arduino on {ARDUINO_PORT}")
            # Read startup message
            while ser.in_waiting > 0:
                line = ser.readline().decode('utf-8', errors='ignore').strip()
                if line:
                    print(f"Arduino: {line}")
        except serial.SerialException as e:
            print(f"[WARNING] Could not open serial port {ARDUINO_PORT}: {e}")
            print("\nAvailable ports:")
            ports = list(serial.tools.list_ports.comports())
            if ports:
                for port in ports:
                    print(f"  - {port.device}: {port.description}")
            else:
                print("  No serial ports found")
            print("\n[INFO] Server will start without Arduino connection")
            return None
    return ser

def send_score_to_arduino(score):
    """Send score to Arduino to control valve"""
    connection = get_serial_connection()
    if connection is None:
        return False, "No Arduino connection"
    
    try:
        # Validate score
        if not (0 <= score <= 100):
            return False, "Score must be between 0 and 100"
        
        # Send score to Arduino
        connection.write(f"{score}\n".encode())
        time.sleep(0.1)
        
        # Read Arduino response
        response = ""
        while connection.in_waiting > 0:
            line = connection.readline().decode('utf-8', errors='ignore').strip()
            if line:
                response = line
                print(f"Arduino: {line}")
        
        return True, response if response else f"Score {score} sent to Arduino"
    
    except Exception as e:
        return False, f"Error sending to Arduino: {str(e)}"

@app.route('/api/control-valve', methods=['POST'])
def control_valve():
    """API endpoint to control valve based on score"""
    try:
        data = request.json
        score = data.get('score')
        player_name = data.get('name', 'Unknown')
        
        if score is None:
            return jsonify({'error': 'Score is required'}), 400
        
        # Convert to int and validate
        try:
            score = int(score)
        except (ValueError, TypeError):
            return jsonify({'error': 'Score must be a number'}), 400
        
        # Send to Arduino
        success, message = send_score_to_arduino(score)
        
        if success:
            print(f"✓ Valve opened {score}% for {player_name}")
            return jsonify({
                'success': True,
                'message': message,
                'score': score,
                'player': player_name
            })
        else:
            return jsonify({'error': message}), 500
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/reset-valve', methods=['POST'])
def reset_valve():
    """Close the valve (score = 0)"""
    success, message = send_score_to_arduino(0)
    if success:
        return jsonify({'success': True, 'message': 'Valve closed'})
    else:
        return jsonify({'error': message}), 500

@app.route('/api/test-connection', methods=['GET'])
def test_connection():
    """Test if Arduino is connected"""
    connection = get_serial_connection()
    if connection:
        return jsonify({
            'connected': True,
            'port': ARDUINO_PORT,
            'message': 'Arduino connected'
        })
    else:
        return jsonify({
            'connected': False,
            'message': 'Arduino not connected'
        }), 500

@app.route('/api/ports', methods=['GET'])
def list_ports():
    """List available serial ports"""
    ports = []
    for port in serial.tools.list_ports.comports():
        ports.append({
            'device': port.device,
            'description': port.description
        })
    return jsonify({'ports': ports})

@app.route('/', methods=['GET'])
def home():
    """Health check"""
    return jsonify({
        'status': 'Happy Gilmore Valve Controller Backend',
        'version': '1.0',
        'arduino_port': ARDUINO_PORT
    })

def cleanup():
    """Close serial connection on shutdown"""
    global ser
    if ser and ser.is_open:
        print("\nClosing valve and serial connection...")
        try:
            ser.write(b"0\n")  # Close valve
            time.sleep(0.5)
            ser.close()
        except:
            pass

if __name__ == '__main__':
    import atexit
    atexit.register(cleanup)
    
    print("="*50)
    print("Happy Gilmore Valve Controller - Backend Server")
    print("="*50)
    print(f"Arduino Port: {ARDUINO_PORT}")
    print(f"Server URL: http://localhost:5000")
    print("\nAPI Endpoints:")
    print("  POST /api/control-valve  - Send score to control valve")
    print("  POST /api/reset-valve    - Close valve")
    print("  GET  /api/test-connection - Test Arduino connection")
    print("  GET  /api/ports          - List available ports")
    print("="*50)
    
    # Test Arduino connection on startup (non-fatal if it fails)
    print("\nTesting Arduino connection...")
    if get_serial_connection():
        print("[OK] Arduino is ready")
    else:
        print("[WARNING] Arduino not connected - valve control will not work")
    
    print("\nStarting Flask server...")
    try:
        app.run(debug=False, host='0.0.0.0', port=5000)
    except KeyboardInterrupt:
        cleanup()
        sys.exit(0)
