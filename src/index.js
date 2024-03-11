const {Button} = require('button'),
    {Atomizer} = require('./inc/Atomizer.js'),
    {GpioOnOff} = require('./inc/GpioOnOff.js'),
    {Buzzer} = require('./inc/Buzzer.js'),
    {NeoPixelAnimator} = require('./inc/NeoPixelAnimator.js');

// CONFIG
const
    debug = true,
    gpioPins = {
        neopixel: 0,
        buttonNextProgram: 13,
        buttonToggleSteam: 16,
        atomizer: 22,
        candle: 21,
        motor: 20,
        buzzer: 17
    },
    motorIntervalSec = 10,
    motorIntervalRunSec = 3;
// END OF CONFIG

console.log('\n');
console.log('*** STEAMPUNK GLASSES V1.6 (09.03.2024) ***');
console.log('*******************************************');
console.log(`Running on "${board.name}" - ${board.uid}`);

/**
 * SETUP
 */
// Button (reed contact) handling
const btnGlasses = new Button(gpioPins.buttonNextProgram, {
        mode: INPUT_PULLUP,
        event: FALLING,
        debounce: 100
    }),
    btnSteam = new Button(gpioPins.buttonToggleSteam, {
        mode: INPUT_PULLUP,
        event: FALLING,
        debounce: 100
    }),
    glasses = new NeoPixelAnimator(gpioPins.neopixel, 24, 10, false), // GPIO0, 24 LEDs, 10ms interval, debug mode
    atomizer = new Atomizer(gpioPins.atomizer),
    candle = new GpioOnOff(gpioPins.candle),
    motor = new GpioOnOff(gpioPins.motor),
    buzzer = new Buzzer(gpioPins.buzzer);
btnGlasses.on('click', function () {
    if (debug) console.log('GLASSES BUTTON clicked');
    glasses.nextProgram();
    buzzer.beep(glasses.currentProg + 1); // Beep to indicate color
});

btnSteam.on('click', function () {
    if (debug) console.log('STEAM BUTTON clicked');
    const curSteamMode = atomizer.getMode();
    if (curSteamMode === 'OFF') {
        buzzer.beepAlt(5);
        if (debug) console.log('Atomizer ON');
        atomizer.setMode('INTERVAL');
    } else {
        buzzer.beepAlt(2);
        if (debug) console.log('Atomizer OFF');
        atomizer.setMode('OFF');
    }
});


/**
 * MAIN PROGRAM
 */

// Play startup sound
buzzer.play(8, 120, '5eDeDe4b5dc4a---');

glasses.start();
candle.turnOn();

setTimeout(function () {
    if (debug) console.log('Turning on atomizer');
    atomizer.setMode('INTERVAL');
//motor.turnOn();
}, 2500);

// Motor
let motorOn = false;
setInterval(function () {
    motor.turnOn();
    motorOn = true;
    setTimeout(function () {
        motor.turnOff();
        motorOn = false;
    }, motorIntervalRunSec * 1000);
}, motorIntervalSec * 1000);
