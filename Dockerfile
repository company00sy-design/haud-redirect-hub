# Use Node.js LTS version
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies (including dev dependencies for build)
RUN npm install

# Generate Prisma client
RUN npx prisma generate --schema=./prisma/schema.prisma

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Set up database and seed data
RUN npx prisma db push --schema=./prisma/schema.prisma
RUN npx ts-node prisma/seed.ts

# Expose port
EXPOSE 3001

# Start the application
CMD ["node", "dist/index.js"]
