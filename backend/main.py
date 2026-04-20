from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import torch
from ultralytics import YOLO
from transformers import pipeline
import numpy as np
from PIL import Image
import io
import time

app = FastAPI(title="VenueIQ AI Backend")

# Enable CORS for the dashboard
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global model store (Lazy loading is better, but training/ready models for this task)
MODELS = {}

@app.on_event("startup")
async def load_models():
    print("Loading models...")
    # Load YOLOv8n (fastest variant) for person detection
    try:
        MODELS["yolo"] = YOLO("yolov8n.pt")
        print("YOLOv8 loaded.")
    except Exception as e:
        print(f"Error loading YOLO: {e}")

    # Load DETR for more complex scenes
    try:
        MODELS["detr"] = pipeline("object-detection", model="facebook/detr-resnet-50")
        print("DETR loaded.")
    except Exception as e:
        print(f"Error loading DETR: {e}")

    # Tiny YOLOS for anomaly detection
    try:
        MODELS["yolos_tiny"] = pipeline("object-detection", model="hustvl/yolos-tiny")
        print("YOLOS-Tiny loaded.")
    except Exception as e:
        print(f"Error loading YOLOS-Tiny: {e}")

@app.get("/health")
def health():
    return {"status": "optimal", "models_loaded": list(MODELS.keys())}

@app.post("/analyze/person-count")
async def count_persons(file: UploadFile = File(...)):
    contents = await file.read()
    image = Image.open(io.BytesIO(contents))
    
    # Use YOLOv8 for fast detection
    if "yolo" in MODELS:
        results = MODELS["yolo"].predict(image, classes=[0], verbose=False)
        count = len(results[0].boxes)
        return {
            "count": count,
            "engine": "YOLOv8",
            "timestamp": time.time()
        }
    
    return {"error": "Detection model not available"}

@app.post("/analyze/crowd-density")
async def crowd_density(file: UploadFile = File(...)):
    # Simulation based on CSRNet MAE/Error rate as requested
    # In a real scenario, we'd use the rootstrap-org/crowd-counting model
    contents = await file.read()
    image = Image.open(io.BytesIO(contents))
    
    # Mocking density map logic using DETR for person detection as a base
    if "detr" in MODELS:
        results = MODELS["detr"](image)
        persons = [r for r in results if r['label'] == 'person']
        count = len(persons)
        
        # Adding 'noise' based on CSRNet error rate (2-6%)
        density_factor = 1.0 + (np.random.uniform(-0.06, 0.06))
        estimated_crowd = int(count * density_factor)
        
        return {
            "estimated_people": estimated_crowd,
            "confidence": "high",
            "model": "CSRNet (Simulated via DETR)",
            "mae_ref": 10.6
        }
    
    return {"error": "Density model not available"}

@app.post("/analyze/safety")
async def safety_check(file: UploadFile = File(...)):
    contents = await file.read()
    image = Image.open(io.BytesIO(contents))
    
    # Use YOLOS-Tiny for safety/anomaly
    if "yolos_tiny" in MODELS:
        results = MODELS["yolos_tiny"](image)
        # Look for unusual objects or dense clusters
        anomalies = []
        for r in results:
            if r['score'] > 0.8:
                anomalies.append(r['label'])
        
        return {
            "status": "safe" if len(anomalies) < 10 else "warning",
            "detected_objects": list(set(anomalies)),
            "engine": "YOLOS-Tiny"
        }
    
    return {"error": "Safety model not available"}

@app.get("/analytics/wait-times")
def get_wait_times():
    # Simulation for Queue & Time-Series Anomaly
    # This would normally interface with the keras-io autoencoder
    STANDS = ["Main merch Store", "South Concessions", "North Concessions", "West Beer"]
    data = []
    for stand in STANDS:
        # Simulate wait time with random spikes (anomalies)
        base_time = np.random.randint(5, 15)
        is_spike = np.random.random() > 0.9
        current_time = base_time * (5 if is_spike else 1)
        
        data.append({
            "stand": stand,
            "wait_time": current_time,
            "status": "anomaly" if is_spike else "normal",
            "prediction": "stable" if not is_spike else "clearing in 10m"
        })
    
    return data

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
