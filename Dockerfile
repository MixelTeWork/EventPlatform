# syntax=docker/dockerfile:1

# Comments are provided throughout this file to help you get started.
# If you need more help, visit the Dockerfile reference guide at
# https://docs.docker.com/go/dockerfile-reference/

# Want to help us make this template better? Share your feedback here: https://forms.gle/ybq9Krt8jtBL3iCk7

ARG NODE_VERSION=20.16.0
ARG PYTHON_VERSION=3.9
ARG PUBLIC_URL=https://eventplatform-mixelte.amvera.io/

################################################################################
# Use node image for base image for all stages.
FROM node:${NODE_VERSION}-alpine AS build

# Set working directory for all build stages.
WORKDIR /usr/src/app

# Download dependencies as a separate step to take advantage of Docker's caching.
# Leverage a cache mount to /root/.npm to speed up subsequent builds.
# Leverage bind mounts to package.json and package-lock.json to avoid having to copy them
# into this layer.
COPY frontend/package.json package.json
COPY frontend/package-lock.json package-lock.json
RUN --mount=type=cache,target=/root/.npm \
    # --mount=type=bind,source=package.json,target=package.json \
    # --mount=type=bind,source=package-lock.json,target=package-lock.json \
    npm ci

# Copy the rest of the source files into the image.
COPY frontend .
ARG PUBLIC_URL
ENV PUBLIC_URL=${PUBLIC_URL}
# Run the build script.
RUN npm run build

FROM python:${PYTHON_VERSION}-slim AS base

# Prevents Python from writing pyc files.
ENV PYTHONDONTWRITEBYTECODE=1

# Keeps Python from buffering stdout and stderr to avoid situations where
# the application crashes without emitting any logs due to buffering.
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# # Create a non-privileged user that the app will run under.
# # See https://docs.docker.com/go/dockerfile-user-best-practices/
# ARG UID=10001
# RUN adduser \
#     --disabled-password \
#     --gecos "" \
#     --home "/nonexistent" \
#     --shell "/sbin/nologin" \
#     --no-create-home \
#     --uid "${UID}" \
#     appuser

# Download dependencies as a separate step to take advantage of Docker's caching.
# Leverage a cache mount to /root/.cache/pip to speed up subsequent builds.
# Leverage a bind mount to requirements.txt to avoid having to copy them into
# into this layer.
COPY backend/requirements.txt requirements.txt
RUN --mount=type=cache,target=/root/.cache/pip \
    # --mount=type=bind,source=requirements.txt,target=requirements.txt \
    python -m pip install -r requirements.txt

# Switch to the non-privileged user to run the application.
# USER appuser

# Copy the source code into the container.
COPY backend/ .
COPY --from=build /usr/src/app/out ./build

# Expose the port that the application listens on.
EXPOSE 80

# Run the application.
CMD ["gunicorn", "main:app", "--bind=0.0.0.0:80"]
