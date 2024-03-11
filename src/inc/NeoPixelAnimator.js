const {NeoPixel} = require('neopixel');

class NeoPixelAnimator {
    np = null;
    programs = null;

    // How often the main loop runs, default: every 10ms - each program step then can only be a multitude of this, i.e. 80ms, but not 75ms!
    mainStepTime = null;

    // Holder for interval
    intVal = null;

    currentRunningProgram = null;
    currentProg = null;
    debug = false;
    stepTimeCount = 0;
    currentStep = 0;
    currentUsedLightness = null;
    currentLightness = null;
    programQuotient = null;

    /**
     * Constructor
     *
     * @param {int} gpioPort The GPIO port number
     * @param {int} ledCount The number of LEDs in total
     * @param {int} mainStepTime The step time, 10 = 10ms, program steps must be multitude of this value
     * @param {bool} debug
     */
    constructor(gpioPort, ledCount = 24, mainStepTime = 10, debug = false) {
        this.np = new NeoPixel(gpioPort, ledCount);
        this.mainStepTime = mainStepTime;
        this.debug = debug;

        /**
         * 4. LED programs
         * Each step in a program has the same length (time in ms) and must be a multipler of the system step time (mainStepTime in ms)!
         * Otherwise, the program will end with an error on the console.
         */
        this.programs = require('./../data/glassesPrograms.json');


        // Read from flash: 1. The id of the currently running program as defined by $programs below
        this.currentProg = storage.getItem('lastProgram');
        if (this.currentProg === null) {
            this.currentProg = 0;
        } else {
            this.currentProg = parseInt(this.currentProg);
        }

        // Read from flash: 2. Current lightness setting (0-100, 0 = dark, 100 = very light)
        this.currentLightness = storage.getItem('lastLightness');
        if (this.currentLightness === null) {
            this.currentLightness = 5;
        } else {
            this.currentLightness = parseInt(this.currentLightness);
        }
    }

    /**
     * Switches to the next program
     */
    nextProgram() {
        if (this.debug) console.log('NEXT PROGRAM');
        // Identify and start next program
        let nextProgram = this.currentProg + 1;
        if (nextProgram + 1 > this.programs.length) {
            nextProgram = 0;
        }
        if (this.debug) console.log('Starting next program: #' + nextProgram);
        this.currentProg = nextProgram;
    }

    /**
     * Stops the timer
     */
    stop() {
        if (this.intVal) {
            clearInterval(this.intVal);
            this.intVal = null;
        }
    }

    /**
     * Starts the timer
     */
    start() {
        this.intVal = setInterval(() => {

            // Check if current program changed!
            if (this.currentRunningProgram !== this.currentProg) {
                if (this.debug) console.log('STARTING new program: #' + this.currentProg);
                // 1. Turn all off
                for (let i = 0; i < 24; i++) {
                    this.np.setPixel(i, this.getColor('black'));
                }
                // 2. Start with new program!
                this.stepTimeCount = 0;
                this.currentStep = 0;

                storage.setItem('lastProgram', '' + this.currentProg); // Store last program in flash storage
            }
            this.currentRunningProgram = this.currentProg;

            // Check if lightness changed
            if (this.currentUsedLightness !== this.currentLightness) {
                if (this.debug) console.log('Lightness changed #' + this.currentLightness);
                //storage.setItem('currentLightness', ''+currentLightness); -- Maybe better not store every change here to keep flash alive!
                this.currentUsedLightness = this.currentLightness;
            }

            const stepTime = this.programs[this.currentProg].time;
            if (stepTime !== this.mainStepTime) {
                if (this.debug) console.log(`LOOP: StepTime ${stepTime} != mainStepTime ${this.mainStepTime}`);
                const multiplicator = stepTime / this.mainStepTime;
                this.programQuotient = Math.floor(stepTime / this.mainStepTime);
                if (this.debug) console.log(`LOOP: Multiplicator: ${multiplicator}, Quotient=${this.programQuotient}`);
                const remainder = stepTime % this.mainStepTime;
                if (remainder !== 0) {
                    console.error("ERROR: Program #" + this.currentProg + " execution timer time (" + stepTime + " ms) is not a simple multipler of the main step time (" + this.mainStepTime + ")");
                    clearInterval(this.intVal);
                    return;
                }

                if (this.stepTimeCount < this.programQuotient) {
                    if (this.debug) console.log(`LOOP: Step ${this.stepTimeCount} of ${this.programQuotient}`);
                    this.stepTimeCount++;
                    return;
                } else {
                    this.stepTimeCount = 0;
                }

            } else {
                if (this.debug) console.log(`LOOP: Is the same time!`)
            }

            if (this.currentStep + 1 > this.programs[this.currentProg].steps.length) {
                this.currentStep = 0;
            }

            if (this.debug) console.log('Current step is: ' + this.currentStep);

            const step = this.programs[this.currentProg].steps[this.currentStep];
            const leftC = this.getColor(step[1]),
                rightC = this.getColor(step[3]);

            let rgbLeft = leftC;
            if (step[1] !== 'black') {
                const hslLeft = this.RGBToHSL(leftC[0], leftC[1], leftC[2]);
                rgbLeft = this.HSLToRGB(hslLeft[0], hslLeft[1], this.currentLightness);
            }

            let rgbRight = rightC;
            if (step[3] !== 'black') {
                const hslRight = this.RGBToHSL(rightC[0], rightC[1], rightC[2]);
                rgbRight = this.HSLToRGB(hslRight[0], hslRight[1], this.currentLightness);
            }

            let leftPixelNo = step[0],
                rightPixelNo = step[2];
            if (leftPixelNo === 'random') { // TODO: Maybe more options?
                leftPixelNo = this.getRandomPixel();
            }
            if (rightPixelNo === 'random') { // TODO: Maybe more options?
                rightPixelNo = this.getRandomPixel();
            }

            this.np.setPixel(leftPixelNo, this.np.color(rgbLeft[0], rgbLeft[1], rgbLeft[2]));
            this.np.setPixel(rightPixelNo, this.np.color(rgbRight[0], rgbRight[1], rgbRight[2]));
            this.np.show();

            this.currentStep++;

        }, this.mainStepTime);
    }

    /**
     * Converts RGB to HSL
     * @param {int} r
     * @param {int} g
     * @param {int} b
     *
     * @returns {(number|number)[]}
     * @see https://css-tricks.com/converting-color-spaces-in-javascript/
     */
    RGBToHSL(r, g, b) {
        // Make r, g, and b fractions of 1
        r /= 255;
        g /= 255;
        b /= 255;

        // Find greatest and smallest channel values
        let cmin = Math.min(r, g, b),
            cmax = Math.max(r, g, b),
            delta = cmax - cmin,
            h = 0,
            s = 0,
            l = 0;

        // Calculate hue
        // No difference
        if (delta == 0)
            h = 0;
        // Red is max
        else if (cmax == r)
            h = ((g - b) / delta) % 6;
        // Green is max
        else if (cmax == g)
            h = (b - r) / delta + 2;
        // Blue is max
        else
            h = (r - g) / delta + 4;

        h = Math.round(h * 60);

        // Make negative hues positive behind 360°
        if (h < 0)
            h += 360;

        // Calculate lightness
        l = (cmax + cmin) / 2;

        // Calculate saturation
        s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

        // Multiply l and s by 100
        s = +(s * 100).toFixed(1);
        l = +(l * 100).toFixed(1);

        return [h, s, l];
        //  return "hsl(" + h + "," + s + "%," + l + "%)";
    }

    /**
     * Converts HSL to RGB
     *
     * @param {int} h
     * @param {int} s
     * @param {int} l
     *
     * @returns {number[]}
     */
    HSLToRGB(h, s, l) {
        // Must be fractions of 1
        s /= 100;
        l /= 100;

        let c = (1 - Math.abs(2 * l - 1)) * s,
            x = c * (1 - Math.abs((h / 60) % 2 - 1)),
            m = l - c / 2,
            r = 0,
            g = 0,
            b = 0;

        if (0 <= h && h < 60) {
            r = c;
            g = x;
            b = 0;
        } else if (60 <= h && h < 120) {
            r = x;
            g = c;
            b = 0;
        } else if (120 <= h && h < 180) {
            r = 0;
            g = c;
            b = x;
        } else if (180 <= h && h < 240) {
            r = 0;
            g = x;
            b = c;
        } else if (240 <= h && h < 300) {
            r = x;
            g = 0;
            b = c;
        } else if (300 <= h && h < 360) {
            r = c;
            g = 0;
            b = x;
        }
        r = Math.round((r + m) * 255);
        g = Math.round((g + m) * 255);
        b = Math.round((b + m) * 255);

        return [r, g, b];
    }

    /**
     * Gets the same pixel number on the second strip
     *
     * @param {int} leftPixel
     *
     * @returns {int}
     */
    getSameRightPixel(leftPixel) {
        if (leftPixel > 3) {
            return leftPixel + 8;
        }
        return leftPixel + 20;
    }

    /**
     * Gets the mirrored pixel number on the second strip
     *
     * @param {int} leftPixel
     *
     * @returns {int}
     */
    getMirroredRightPixel(leftPixel) {
        switch (leftPixel) {
            case 0:
                return 12;
            case 1:
                return 23;
            case 2:
                return 22;
            case 3:
                return 21;
            case 4:
                return 20;
            case 5:
                return 19;
            case 6:
                return 18;
            case 7:
                return 17;
            case 8:
                return 16;
            case 9:
                return 15;
            case 10:
                return 14;
            case 11:
                return 13;
            default:
                console.error("Invalid leftPixel: " + leftPixel);
        }
    }

    /**
     * Updates the pixel color on both strips at the same time
     *
     * @param {int} leftPixel
     * @param {int} rightPixel
     * @param {int} color
     *
     * @returns {*[]}
     */
    updatePixelColors(leftPixel, rightPixel, color) {
        this.np.setPixel(leftPixel, color);
        this.np.setPixel(rightPixel, color);
        this.np.show();
        return [leftPixel, color, rightPixel, color];
    }

    /**
     * Sets the color to both strips simulataneously
     *
     * @param leftPixel
     * @param color
     */
    setColorBothSame(leftPixel, color) {
        const rightPixel = this.getSameRightPixel(leftPixel);
        this.updatePixelColors(leftPixel, rightPixel, color);
    }

    /**
     * Sets the color to both strips simulataneously mirrored
     *
     * @param leftPixel
     * @param color
     */
    setColorBothMirrored(leftPixel, color) {
        const rightPixel = this.getMirroredRightPixel(leftPixel);
        return this.updatePixelColors(leftPixel, rightPixel, color);
    }

    /**
     * Returns a random value between 0 and the given max
     *
     * @param {int} max
     *
     * @returns {number}
     */
    getRandomVal(max = 255) {
        return Math.floor(Math.random() * (max + 1));
    }

    /**
     * Returns color value by name
     */
    getColor(color) {
        /*
        const m = color.match(/^hue:([0-9]+)$/);
        let hue = null;
        if (m) {
            color = 'hue';
            hue = m[1];
        }*/
        switch (color) {
            /*
            case 'hue':
                const rgb2 = HSLToRGB(hue, 100, currentLightness);
                return [rgb2[0], rgb2[1], rgb2[2]];
                break;
             */
            case 'red':
                return [20, 0, 0];
            case 'blue':
                return [0, 0, 20];
            case 'violet':
                return [20, 0, 20];
            case 'green':
                return [0, 20, 0];
            case 'yellow':
                return [20, 20, 0];
            case 'white':
                return [20, 20, 20];
            case 'black':
                return [0, 0, 0];
            case 'random':
                return [this.getRandomVal(), this.getRandomVal(), this.getRandomVal()];
            case 'candle':
                const rgb3 = this.HSLToRGB(this.getRandomVal(60), 100, this.getRandomVal(100));
                return [rgb3[0], rgb3[1], rgb3[2]];
        }
    }

    /**
     * Returns a random pixel number
     *
     * @returns {number}
     */
    getRandomPixel() {
        return this.getRandomVal(23);
    }
}

module.exports = {
    NeoPixelAnimator
};
