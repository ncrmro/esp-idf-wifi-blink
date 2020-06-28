rm -rf .pio/build/*

pio run --target upload --upload-port /dev/cu.SLAB_USBtoUART

python -m serial.tools.miniterm  /dev/cu.SLAB_USBtoUART 115200