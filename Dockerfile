# Stage 1: Build the frontend
FROM node:20 AS frontend-builder

WORKDIR /app

# Copy root package.json and package-lock.json
COPY package*.json ./

# Copy frontend package.json
COPY frontend/package*.json frontend/

# Install dependencies for the frontend workspace
RUN npm install --workspace=frontend

# Copy frontend source code
COPY frontend/ frontend/

# Build the frontend for production
RUN npm run build --workspace=frontend

# Stage 2: Build the backend and serve the frontend
FROM node:20

WORKDIR /app

# Copy root package.json and package-lock.json
COPY package*.json ./

# Copy backend package.json
COPY backend/package*.json backend/

# Install dependencies for the backend workspace
RUN npm install --omit=dev --workspace=backend

# Copy backend source code
COPY backend/ backend/

# Copy the built frontend assets from the first stage
COPY --from=frontend-builder /app/frontend/dist backend/public

# Expose the backend port
EXPOSE 3000

# Start the backend server
CMD ["npm", "start", "--workspace=backend"]