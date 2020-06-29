#!/usr/bin/env bash
pio=/home/ncrmro/.platformio/penv/bin/pio
esptool=/home/ncrmro/.local/bin/esptool.py
PORT="/dev/ttyUSB0"
BAUD=115200

echo "Clearing flash"

$esptool -p $PORT --baud $BAUD erase_flash

echo "Compile upload"

$pio run --target upload --upload-port $PORT || exit 1

echo "Listening on Port"

miniterm  $PORT $BAUD
