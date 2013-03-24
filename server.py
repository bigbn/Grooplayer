from twisted.internet import reactor, protocol
import RPi.GPIO as GPIO
from time import sleep


class Echo(protocol.Protocol):
    """This is just about the simplest possible protocol"""

    def dataReceived(self, data):
        """As soon as any data is received, write it back."""
        self.translate(data)
        self.transport.write(data)

    def translate(self, data):
        forward = 0
        items = data.split("&")
        for item in items:
            if item.split("=")[0] == "F":
                forward = bool(int(item.split("=")[1]))

        print(forward)
        if forward:
            print "forvard is pressed"
            GPIO.setup(7, GPIO.OUT)
            GPIO.output(7, True)
            sleep(5)
            GPIO.cleanup()
        else:
            print "forvard is unpressed"


def main():
    """This runs the protocol on port 8000"""
    GPIO.setmode(GPIO.BOARD)
    factory = protocol.ServerFactory()
    factory.protocol = Echo
    reactor.listenTCP(7321, factory)
    reactor.run()

# this only runs if the module was *not* imported
if __name__ == '__main__':
    main()
