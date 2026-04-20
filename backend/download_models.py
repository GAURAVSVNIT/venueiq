from ultralytics import YOLO
from transformers import pipeline

print("Downloading YOLOv8n...")
YOLO("yolov8n.pt")

print("Downloading DETR ResNet-50...")
pipeline("object-detection", model="facebook/detr-resnet-50")

print("Downloading YOLOS Tiny...")
pipeline("object-detection", model="hustvl/yolos-tiny")

print("Models downloaded successfully!")
