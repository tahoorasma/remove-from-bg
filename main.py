from fastapi import FastAPI, File, UploadFile, Query
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
import cv2
from PIL import Image
import io

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/remove-item/")
async def remove_item(
    file: UploadFile = File(...),
    x: int = Query(...),
    y: int = Query(...),
    width: int = Query(...),
    height: int = Query(...),
):
    try:
        image_bytes = await file.read()
        pil_image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        image = np.array(pil_image)
        image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)

        img_height, img_width = image.shape[:2]
        if x < 0 or y < 0 or x + width > img_width or y + height > img_height:
            return StreamingResponse(
                io.BytesIO(b"Invalid selection area."),
                status_code=400,
                media_type="text/plain"
            )

        mask = np.zeros((img_height, img_width), dtype=np.uint8)
        cv2.rectangle(mask, (x, y), (x + width, y + height), 255, -1)

        #mask = cv2.GaussianBlur(mask, (21, 21), 0)

        inpaint_radius = 3
        inpaint_method = cv2.INPAINT_TELEA

        inpainted_image = cv2.inpaint(image, mask, inpaint_radius, inpaint_method)

        blended_image = image.copy()
        blended_image[y:y + height, x:x + width] = inpainted_image[y:y + height, x:x + width]

        blended_image_rgb = cv2.cvtColor(blended_image, cv2.COLOR_BGR2RGB)

        pil_result = Image.fromarray(blended_image_rgb)
        buffer = io.BytesIO()
        pil_result.save(buffer, format="PNG")
        buffer.seek(0)

        return StreamingResponse(buffer, media_type="image/png")

    except Exception as e:
        print(f"Error processing image: {e}")
        return StreamingResponse(
            io.BytesIO(b"Internal Server Error"),
            status_code=500,
            media_type="text/plain"
        )




'''
from fastapi import FastAPI, File, UploadFile, Query
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
import cv2
from PIL import Image
import io

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/remove-item/")
async def remove_item(
    file: UploadFile = File(...),
    x: int = Query(...),
    y: int = Query(...),
    width: int = Query(...),
    height: int = Query(...)
):
    image = await file.read()
    image = np.array(Image.open(io.BytesIO(image)))

    mask = np.zeros(image.shape[:2], dtype=np.uint8)
    cv2.rectangle(mask, (x, y), (x + width, y + height), 255, -1)

    mask_inv = cv2.bitwise_not(mask)

    background = cv2.bitwise_and(image, image, mask=mask_inv)

    result = np.zeros_like(image)

    result = cv2.add(background, result)

    _, buffer = cv2.imencode('.png', result)
    io_buf = io.BytesIO(buffer)

    return StreamingResponse(io_buf, media_type="image/png")
'''