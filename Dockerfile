FROM node:18-alpine

# Install wget for healthcheck
RUN apk --no-cache add wget

# Create app directory
WORKDIR /app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Bundle app source
COPY . .

# Expose port
EXPOSE 3001

# Use tini as init system to handle signals properly
RUN apk add --no-cache tini
ENTRYPOINT ["/sbin/tini", "--"]

# Start the app
CMD ["node", "src/index.js"]
