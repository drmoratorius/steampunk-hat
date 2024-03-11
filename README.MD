# Dr. Moratorius' Steampunk Hat

![Steampunk Hat](./photos/hat.jpg "Steampunk Hat")

An interactive Steampunk hat with these features:
- Goggles with animated LEDs with different colors, changeable by button push
- Atomizer that simulates steam coming out of the hat, can be turned on/off by button
- A large cogwheel that turns every few seconds
- Passive buzzer that beeps when pushing one of the two buttons indicating goggles color mode and steam on/off 

This repository currently only contains all information on how to build the electronics.
This is not a tutorial on how to build it and is provided for reference only currently,
so you can at least benefit somewhat :)

## Parts
* [Raspberry Pi Pico](https://www.raspberrypi.com/products/raspberry-pi-pico/)
* [CD4066 (CMOS)](https://www.ti.com/lit/ds/symlink/cd4066b.pdf)
* [ULN2803A](https://www.st.com/resource/en/datasheet/uln2804a.pdf)
* [Passive Buzzer](https://www.amazon.de/EasyWordMall-10PCS-Passive-Buzzer-Widerstand/dp/B0179I6LIK/)
* [Hat](https://www.amazon.de/gp/product/B06XSGQHVM/)
* [Goggles](https://de.aliexpress.com/item/1005006185599783.html)
* [Candle LED](https://de.aliexpress.com/item/1005005445352883.html)
* [Atomizer](https://de.aliexpress.com/item/1005006471010039.html)
* [Atomizer Holder](https://de.aliexpress.com/item/1005005056005707.html)
* [N20 Motor - 60rpm](https://de.aliexpress.com/item/1005006213284700.html)
* [USB Adapter](https://de.aliexpress.com/item/1005005632352287.html)
* [PCB 70x90mm](https://de.aliexpress.com/item/1005006365975004.html)
* 3D-printed parts can be found in the [3D subdirectory](./3d)

## Programming
The programming is done using JavaScript with [KalumaJS](https://kalumajs.org/) 
utilizing the packages [buzzer-music](https://github.com/niklauslee/buzzer-music) and 
[neopixel](https://github.com/niklauslee/neopixel).

### Flashing with KalumaJS
If you are not yet familiar with KalumaJS please see the [tutorial](https://kalumajs.org/docs/getting-started).
After setting up the firmware on the Raspberry Pi Pico open a new command prompt e.g. on Windows *with
administrative privileges*, enter the `src` directory and type this to bundle and flash the source code
onto the device:

`kaluma flash ./index.js --bundle --shell`

You can exit the shell by pressing `Ctrl+Z`.


## 3D Print
The `3D` directory contains all parts used. Please note this:
* Atomizer Board Holder: The two cylinders might have to be removed after printing if they don't fit
* Button & Holder: the circle is not perfectly centered on both parts which should be fixed - this might require scraping some part out after printing. I have to fix this sometime later.


### 3D Print Credits
* [Atomizer Reservoir - Bottle & Cap](https://www.thingiverse.com/thing:612709)
* [Steampunk Hat Chimney Top (Crown only)](https://www.thingiverse.com/thing:4573890)
* [Steampunk Hat Chimney:](https://www.thingiverse.com/thing:3464045)
* [Button & Holder](https://www.thingiverse.com/thing:5078577)
* [Motor Holder](https://www.thingiverse.com/thing:2660688)
* [Large Cogwheel](https://www.thingiverse.com/thing:2730714)

