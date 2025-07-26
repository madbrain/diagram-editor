import asyncio
import json
from websockets import ConnectionClosedOK, ServerConnection
from websockets.asyncio.server import serve

class UserInformation:
    user: str
    position = None
    def __init__(self, user, websocket):
        self.user = user
        self.websocket = websocket

connections: dict[ServerConnection, UserInformation] = {}

async def sendMessage(webSocket: ServerConnection, message):
    await webSocket.send(json.dumps(message))

async def broadcastPresence(fromWebSocket: ServerConnection):
    message = { "type": "presence-update", "users": list(map(lambda u: { "user": u.user, "position": u.position }, connections.values())) }
    print("SEND PRESENCE", message)
    for (websocket, connection) in connections.items():
        await sendMessage(websocket, message)

async def handleConnection(websocket: ServerConnection):
    while True:
        try:
            message = await websocket.recv()
            data = json.loads(message)
            if data["type"] == 'presence-connect':
                if websocket not in connections.keys():
                    user = data["user"]
                    print("CONNECT", user)
                    connections[websocket] = UserInformation(user, websocket)
                await broadcastPresence(websocket)
            elif data["type"] == 'presence-move':
                connection = connections[websocket]
                user = data["user"]
                if connection is None or user != connection.user:
                    print("BAD user", user, connection.user)
                else:
                    print("MOVE", data, connections)
                    if connection is None:
                        print("Cannot find connection")
                    else:
                        connection.position = data["position"]
                        await broadcastPresence(websocket)
            else:
                print(data)
        except ConnectionClosedOK:
            break
    print("STOP", websocket)
    del connections[websocket]
    await broadcastPresence(connection.websocket)
            

async def main():
    async with serve(handleConnection, "localhost", 3000):
        await asyncio.Future()

if __name__ == "__main__":
    asyncio.run(main())