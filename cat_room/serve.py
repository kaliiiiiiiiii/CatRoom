# The backend server implementation

import asyncio
import json
import re
import typing
import time

import pathlib
from aiohttp import web
import aiohttp


async def try_send(_ws: web.WebSocketResponse, _data: dict) -> None:
    # try to send a message to a websocket, suppresses ConnectionResetError
    try:
        await _ws.send_json(_data)
    except ConnectionResetError:
        pass


class Server:
    """
    the Server Class
    """

    def __init__(self, port: int = 80, host=None) -> None:
        self._static_dir = str(pathlib.Path(__file__).parent.resolve()) + "/static"
        self.port = port
        self._host = host

        # userName cannot include invisible characters
        # and has to be between 5 and 30 letters long
        self._match_user = re.compile(r"/^(?![\r\n\t\f\v ])(?!.*\s)(.{5,30})$")

        self.app = web.Application()
        self.app.add_routes(
            [web.get("/", self.root),
             web.get('/ws', self.ws_handler),
             web.get('/get_users', self.get_users)]
        )
        self.app.add_routes([web.static('/', self._static_dir)])

        # dict in format {username:WebSocketResponse}
        # represents each websocket connection to a client
        self.users: typing.Dict[str, web.WebSocketResponse] = {}

    def serve(self) -> None:
        """starts the server (blocks forever)"""
        web.run_app(self.app, port=self.port, host=self._host)

    async def root(self, request: web.Request) -> web.Response:
        """redirects `/` to ..."""
        raise web.HTTPFound("/index.html")

    async def on_msg(self, user: str, _time: float, message: str, _id: str) -> None:
        """on message received handler"""

        # return if there aren't any visible characters in the message
        visible = False
        for char in message:
            if not (char in ["\n", " ", "\t", '\xa0']):
                visible = True
                break
        if not visible:
            return

        # broadcast message to all users
        coro = []
        for ws in self.users.values():
            coro.append(try_send(ws, {"cmd": "msg", "user": user, "time": _time, "msg": message, "id": _id}))
        await asyncio.gather(*coro)

    async def get_users(self, request: web.Request) -> web.Response:
        """/get_users REST endpoint"""
        users = list(self.users.keys())
        return web.Response(body=json.dumps(users), content_type="application/json")

    async def on_joined(self, user:str) -> None:
        """
        Gets called when a user joined
        """
        _time = time.time()

        # broadcast that a user joined to all users
        coro = []
        for ws in self.users.values():
            coro.append(try_send(ws, {"cmd": "join", "user": user, "time": _time, "status": 1}))
        await asyncio.gather(*coro)

    async def on_leave(self, user:str) -> None:
        """
        gets called when a user leaves (=> disconnects)
        """
        if user:
            print(f"{user} left")
        _time = time.time()

        # broadcast that a user left to all users
        coro = []
        for ws in self.users.values():
            coro.append(try_send(ws, {"cmd": "leave", "user": user, "time": _time}))
        await asyncio.gather(*coro)

    async def ws_handler(self, request: web.Request) -> web.WebSocketResponse:
        """handles incoming websocket request on path /ws"""
        ws = web.WebSocketResponse()
        await ws.prepare(request)
        user = None

        try:
            async for msg in ws:
                # for each message received
                msg: aiohttp.WSMsg
                if msg.type == aiohttp.WSMsgType.TEXT:
                    # not text received
                    if msg.data == 'close':
                        await ws.close()
                    else:
                        data = json.loads(msg.data)

                        if data["cmd"] == "register":
                            # a user wants to register
                            user = data.get("user")
                            if not self._match_user.match(user):
                                # r"/^(?![\r\n\t\f\v ])(?!.*\s)(.{5,30})$"
                                # userName cannot include invisible characters
                                # and has to be between 5 and 30 letters long
                                pass

                            if user and user in self.users.keys():
                                # report status:0 to indicate duplicate
                                await try_send(ws, {"cmd": "join", "user": user, "time": time.time(), "status": 0})
                            else:
                                # user registered successfully
                                self.users[user] = ws
                                asyncio.ensure_future(self.on_joined(user))
                                # register
                                print(f"{user} joined")
                        elif data["cmd"] == "msg":
                            # message from user received
                            _time = data["time"]
                            msg = data["msg"]
                            _id = data["id"]

                            print(f"{user}:{msg}")
                            asyncio.ensure_future(self.on_msg(user, _time, msg, _id))
                        else:
                            # => closes the websocket connection
                            raise ValueError(f"unexpected data from ws: {data}")

        finally:
            # untrack the user (cleanup memory)
            asyncio.ensure_future(self.on_leave(user))
            try:
                del self.users[user]
            except KeyError:
                pass

        return ws


if __name__ == "__main__":
    # serves on LOCALHOST only
    server = Server()
    server.serve()
