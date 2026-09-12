# 1. Use an official, lightweight Node 18 runtime as base
FROM node:22-alpine

# 2. Set the working directory inside the container
WORKDIR /app

# 3. Copy package definitions first (leverages Docker layer caching)
COPY package*.json ./

# 4. Install production dependencies
RUN npm install --production

# 5. Copy the rest of the backend source code
COPY . .

# 6. Inform Docker that our Express server listens on port 8002
EXPOSE 8002

# 7. Default command to start the server
CMD ["node", "server.js"]