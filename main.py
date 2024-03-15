from cat_room.serve import Server

if __name__ == "__main__":
    server = Server(port=80, host="localhost")
    server.serve()
