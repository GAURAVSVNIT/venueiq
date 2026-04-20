# 🧠 VenueIQ AI Backend

The core intelligence engine for VenueIQ, providing real-time computer vision inference and predictive analytics.

## 🧠 Core Technologies

- **Framework**: [FastAPI](https://fastapi.tiangolo.com/)
- **Inference**: [PyTorch](https://pytorch.org/), [Transformers](https://huggingface.co/docs/transformers/index), [Ultralytics (YOLOv8)](https://docs.ultralytics.com/)
- **Management**: [uv](https://docs.astral.sh/uv/)

## 🚀 Key Endpoints

- `GET /health`: System status and loaded models.
- `POST /analyze/person-count`: Detects and counts individuals in an image using YOLOv8.
- `POST /analyze/crowd-density`: Estimates crowd density and total count.
- `POST /analyze/safety`: Checks for anomalies or safety warnings using YOLOS-Tiny.
- `GET /analytics/wait-times`: Retrieves predictive wait times for venue locations.
- `GET /navigation/route`: Provides turn-by-turn routing steps for the mobile app.
- `WS /ws/alerts`: Real-time WebSocket stream for incident logs.

## 🛠 Setup & Development

```bash
# Install uv (if not already installed)
curl -LsSf https://astral.sh/uv/install.sh | sh
```

```bash
# Sync dependencies
uv sync
```

```bash
# Run server
python main.py
```

## 📦 Model Details

- **Person Detection**: `yolov8n.pt` for high-speed performance.
- **Scene Analysis**: `facebook/detr-resnet-50` for detailed object detection.
- **Anomaly Detection**: `hustvl/yolos-tiny` for efficient safety checks.
