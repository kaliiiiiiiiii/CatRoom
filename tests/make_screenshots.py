"""
generates screenshots for README.md
"""

import os
import sys
import inspect

# add / to python path (for imports)
current_dir = os.path.dirname(os.path.abspath(inspect.getfile(inspect.currentframe())))
parent_dir = os.path.dirname(current_dir)
sys.path.insert(0, parent_dir)

import asyncio
import multiprocessing
import time
import typing
import os
import pathlib

from cat_room.serve import Server
from selenium_driverless import webdriver
from selenium_driverless.types.by import By
from selenium_driverless.types.target import Target

assets = str(pathlib.Path(os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + "/assets"))

server = Server(port=8080, host="localhost")


async def enter(tab: Target):
    # press enter on a TAB
    await asyncio.sleep(0.05)
    # press enter
    key_event = {
        "type": "keyDown",
        "code": "Enter",
        "windowsVirtualKeyCode": 13,
        "key": "Enter",
        "modifiers": 0
    }
    await tab.execute_cdp_cmd("Input.dispatchKeyEvent", key_event)
    await asyncio.sleep(0.05)
    key_event["type"] = "keyUp"
    await tab.execute_cdp_cmd("Input.dispatchKeyEvent", key_event)


async def emulate_mobile(tab: Target):
    # emulates a mobile view on a tab
    await tab.execute_cdp_cmd("Emulation.setDeviceMetricsOverride",
                              {"mobile": True, "width": 384, "height": 700,
                               "deviceScaleFactor": 4,
                               "screenOrientation": {"type": "portraitPrimary", "angle": 0}})


async def reset_emulation(tab: Target):
    # reset mobile view emulation for a tab
    await tab.execute_cdp_cmd("Emulation.clearDeviceMetricsOverride")


async def main():
    url = "http://localhost:8080"
    usernames = ["Cat1😼", "Cat2😾"]
    messages = (["Hello there", "How are you?"], ["I'm good, thanks 😀", "hbu?"])

    options = webdriver.ChromeOptions()
    options.headless = True  # => don't create a window
    async with webdriver.Chrome(options=options) as driver:
        # start chrome
        tabs: typing.List[Target] = [await driver.new_window("tab"), driver.current_target]

        idx = 0
        for username, tab in zip(usernames, tabs):
            tab: Target
            await tab.get(url, wait_load=False)
            username_inp = await tab.find_element(By.ID, "username-input", timeout=5)
            await asyncio.sleep(0.5)

            await username_inp.write(username)

            if idx == 0:
                await tab.save_screenshot(assets + "/register_screenshot.png")
                await emulate_mobile(tab)
                await asyncio.sleep(2)
                await tab.save_screenshot(assets + "/register_screenshot_mobile.png")
                await reset_emulation(tab)

            await enter(tab)

            await asyncio.sleep(1)
            if idx == 0:
                inp = await tab.find_element(By.ID, "inp", timeout=2)
                await inp.write("Hello?")
                await enter(tab)
            idx += 1
        for messages, tab in zip(messages, tabs):
            tab: Target

            inp = await tab.find_element(By.ID, "inp", timeout=2)
            for message in messages:
                await inp.write(message)
                await enter(tab)
                await asyncio.sleep(1)

        inp = await tabs[0].find_element(By.ID, "inp", timeout=2)
        await inp.write("My gf left me 😢")

        await tabs[0].save_screenshot(assets + "/example_screenshot.png")
        await emulate_mobile(tabs[0])
        await asyncio.sleep(1)
        await tabs[0].save_screenshot(assets + "/example_screenshot_mobile.png")

        switch = await tabs[0].find_element(By.XPATH, '//*[@id="userListButton"]')
        await switch.click()
        await asyncio.sleep(1)
        await tabs[0].save_screenshot(assets + "/example_screenshot_mobile_user_list.png")


if __name__ == "__main__":
    # startup server in a new process
    proc = multiprocessing.Process(target=server.serve)
    proc.start()
    time.sleep(3)

    try:
        asyncio.run(main())
    finally:
        proc.kill()
