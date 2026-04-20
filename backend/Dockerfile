# Use a Python base image with uv pre-installed or install it
FROM python:3.13-slim-bookworm

# Install uv and system dependencies
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy dependency files
COPY pyproject.toml uv.lock ./

# Install dependencies using uv
# We use --frozen to ensure we use the exact versions in the lock file
RUN uv sync --frozen --no-dev

# Copy the rest of the application code
COPY . .

# Ensure the virtual environment is used
ENV PATH="/app/.venv/bin:$PATH"

# Pre-download models to cache them in the image
RUN python download_models.py

# Default port for Cloud Run
ENV PORT=8080

# Run the application
CMD ["python", "main.py"]
