FROM node:24-alpine

WORKDIR /app

# Copy and install dependencies
COPY package*.json ./
RUN npm install

# Generate Prisma client
COPY prisma ./prisma
RUN npx prisma generate

# Copy source code
COPY . .

# Build Next.js app
RUN npm run build

EXPOSE 3000

ENV NODE_ENV=production

CMD ["npm", "start"]
