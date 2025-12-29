// Happy Gilmore Pump Controller
// Serial control for pump based on player score (0-100)

const int buttonPin = 0;  // the number of the pushbutton pin
const int ledPin = 1;     // the number of the LED pin

const int pumpPosPin = 5;
const int pumpNegPin = 6;

int currentScore = 0;
int pumpSpeed = 0;
unsigned long pumpStartTime = 0;
unsigned long pumpDuration = 0;
bool pumpRunning = false;

void setup() {
  Serial.begin(9600);  // Enable serial communication
  pinMode(ledPin, OUTPUT);
  pinMode(pumpPosPin, OUTPUT);
  pinMode(pumpNegPin, OUTPUT);
  pinMode(buttonPin, INPUT);
  
  resetMotor();
  Serial.println("Happy Gilmore Pump Controller Ready!");
  Serial.println("Send score (0-100) to control pump");
}

void setMotor(bool clockwise, int speed){
  analogWrite((clockwise ? pumpPosPin : pumpNegPin), speed);
  analogWrite((clockwise ? pumpNegPin : pumpPosPin), 0);
}

void resetMotor(){
  digitalWrite(pumpPosPin, HIGH);
  digitalWrite(pumpNegPin, HIGH);
  digitalWrite(ledPin, LOW);
  pumpRunning = false;
}

void runPumpForScore(int score) {
  if (score < 0) score = 0;
  if (score > 100) score = 100;
  
  currentScore = score;
  
  // Always use 40% intensity (40% of 255 = 102)
  pumpSpeed = 102;
  
  // Calculate duration: score 100 = 10 seconds, proportionally less for lower scores
  pumpDuration = map(score, 0, 100, 0, 10000);
  
  if (score > 0) {
    setMotor(false, pumpSpeed);  // false = counterclockwise (dispense)
    digitalWrite(ledPin, HIGH);
    pumpRunning = true;
    pumpStartTime = millis();
    
    Serial.print("Score: ");
    Serial.print(score);
    Serial.print("% | Speed: 40% (");
    Serial.print(pumpSpeed);
    Serial.print("/255) | Duration: ");
    Serial.print(pumpDuration);
    Serial.println("ms");
  } else {
    resetMotor();
    Serial.println("Score: 0 | Pump OFF");
  }
}

void loop() {
  // Check for serial commands
  if (Serial.available() > 0) {
    String incoming = Serial.readStringUntil('\n');
    incoming.trim();
    
    int score = incoming.toInt();
    
    if (score >= 0 && score <= 100) {
      runPumpForScore(score);
    } else {
      Serial.println("ERROR: Score must be between 0-100");
    }
  }
  
  // Check button (manual override - stops pump)
  // Disabled - uncomment if you have a physical button connected
  // int buttonState = digitalRead(buttonPin);
  // if (buttonState == HIGH && pumpRunning) {
  //   resetMotor();
  //   Serial.println("Pump stopped by button");
  // }
  
  // Auto-stop pump after duration
  if (pumpRunning && (millis() - pumpStartTime >= pumpDuration)) {
    resetMotor();
    Serial.println("Pump completed");
  }
}

