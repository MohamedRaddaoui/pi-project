# Use Node.js base image
FROM node:22-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if present)
COPY package*.json ./

# Install dependencies (using npm install to ensure all dependencies are installed)
RUN npm install --only=production

# Copy source code
COPY . .

# Run the application as a non-root user
USER node

# Expose backend port
EXPOSE 5000

# Start the server
CMD ["npm", "start"]
