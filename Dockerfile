# syntax=docker/dockerfile:1

ARG NODE_VERSION=20.16.0
ARG PYTHON_VERSION=3.12
ARG PUBLIC_URL=localhost

########################
# Frontend build stage #
########################
FROM node:${NODE_VERSION}-alpine AS build
WORKDIR /usr/src/app

# Download dependencies as a separate step to take advantage of Docker's caching.
# Leverage a cache mount to /root/.npm to speed up subsequent builds.
COPY frontend/package*.json ./
RUN --mount=type=cache,target=/root/.npm npm ci

COPY frontend .
ARG PUBLIC_URL
ENV PUBLIC_URL=${PUBLIC_URL}
RUN npm run build

########################
# Backend runtime      #
########################
FROM python:${PYTHON_VERSION}-slim AS base
WORKDIR /app

# # Install curl for HEALTHCHECK
# RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
    CMD ["curl", "--fail", "--max-time", "2", "http://localhost:8000/api/health"]
# HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
#     CMD python -c "import urllib.request,sys; \
#     sys.exit(0) if urllib.request.urlopen('http://localhost:8000/api/health', timeout=2).getcode()==200 else sys.exit(1)"

RUN apt-get update && apt-get install -y rsync gosu curl && rm -rf /var/lib/apt/lists/*
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]

# Create non-root user
ARG UID=10001
RUN adduser \
    --disabled-password \
    --gecos "" \
    --home "/nonexistent" \
    --shell "/sbin/nologin" \
    --no-create-home \
    --uid "${UID}" \
    appuser

# Prevents Python from writing pyc files.
ENV PYTHONDONTWRITEBYTECODE=1

# Keeps Python from buffering stdout and stderr to avoid situations where
# the application crashes without emitting any logs due to buffering.
ENV PYTHONUNBUFFERED=1

# Install Python deps
COPY backend/requirements.txt .
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --no-cache-dir -r requirements.txt

# Copy app source
COPY backend/ .
COPY --from=build /usr/src/app/out ./build
RUN mkdir -p /app/storage && chown -R appuser:appuser /app/storage

# USER appuser  # user now changed in entrypoint.sh
EXPOSE 8000
CMD ["gunicorn", "main:app", \
    "--worker-class=gthread", \
    "--workers=3", \
    "--threads=4", \
    "--bind=0.0.0.0:8000", \
    "--timeout=60", \
    "--graceful-timeout=10", \
    "--max-requests=1000", \
    "--max-requests-jitter=100"]