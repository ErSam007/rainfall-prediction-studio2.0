FROM python:3.13-slim

WORKDIR /app

# Prevent Python from writing .pyc and enable unbuffered output
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PORT=8000

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install python requirements
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy application files
COPY backend/ ./backend/
COPY frontend/dist/ ./frontend/dist/
COPY data/ ./data/

# Expose standard port
EXPOSE 8000

WORKDIR /app/backend

# Launch FastAPI web server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

