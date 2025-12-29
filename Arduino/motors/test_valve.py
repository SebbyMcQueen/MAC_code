import serial
import time
import sys

def main():
    # Update this to match your Arduino's serial port
    arduino_port = "COM5"  # Change to your Arduino's port
    baud_rate = 9600

    try:
        ser = serial.Serial(arduino_port, baud_rate, timeout=1)
    except serial.SerialException:
        print(f"Could not open port {arduino_port}.")
        print("Make sure the port is correct and Arduino is connected.")
        sys.exit(1)

    # Give Arduino time to reset
    time.sleep(2)
    
    # Read startup message
    while ser.in_waiting > 0:
        line = ser.readline().decode('utf-8', errors='ignore').strip()
        if line:
            print(f"Arduino: {line}")

    print("\n=== Happy Gilmore Pump Test ===")
    print("Enter a score (0-100) to control pump")
    print("Score 100 = pump runs at 100% for 5 seconds")
    print("Score 50 = pump runs at 50% for 2.5 seconds")
    print("Score 0 = pump off")
    print("Type 'quit' to exit\n")

    try:
        while True:
            # Get user input
            user_input = input("Enter score (0-100): ").strip()
            
            if user_input.lower() in ['quit', 'exit', 'q']:
                print("Closing valve and exiting...")
                ser.write(b"0\n")  # Close valve before exit
                time.sleep(0.5)
                break
            
            # Validate input
            try:
                score = int(user_input)
                if 0 <= score <= 100:
                    # Send score to Arduino
                    ser.write(f"{score}\n".encode())
                    time.sleep(0.1)
                    
                    # Read Arduino response
                    while ser.in_waiting > 0:
                        line = ser.readline().decode('utf-8', errors='ignore').strip()
                        if line:
                            print(f"Arduino: {line}")
                else:
                    print("Error: Score must be between 0 and 100")
            except ValueError:
                print("Error: Please enter a valid number")
            
            print()  # Empty line for readability

    except KeyboardInterrupt:
        print("\n\nClosing valve and exiting...")
        ser.write(b"0\n")  # Close valve before exit
        time.sleep(0.5)

    finally:
        ser.close()
        print("Serial connection closed.")

if __name__ == "__main__":
    main()
