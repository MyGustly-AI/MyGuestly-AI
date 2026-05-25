# backend/Dockerfile
FROM node:20-alpine

# Set working directory inside the container
WORKDIR /usr/src/app

# Copy package files first to leverage Docker caching for layers
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your application code
COPY . .

# Generate Prisma Client inside the container
RUN npx prisma generate

# Expose the API port (matching your .env)
EXPOSE 5000

# Start the application using your dev script
CMD ["npm", "run dev"]