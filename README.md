# CatRoom

Note: This is a school-project

#### Dependencies

- [Python >= 3.7](https://www.python.org/downloads/)

#### Startup server
download with
```shell
git clone kaliiiiiiiiii/CatRoom
cd CatRoom
```

start server from cmd
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

then, open http://localhost to view the chatroom



### Example screenshots

#### Desktop
<img src="assets/register_screenshot.png" width="100%"/>
<img src="assets/example_screenshot.png" width="100%"/>

#### Mobile
<p float="left">
    <img src="assets/register_screenshot_mobile.png" width="49%"/>
    <img src="assets/example_screenshot_mobile.png" width="49%"/>
</p>