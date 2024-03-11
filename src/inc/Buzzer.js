const {BuzzerMusic} = require('buzzer-music');

class Buzzer {
    pin = null;

    bm = null;

    constructor(pin) {
        this.pin = pin;
    }

    play(rhythm, tempo, score) {
        this.bm = new BuzzerMusic(this.pin, rhythm, tempo);
        this.bm.play(score);
    }

    stop() {
        if (this.bm) this.bm.stop();
    }

    beep(count) {
        let notes = [];
        for (let i = 0; i < count; i++) {
            notes.push('5c');
        }
        this.bm = new BuzzerMusic(this.pin, 8, 180);
        this.bm.play(notes.join('.'));
    }

    beepAlt(count) {
        let notes = [];
        for (let i = 0; i < count; i++) {
            notes.push('7e');
        }
        this.bm = new BuzzerMusic(this.pin, 6, 120);
        this.bm.play(notes.join('.'));
    }
}

module.exports = {
    Buzzer
};
