#!/bin/bash
# Replace these three settings.
PROJDIR="/home/groo"
RUNDIR="/pro"
PIDFILE="$RUNDIR/groo.pid"
SOCKET="$RUNDIR/groo.sock"


cd $PROJDIR
if [ -f $PIDFILE ]; then
    kill `cat -- $PIDFILE`
    rm -f -- $PIDFILE
fi
python2 manage.py runfcgi socket=$SOCKET pidfile=$PIDFILE

sleep 2
#chown groo:http $SOCKET
chmod 777 $SOCKET
