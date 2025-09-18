# Use Node.js LTS version
FROM node:18-alpine

# Install required packages
RUN apk add --no-cache openssl

# Set working directory
WORKDIR /app

# Copy package files first
COPY package*.json ./

# Copy Prisma schema before npm install
COPY prisma ./prisma/

# Install dependencies
RUN npm install

# Copy all source code
COPY . .

# Generate Prisma client with explicit schema path
RUN npx prisma generate --schema=./prisma/schema.prisma

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 3001

# Runtime commands: setup database and start server
CMD ["sh", "-c", "npx prisma db push --schema=./prisma/schema.prisma && npx ts-node prisma/seed.ts && node dist/index.js"]
