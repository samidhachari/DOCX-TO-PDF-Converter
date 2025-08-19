# Use official Node.js image
FROM node:18

# Install LibreOffice
RUN apt-get update && \
    apt-get install -y libreoffice && \
    apt-get clean

# Set working directory
WORKDIR /app

# Copy package.json and install deps
COPY package*.json ./
RUN npm install

# Copy the rest of the app
COPY . .

# Expose port (Render uses 3000 by default)
EXPOSE 3000

# Start the server
CMD ["node", "server.js"]
