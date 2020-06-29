REMOTE_HOST=ncrmro@art.local
PROJECT_NAME=${PWD##*/}
REMOTE_DIR=/home/ncrmro/code/temp/

ssh -t -t $REMOTE_HOST "cd $REMOTE_DIR/$PROJECT_NAME && miniterm /dev/ttyUSB0 115200"