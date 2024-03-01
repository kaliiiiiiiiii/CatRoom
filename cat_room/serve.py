import os

from aiohttp import web
_dir = os.getcwd()+"/static"


async def root(request: web.Request):
    return web.FileResponse(f"{_dir}/index.html")


def serve():
    app = web.Application()
    app.add_routes([web.get('/', root)])
    web.run_app(app, port=80)


if __name__ == "__main__":
    serve()
