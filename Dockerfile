FROM node:22-alpine

# Create an app directory
WORKDIR /usr/src/app

# Copy code to the container
COPY . .

# Install dependencies
RUN npm install

# Build the app
RUN npm run build

# Expose the port
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
