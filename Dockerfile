FROM node:boron
MAINTAINER Cristtopher Quintana T. <cquintana@axxezo.com>

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json .
RUN npm install -g gulp
RUN npm install

# Bundle app source
COPY . .

# change default user
#USER node

# Set up ENV and PORT to production environment
ENV NODE_ENV=production
ENV PORT=5001

EXPOSE 5001

# Build app
CMD [ "gulp", "build" ]

# Run app
CMD [ "node", "dist/server/" ]
