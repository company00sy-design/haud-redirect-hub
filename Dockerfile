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

# Start with minimal setup
CMD ["sh", "-c", "echo 'Starting server...' && npx prisma db push --accept-data-loss --force-reset && echo 'Database ready' && node dist/index.js"]
