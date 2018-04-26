#!/bin/sh

sudo cp "/home/pi/iot/dhcpdynamic.conf" "/etc/dhcpcd.conf"
sudo service dhcpcd restart
