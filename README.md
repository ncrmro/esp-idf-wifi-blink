
1. Board is powered on.
1. In Station mode, try to connect to access point with credentials in flash.
1. If not start Access Point.
1. User connects to access point.
1. Captive portal is opened
1. Wifi is selected and credentials are added
1. User should be redirected to browser from Cap Portal
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