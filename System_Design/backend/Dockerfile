# Base image : Tells docker to create a node environment to run this application
FROM node 

# Create '/app' directory inside docker image
WORKDIR /app

# Copy all package files into current directory of docker image
COPY package*.json .

# Install dependencies in docker image - Runs only once during build
RUN npm install

# Copy all code files/folders inside the docker image
COPY . .

# Executed when a container is created
CMD ["node", "index.js"]
