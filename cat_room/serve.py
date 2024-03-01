import os

from aiohttp import web

_static = os.getcwd() + "/static"
routes = web.RouteTableDef()


@routes.get("/")
async def root(request: web.Request):
    raise web.HTTPFound("/index.html")


def serve():
    app = web.Application()
    app.add_routes(routes)
    app.add_routes([web.static('/', _static)])
    web.run_app(app, port=80)


if __name__ == "__main__":
    serve()
