FROM python:3.11-slim

# Set the working directory to /app
WORKDIR /app

# Copy the requirements file into the container
COPY backend/requirements.txt ./backend/requirements.txt

# Install dependencies
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy the rest of the backend files
COPY backend/ ./backend/

# Set the working directory to backend so relative imports work
WORKDIR /app/backend

# Run the FastAPI application using Uvicorn
# Railway injects the PORT environment variable dynamically
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
