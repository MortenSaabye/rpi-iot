import logging
import socket
import sys
import netifaces 
from time import sleep
from zeroconf import ServiceInfo, Zeroconf


if __name__ == '__main__':
    logging.basicConfig(level=logging.DEBUG)
    if len(sys.argv) > 1:
        assert sys.argv[1:] == ['--debug']
        logging.getLogger('zeroconf').setLevel(logging.DEBUG)

    desc = {'version': '1.0'}
    ip = netifaces.ifaddresses('wlan0')[netifaces.AF_INET][0]['addr']
    info = ServiceInfo("_coap._udp.local.",
                       "Super Special IoT service._coap._udp.local.",
                       socket.inet_aton(ip), 5683, 0, 0,
                       desc)

    zeroconf = Zeroconf()
    print("Registration of a service, press Ctrl-C to exit...")
    zeroconf.register_service(info)
    try:
        while True:
            sleep(0.1)
    except KeyboardInterrupt:
        pass
    finally:
        print("Unregistering...")
        zeroconf.unregister_service(info)
zeroconf.close()