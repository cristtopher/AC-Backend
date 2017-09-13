FROM node:boron
LABEL maintainer="Cristtopher Quintana T. <cquintana@axxezo.com>"
LABEL system="AccessControl"

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json .
RUN npm install -g gulp
RUN npm install

# Bundle app source
COPY . .

# Define ENVs to setup at image build time
ARG NODE_ENV
ENV PORT 5001

EXPOSE 5001

# Build app
CMD [ "gulp", "build" ]
RUN [ "mv", "node_modules", "dist/" ]

RUN echo $NODE_ENV

# Run app
CMD [ "node", "dist/server/" ]
