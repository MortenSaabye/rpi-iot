from wireless import Wireless
from shell import shell
wireless = Wireless()
if wireless.current() :
    print('start services!')
else :
    shell('sudo systemctl start hostapd')
    cmd = shell('forever start /home/pi/iot/setupServer/app.js')
    shell('/home/pi/iot/staticip.sh')
    shell('sudo systemctl start dnsmasq')
