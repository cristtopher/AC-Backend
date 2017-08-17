FROM node:boron
MAINTAINER Cristtopher Quintana T. "cquintana@axxezo.com"
# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json .
RUN npm install

# Bundle app source
COPY . .
EXPOSE 5001

# change default user
USER node

# Run app
CMD [ "npm", "start" ]
