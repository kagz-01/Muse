FROM python:3.10-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gfortran \
    python3-dev \
    libopenblas-dev \
    liblapack-dev \
    pkg-config \
    poppler-utils \
    tesseract-ocr \
    libmagic-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN python -m pip install --upgrade pip setuptools wheel
RUN pip install --prefer-binary --no-cache-dir -r requirements.txt
RUN playwright install chromium --with-deps

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
