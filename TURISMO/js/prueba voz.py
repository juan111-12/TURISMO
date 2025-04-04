import asyncio
import websockets
import sounddevice as sd
import numpy as np

async def interactuar_con_gpt4o():
    uri = "wss://api.openai.com/v1/realtime/gpt-4o-search-preview"

    async with websockets.connect(uri, extra_headers={"Authorization": f"Bearer {openai.api_key}"}) as websocket:
        print("Conectado al modelo GPT-4o Search Preview.")

        while True:
            # Capturar audio del micrófono
            print("Habla ahora...")
            duracion = 5  # segundos
            frecuencia = 44100  # Hz
            audio = sd.rec(int(duracion * frecuencia), samplerate=frecuencia, channels=1, dtype=np.int16)
            sd.wait()

            # Enviar audio al modelo
            await websocket.send(audio.tobytes())

            # Recibir respuesta en audio
            respuesta_audio = await websocket.recv()

            # Reproducir la respuesta
            sd.play(np.frombuffer(respuesta_audio, dtype=np.int16), samplerate=frecuencia)
            sd.wait()

asyncio.run(interactuar_con_gpt4o())
