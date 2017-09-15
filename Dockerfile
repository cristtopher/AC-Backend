FROM node:boron
LABEL maintainer="Cristtopher Quintana T. <cquintana@axxezo.com>"
LABEL system="AccessControl"

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json .
RUN npm i --quiet -g gulp
RUN npm i --quiet

# Bundle app source
COPY . .

# Define ENVs to setup at image build time
ARG NODE_ENV
ENV NODE_ENV ${NODE_ENV}
ENV PORT 5001

EXPOSE 5001

# Build app
CMD [ "gulp", "build" ]
RUN mkdir ac-backend
RUN mv dist ac-backend
RUN mv node_modules ac-backend

# Run app
CMD [ "node", "ac-backend/dist/server/" ]