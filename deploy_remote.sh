REMOTE_HOST=ncrmro@art.local
PROJECT_NAME=${PWD##*/}
REMOTE_DIR=/home/ncrmro/code/temp/


echo Syncing to remote host..
ssh $REMOTE_HOST mkdir -p $REMOTE_DIR || exit 1
rsync -a -v --stats --progress --exclude '.pio/build' --exclude 'venv' --exclude 'cmake-build-*' $PWD $REMOTE_HOST:$REMOTE_DIR || exit 1

ssh -t -t $REMOTE_HOST "cd $REMOTE_DIR/$PROJECT_NAME && sh deploy.sh"