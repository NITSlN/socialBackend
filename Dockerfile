# Use an official Node.js runtime as a parent image
FROM node:latest

# Set the working directory to /app
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the rest of the app files to the container
COPY . .

# Set environment variables
ENV MONGO_URI=mongodb+srv://nitish:nitish123@socialtestcluster.9bataei.mongodb.net/test
ENV JWT_SECRET=Nitish123
# Expose the port on which the app will run
EXPOSE 3001

# Start the app
CMD [ "npm", "start" ]
