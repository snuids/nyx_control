# Multi-platform build support for ARM64 and AMD64
# Build with: docker buildx build --platform linux/amd64,linux/arm64 -t your-image-name .

# Use an official Node.js runtime as a parent image
FROM --platform=$BUILDPLATFORM node:20-alpine AS build

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the React application
RUN npm run build

# Use an official Nginx image to serve the built application (multi-platform)
FROM --platform=$TARGETPLATFORM nginx:alpine

RUN mkdir -p /usr/share/nginx/html/controls

# Copy the built files from the previous stage to the Nginx web root
COPY --from=build /app/dist /usr/share/nginx/html/controls

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
