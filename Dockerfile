# Use Node.js LTS version
FROM node:18-alpine

# Install required packages
RUN apk add --no-cache openssl

# Set working directory
WORKDIR /app

# Copy everything
COPY . .

# Install dependencies
RUN npm install

# Generate Prisma client
RUN npx prisma generate

# Build application
RUN npm run build

# Setup database and start
CMD ["sh", "-c", "npx prisma db push && npx ts-node prisma/seed.ts && node dist/index.js"]
