A pretty simple example app to learn about configuring a microcontroller to a Wifi Network
utilizing [Captive Portals](https://en.wikipedia.org/wiki/Captive_portal). It's
also built using espressif's [esp-idf](https://github.com/espressif/esp-idf) rather
than Arduino. [Platformio](https://platformio.org/) is utilized primarily as a build system. 


1. Board is powered on.
1. try start in WIFI_MODE_STA with existing credentials
1. If not start Access Point.
1. User connects to access point.
1. Captive portal is opened
1. Wifi is selected and credentials are added
    1. Wifi now in WIFI_MODE_APSTA with LAN IP
    1. User should be redirected to browser from Cap Portal
    1. One we get to web app we say `a little more config needed`
    1. Switch to WIFI_MODE_STA and change some variable the client posts to
    1. Hardware should be fully initialized at this point for end use.
1. Browser should show button to trigger onboard LED (this could also be shown in access point mode)
1. User should be able to reset device

# TODO
* [x] ESP32 Wifi Manager with Captive Portal
* [ ] Shutdown Access Point after creds are found
* [ ] Portal Redirect
* [ ] Button trigger
* [ ] Reset
 
## Development Tools
* [platformio cli](https://docs.platformio.org/en/latest/core/installation.html#python-package-manager) 
* python packages
  * [esptool](https://github.com/espressif/esptool)
  * [pyserial](https://github.com/pyserial/pyserial)

esptool.py -p /dev/cu.SLAB_USBtoUART erase_flash

## Thanks
Original Wifi Manager source [here](https://github.com/tonyp7/esp32-wifi-manager)