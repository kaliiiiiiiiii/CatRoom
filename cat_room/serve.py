import asyncio
import json
import os
import traceback
import typing
import time

from aiohttp import web
import aiohttp


class Server:
    def __init__(self, port: int = 80, host=None):
        self._static_dir = os.getcwd() + "/static"
        self.port = port
        self._host = host

        self.app = web.Application()
        self.app.add_routes([web.get("/", self.root), web.get('/ws', self.ws_handler)])
        self.app.add_routes([web.static('/', self._static_dir)])

        self.users: typing.Dict[str, web.WebSocketResponse] = {}

    def serve(self):
        web.run_app(self.app, port=self.port, host=self._host)

    async def root(self, request: web.Request):
        raise web.HTTPFound("/index.html")

    async def on_msg(self, user: str, _time: float, message: str):
        async def try_send(_ws: web.WebSocketResponse, _data: dict):
            try:
                await _ws.send_json(_data)
            except ConnectionResetError:
                pass

        coro = []
        for ws in self.users.values():
            coro.append(try_send(ws, {"cmd":"msg","user": user, "time": _time, "msg": message}))
        await asyncio.gather(*coro)

    async def ws_handler(self, request: web.Request):
        ws = web.WebSocketResponse()
        await ws.prepare(request)
        user = None

        try:
            async for msg in ws:
                msg: aiohttp.WSMsg
                if msg.type == aiohttp.WSMsgType.TEXT:
                    if msg.data == 'close':
                        await ws.close()
                    else:
                        data = json.loads(msg.data)
                        if data["cmd"] == "register":
                            user = data.get("user")
                            if user and user in self.users.keys():
                                await ws.send_json({"cmd": "err", "msg": "user_duplicate"})

                            else:
                                self.users[user] = ws

                                # test message
                                asyncio.ensure_future(self.on_msg("testCat", time.time(), "Hello?"))
                                print(user)
                        elif data["cmd"] == "msg":
                            user = data["user"]
                            _time = data["time"]
                            msg = data["msg"]
                            asyncio.ensure_future(self.on_msg(user, _time, msg))
                        else:
                            raise ValueError(f"unexpected data from ws: {data}")

        except Exception as e:
            try:
                del self.users[user]
            except KeyError:
                pass
            raise e
        try:
            del self.users[user]
        except KeyError:
            pass
        return ws


if __name__ == "__main__":
    server = Server()
    server.serve()
