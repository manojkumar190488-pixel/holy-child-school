FROM python:3.11-slim

WORKDIR /app

# Install system dependencies including build tools and Playwright prerequisites
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    curl \
    wget \
    gnupg \
    libnss3 \
    libatk-bridge2.0-0 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libpango-1.0-0 \
    libcairo2 \
    libasound2 \
    libatspi2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copy and install Python dependencies first (layer caching)
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Install Playwright chromium browser with all OS dependencies
RUN playwright install chromium --with-deps

# Create a non-root user for security
RUN useradd -m -u 1000 appuser

# Copy application source code
COPY . .

# Set ownership and create log directory
RUN chown -R appuser:appuser /app && \
    mkdir -p /app/logs

USER appuser

EXPOSE 8000

# Environment variables
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONPATH=/app

# Default command: run with uvicorn in reload mode for development
# Override in docker-compose for production (use gunicorn + UvicornWorker)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
