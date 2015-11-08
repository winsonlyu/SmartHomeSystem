// Drive the Grive RGB LCD (a JHD1313m1)
// We can do this in either of two ways
//
// The bext way is to use the upm library. which
// contains support for this device
//
// The alternative way is to drive the LCD directly from
// Javascript code using the i2c interface directly
// This approach is useful for learning about using
// the i2c bus. The lcd file is an implementation
// in Javascript for some of the common LCD functions

// configure jshint
/*jslint node:true, vars:true, bitwise:true, unparam:true */
/*jshint unused:true */







// change this to false to use the hand rolled version
var useUpmVersion = true;

// we want mraa to be at least version 0.6.1
var mraa = require('mraa');
var version = mraa.getVersion();

if (version >= 'v0.6.1') {
    console.log('mraa version (' + version + ') ok');
}
else {
    console.log('meaa version(' + version + ') is old - this code may not work');
}

//set up the display
    var lcd = require('jsupm_i2clcd');
    var display = new lcd.Jhd1313m1(0, 0x3E, 0x62);
    display.setCursor(0,0);
    display.write('Fang is cute');
    display.setCursor(1,0);
    display.write('and sexy');


//temperature
var analogPin0 = new mraa.Aio(0); //setup access analog input Analog pin #0 (A0)

//air quality
var analogPin1 = new mraa.Aio(1); //setup access analog input Analog pin #0 (A0)


//GROVE Kit Shield D6 --> GPIO6
//GROVE Kit Shield D2 --> GPIO2

var touch_sensor_value = 0, last_t_sensor_value;

//Touch Sensor connected to D2 connector
var digital_pin_D3 = new mraa.Gpio(3);
digital_pin_D3.dir(mraa.DIR_IN);

var digital_pin_D6 = new mraa.Gpio(6);
digital_pin_D6.dir(mraa.DIR_OUT);
digital_pin_D6.write(0);
var counter=0;

var fire = 'No'; 

//loop for show info
setInterval(function () {
        touch_sensor_value = digital_pin_D3.read();
        if (touch_sensor_value === 1 && last_t_sensor_value === 0) {

            if(counter % 3 ==0){
                //console.log("Celsius Temperature: "+tempEvent(analogPin0));
                
                showOnLCD(display,'Temperature: ',tempEvent(analogPin0));
                
            }else if(counter % 3==1){
                //console.log("Air Quality: "+airEvent(analogPin1));
                
                showOnLCD(display,'Air Quality: ',airEvent(analogPin1));
            }
            else
            {
                //console.log("Fire Detected: "+ fire);
                showOnLCD(display,'Fire: ',fire);
            }
            counter++;
            //todo: other detections
        }
        last_t_sensor_value = touch_sensor_value;
    }, 100);

//loop for update the sensor data
setInterval(function () {
        
       fire = fireDetected(display,digital_pin_D6,tempEvent(analogPin0),airEvent(analogPin1));
       
    }, 1000);



/**
 * Rotate through a color pallette and display the
 * color of the background as text
 */
function rotateColors(display) {
    var red = 0;
    var green = 0;
    var blue = 0;
    display.setColor(red, green, blue);
    setInterval(function() {
        blue += 64;
        if (blue > 255) {
            blue = 0;
            green += 64;
            if (green > 255) {
                green = 0;
                red += 64;
                if (red > 255) {
                    red = 0;
                }
            }
        }
        display.setColor(red, green, blue);
        display.setCursor(0,0);
        //display.write('red=' + red + ' grn=' + green + '  ');
        display.setCursor(1,0);
        //display.write('blue=' + blue + '   ');  // extra padding clears out previous text
        display.write('and cute');
    }, 1000);
}


//temperature event
function tempEvent(analogPin)
{
    var a = analogPin.read();
    var resistance = (1023 - a) * 10000 / a; //get the resistance of the sensor;
    var celsius_temperature = 1 / (Math.log(resistance / 10000) / 3975 + 1 / 298.15) - 273.15;//convert to temperature via datasheet ;
    return Math.round(celsius_temperature);
}
//air quality event
function airEvent(analogPin)
{
    var a = analogPin.read();
    //some caculation
    return a;
}

//fire detection
function fireDetected(display,pin,temp,air)
{
    if(temp>30)
    {
        display.setColor(255,0,0);
        pin.write(1);
        return 'Yes';
    }
    else
    {
        display.setColor(255,255,255);
        pin.write(0);
        return 'No';
    }
}
// show value on LCD
function showOnLCD(display,event,value) {
    
    display.clear();
    display.setCursor(0,0);
    display.write(event+value);
}
/**
 * Use the upm library to drive the two line display
 *
 * Note that this does not use the "lcd.js" code at all
 */
function useUpm() {
    var lcd = require('jsupm_i2clcd');
    var display = new lcd.Jhd1313m1(0, 0x3E, 0x62);
    display.setCursor(0,0);
    display.write('Fang is sexy');

   
    rotateColors(display);
}



