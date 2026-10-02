# CitySentinal AI Backend

FastAPI-based YOLO inference backend for the CitySentinal demo.

## Setup

### 1. Create virtual environment

```powershell
cd backend
python -m venv venv
venv\Scripts\activate
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Add model files

Place your YOLO `.pt` files in the `models/` directory:

```
backend/models/
├── pothole_best.pt
├── helmet_best.pt
└── traffic_best.pt
```

### 4. Configure environment (optional)

Copy `.env.example` to `.env` and adjust values as needed.

### 5. Run the server

```bash
uvicorn main:app --reload --port 8000
```

API docs will be available at `http://localhost:8000/docs`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/models` | List available models |
| POST | `/api/predict/image` | Run image inference |
| GET | `/api/results/{filename}` | Retrieve result file |

## Project Structure

```
backend/
├── main.py              # FastAPI app entry point
├── config.py            # Configuration from env vars
├── api/
│   ├── health.py        # Health endpoint
│   ├── inference.py     # Image prediction endpoint
│   └── files.py         # Result file serving
├── services/
│   ├── model_manager.py # YOLO model loading/caching
│   ├── detection_service.py  # Detection result formatting
│   └── image_service.py      # Image processing pipeline
├── schemas/
│   ├── request.py       # Request models
│   └── response.py      # Response models
├── utils/
│   ├── validation.py    # File validation
│   └── file_utils.py    # File utilities
├── models/              # YOLO .pt files (not in git)
├── outputs/             # Annotated results
└── temp/                # Temporary files
```
