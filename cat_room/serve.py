# The backend server implementation

import asyncio
import json
import re
import typing
import time

import pathlib
from aiohttp import web
import aiohttp

invisible_chars = list([char for char in
                        u"\u000A\u000B\u000C\u000D\u0009\u0020\u0085\u00A0\u00AD\u034F"
                        u"\u061C\u115F\u1160\u17B4\u17B5\u180E\u2000\u2001\u2002\u2003"
                        u"\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u200B\u200C\u200D"
                        u"\u200E\u200F\u2028\u2029\u202F\u205F\u2060\u2061\u2062\u2063"
                        u"\u2064\u206A\u206B\u206C\u206D\u206E\u206F\u3000\u2800\u3164"
                        u"\uFEFF\uFFA0"])


def is_visible(string: str) -> bool:
    # test if string contains visible characters
    for char in string:
        if not (char in invisible_chars):
            return True
    return False


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
        if not is_visible(message):
            return

        # broadcast message to all users
        coro = []
        for ws in self.users.values():
            coro.append(try_send(ws, {"cmd": "msg", "user": user, "time": _time, "msg": message, "id": _id}))
        await asyncio.gather(*coro)

    # noinspection PyUnusedLocal
    async def get_users(self, request: web.Request) -> web.Response:
        """/get_users REST endpoint"""
        users = list(self.users.keys())
        return web.Response(body=json.dumps(users), content_type="application/json")

    async def on_joined(self, user: str) -> None:
        """
        Gets called when a user joined
        """
        _time = time.time()

        # broadcast that a user joined to all users
        coro = []
        for ws in self.users.values():
            coro.append(try_send(ws, {"cmd": "join", "user": user, "time": _time, "status": 1}))
        await asyncio.gather(*coro)

    async def on_leave(self, user: str) -> None:
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
                            if len(user) < 5 or len(user) > 20 or (not is_visible(user)):
                                # userName cannot include invisible characters
                                # and has to be between 5 and 30 letters long
                                pass  # ignore

                            elif user and user in self.users.keys():
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
