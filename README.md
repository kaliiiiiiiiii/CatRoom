# CatRoom

Note: This is a school-project

#### Dependencies

- [Python ~= 3.10](https://www.python.org/downloads/release/python-31011/)

#### Startup server
download with
```shell
git clone kaliiiiiiiiii/CatRoom
cd CatRoom
```

start server from cmd \
(serves on all interfaces => `LAN`//`WLAN`)
```shell
python main.py
```

or from python:
```python
from cat_room.serve import Server

if __name__ == "__main__":
    server = Server(port=80, host="localhost")
    server.serve()
```
this serves **on `localhost` only**. To expose the port to `LAN`//`WLAN`, use `host="0.0.0.0"` instead

then, open [localhost](http://localhost) to view the chatroom



### Example screenshots

#### Desktop
<img src="assets/register_screenshot.png" width="100%"/>
<img src="assets/example_screenshot.png" width="100%"/>

#### Mobile
<p float="left">
    <img src="assets/register_screenshot_mobile.png" width="49%"/>
    <img src="assets/example_screenshot_mobile.png" width="49%"/>
</p>
<img src="assets/example_screenshot_mobile_user_list.png" width="49%"/>