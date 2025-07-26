import asyncio
import websockets
import json
import random

async def sendMessage(websocket, message):
    await websocket.send(json.dumps(message))

async def fakeMove(websocket, userId):
    x = 100
    y = 100
    while True:
        await sendMessage(websocket, { "type": "presence-move", "user": userId, "position": { "x": x, "y": y } })
        await asyncio.sleep(3)
        x = max(0, min(500, x + 10 * random.randint(-10, 10)))
        y = max(0, min(500, y + 10 * random.randint(-10, 10)))

async def fakeClient(uri):
    userId = "ABCDEFGHIJK"
    async with websockets.connect(uri) as websocket:
        await sendMessage(websocket, { "type": "presence-connect", "user": userId })
        asyncio.create_task(fakeMove(websocket, userId))
        while True:
            greeting = await websocket.recv()
            print(f"Received: {greeting}")

asyncio.run(fakeClient('ws://localhost:3000'))