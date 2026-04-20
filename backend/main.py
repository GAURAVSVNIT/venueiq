from fastapi import FastAPI, UploadFile, File, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import torch
from ultralytics import YOLO
from transformers import pipeline
import numpy as np
from PIL import Image
import io
import time
import asyncio
import firebase_admin
from firebase_admin import credentials, firestore
import json
from typing import List

app = FastAPI(title="VenueIQ AI Backend")

# Initialize Firebase Admin (Default credentials work on Cloud Run)
try:
    firebase_admin.initialize_app()
    db = firestore.client()
    print("Firebase Admin initialized successfully.")
except Exception as e:
    print(f"Firebase Admin initialization failed: {e}")
    db = None

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global state
MODELS = {}
active_connections: List[WebSocket] = []

@app.on_event("startup")
async def startup_event():
    print("Loading models...")
    try:
        MODELS["yolo"] = YOLO("yolov8n.pt")
        MODELS["detr"] = pipeline("object-detection", model="facebook/detr-resnet-50")
        MODELS["yolos_tiny"] = pipeline("object-detection", model="hustvl/yolos-tiny")
        print("All models loaded successfully.")
    except Exception as e:
        print(f"Error loading models: {e}")
    
    # Start the alert simulator
    asyncio.create_task(simulate_incidents())

async def simulate_incidents():
    """Simulates real-time incidents, saves to Firestore, and broadcasts via WebSockets."""
    INCIDENTS = [
        {"title": "Crowd Bottleneck", "msg": "Gate 4 experiencing heavy flow.", "type": "warning"},
        {"title": "Safety Alert", "msg": "Unattended bag detected in Section B.", "type": "critical"},
        {"title": "Service Update", "msg": "Restroom maintenance in North Concourse.", "type": "info"}
    ]
    while True:
        await asyncio.sleep(30) # Alert every 30 seconds
        incident_data = np.random.choice(INCIDENTS)
        incident_data["time"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        
        # 1. Save to Firestore
        if db:
            try:
                db.collection("incidents").add(incident_data)
                print(f"Incident saved to Firestore: {incident_data['title']}")
            except Exception as e:
                print(f"Error saving to Firestore: {e}")

        # 2. Broadcast to WebSockets
        if active_connections:
            message = json.dumps(incident_data)
            for connection in active_connections:
                try:
                    await connection.send_text(message)
                except:
                    pass

@app.websocket("/ws/alerts")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    active_connections.append(websocket)
    try:
        while True:
            await websocket.receive_text() # Keep connection alive
    except WebSocketDisconnect:
        active_connections.remove(websocket)

@app.get("/health")
def health():
    return {"status": "optimal", "models_loaded": list(MODELS.keys())}

@app.post("/analyze/person-count")
async def count_persons(file: UploadFile = File(...)):
    contents = await file.read()
    image = Image.open(io.BytesIO(contents))
    if "yolo" in MODELS:
        results = MODELS["yolo"].predict(image, classes=[0], verbose=False)
        count = len(results[0].boxes)
        return {"count": count, "engine": "YOLOv8", "timestamp": time.time()}
    return {"error": "Model not available"}

@app.get("/navigation/route")
def get_route(start: str, end: str):
    """Simple pathfinding logic (mocked grid)."""
    # In a real app, this would use A* on a stadium coordinate graph
    # Here we return a sequence of instructions
    return {
        "start": start,
        "end": end,
        "path": [
            "Exit current section",
            "Turn left at Concourse B",
            "Proceed 50m past the Merch Store",
            "Enter Gate 12"
        ],
        "estimated_time_seconds": 180,
        "traffic_status": "clear"
    }

@app.get("/analytics/wait-times")
def get_wait_times():
    STANDS = ["Main Merch Store", "South Concessions", "North Concessions", "West Beer Garden"]
    data = []
    for stand in STANDS:
        base_time = np.random.randint(5, 15)
        is_spike = np.random.random() > 0.85
        current_time = base_time * (4 if is_spike else 1)
        data.append({
            "stand": stand,
            "wait_time": current_time,
            "status": "anomaly" if is_spike else "normal",
            "prediction": "stable" if not is_spike else "clearing soon"
        })
    return data

if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
