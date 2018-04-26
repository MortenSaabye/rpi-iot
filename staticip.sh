#!/bin/sh

sudo cp "/home/pi/iot/dhcpstatic.conf" "/etc/dhcpcd.conf"
sudo service dhcpcd restart
