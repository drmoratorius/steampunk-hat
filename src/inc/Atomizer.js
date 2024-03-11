const {GPIO} = require('gpio');

class Atomizer {
    delay = 300; // Delay for pushing the virtual button down
    atomizerState = 'CONTINUOUS';
    gpioPort = null;

    constructor(gpioNo) {
        this.gpioPort = new GPIO(gpioNo, OUTPUT);
    }

    /**
     * Simulates pushing the physical button on the atomizer board
     */
    pushButton(del = 300) {
        this.gpioPort.write(HIGH);
        delay(this.delay);
        this.gpioPort.write(LOW);
    }

    getMode()
    {
        return this.atomizerState;
    }

    /**
     * We have to remember the current mode because we have to virtually "push"
     * the physical button on the board switched by 4066 CMOS
     *
     * @param {string} mode OFF | CONTINUOUS | INTERVAL
     */
    setMode(mode) {
        if (mode === 'OFF') {
            if (this.atomizerState === 'OFF') {
            } else if (this.atomizerState === 'CONTINUOUS') {
                this.pushButton();
                delay(this.delay);
                this.pushButton();
            } else {
                // INTERVAL
                this.pushButton();
            }
            this.atomizerState = mode;
        } else if (mode === 'CONTINUOUS') {
            if (this.atomizerState === 'OFF') {
                this.pushButton();
            } else if (this.atomizerState === 'CONTINUOUS') {
            } else {
                // INTERVAL
                this.pushButton();
                delay(this.delay);
                this.pushButton();
            }
            this.atomizerState = mode;
        } else if (mode === 'INTERVAL') {
            if (this.atomizerState === 'OFF') {
                this.pushButton();
                delay(this.delay);
                this.pushButton();
            } else if (this.atomizerState === 'CONTINUOUS') {
                this.pushButton();
            } else {
                // INTERVAL
            }
            this.atomizerState = mode;
        }
    }
}

module.exports = {
    Atomizer
};
