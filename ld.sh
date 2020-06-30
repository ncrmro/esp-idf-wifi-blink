#rm -rf .pio/build/*
PORT=/dev/cu.SLAB_USBtoUART
BAUD=115200

esptool.py -p $PORT --baud $BAUD erase_flash

pio run --target upload --upload-port $PORT || exit 1

python -m serial.tools.miniterm $PORT $BAUD