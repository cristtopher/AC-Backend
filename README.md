# Universal Web Platform

## Getting Started

### Prerequisites

- [Git](https://git-scm.com/)
- [nvm](https://github.com/creationix/nvm) (highly recomended)
- [Node.js and npm](nodejs.org) node lts/boron (`nvm install lts/boron`)
- [Gulp](http://gulpjs.com/) (`npm install --global gulp`)
- [MongoDB](https://www.mongodb.org/) - Keep a running daemon with `mongod`

### Installation for development

1. Run `npm install` to install server dependencies.
2. Run `mongod` in a separate shell to keep an instance of the MongoDB Daemon running
3. Run `gulp serve` to start the development server.

## Building for production

1. Run `gulp build` for building and `gulp serve` for preview. The build artifacts will be stored in the `dist/` directory
2. Run the build using production configuration: `NODE_ENV=production node ./server` (or use your favourite process manager like pm2 or forever).

## Testing

- Static code analysis: `gulp lint`
- Run tests: `gulp test`


