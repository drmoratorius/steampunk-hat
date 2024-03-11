const {GPIO} = require('gpio');

class GpioOnOff {
    gpioPort = null;

    constructor(gpioNo) {
        this.gpioPort = new GPIO(gpioNo, OUTPUT);
    }

    turnOn() {
        this.gpioPort.write(HIGH);
    }

    turnOff() {
        this.gpioPort.write(LOW);
    }
}

module.exports = {
    GpioOnOff
};
