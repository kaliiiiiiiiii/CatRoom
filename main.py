"""
Server bound on all interfaces (=> exposed to LAN//WLAN)
"""

from cat_room.serve import Server


def get_ip() -> str:
    """
    gets the current LAN IP
    """
    import socket
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    s.connect(("8.8.8.8", 80))
    return s.getsockname()[0]


if __name__ == "__main__":
    print(get_ip())
    server = Server(port=80, host="0.0.0.0")
    server.serve()
