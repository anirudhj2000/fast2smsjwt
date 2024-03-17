# Use the official Node.js image as the base image
FROM node

# Set the working directory inside the container
RUN mkdir -p /mahakali_backend
WORKDIR /mahakali_backend

# Copy package.json and package-lock.json (or yarn.lock) to leverage Docker cache
COPY package*.json ./

RUN npm config set registry https://registry.npmjs.org/

# Install dependencies
RUN npm ci

# Copy the rest of your application code to the container
COPY . .

# Expose the port your app runs on
EXPOSE 8080

# Command to run your app
CMD ["sh","-x","start.sh"]