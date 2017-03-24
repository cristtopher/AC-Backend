# Universal Web Platform

## Structure

```
├──./server                                                  
    ├── ./server/api                                         - Contains all api entities
    │   ├── ./server/api/company                             - Company entity (contains model, controller, router, socket handling and test files)
    │   │   ├── ./server/api/company/company.controller.js   - Here all controllers are defined
    │   │   ├── ./server/api/company/company.events.js       - Socket.io events logic
    │   │   ├── ./server/api/company/company.integration.js  - integration testing
    │   │   ├── ./server/api/company/company.model.js        - Company model definition and logic
    │   │   ├── ./server/api/company/company.model.spec.js   - model related tests
    │   │   ├── ./server/api/company/company.socket.js       - socket.io facade for register events
    │   │   ├── ./server/api/company/index.js                - router definition relative to entity
    │   │   └── ./server/api/company/index.spec.js           - router related tests
    │   ├── ./server/api/person                              - Person entity
    │   ├── ./server/api/register                            - Register entity
    │   ├── ./server/api/sector                              - Sector entity
    │   └── ./server/api/user                                - User entity
    ├── ./server/auth                                        - Auth related logic (endpoint definition and strategies)
    │   └── ./server/auth/local                              - JWT based startegy definition
    ├── ./server/components                                  - Utils
    │   └── ./server/components/errors                       - 404 error handling
    ├── ./server/config                                      - Environment and server configurations
    │   ├── ./server/config/environment                      - Configuration specific to the node environment (production, testing, development)
    │   └── ./server/config/seed                             - DB seed data (if needed)
    │   ├── ./server/config/express.js                       - Express related configurations
    │   ├── ./server/config/local.env.sample.js              - Sensitive configs shuld go here as local.env.js (local.env.js added in .gitignore)
    └── ./server/views                                       - Static views 
    ├── ./server/index.js                                    - Script to expose API
    ├── ./server/routes.js                                   - Global router definitions
    └── ./server/app.js                                      - API startup logic
```

## Getting Started

### Prerequisites

- [Git](https://git-scm.com/)
- [nvm](https://github.com/creationix/nvm) (highly recomended)
- [Node.js and npm](nodejs.org) node lts/boron (`nvm install lts/boron`)
- [node-gyp](https://github.com/nodejs/node-gyp#installation)
- [Gulp](http://gulpjs.com/) (`npm install --global gulp`)
- [MongoDB](https://www.mongodb.org/) - Keep a running daemon with `mongod`

### Installation for development

1. Run `npm install` to install server dependencies.
2. Run `mongod` in a separate shell to keep an instance of the MongoDB Daemon running
3. Run `gulp serve` to start the development server.
4. Debug mode: `gulp serve:debug`

## Building for production

1. Run `gulp build` for building and `gulp serve` for preview. The build artifacts will be stored in the `dist/` directory
2. Run the build using production configuration: `NODE_ENV=production node ./server` (or use your favourite process manager like pm2 or forever).

## Testing

- Static code analysis: `gulp lint`
- Run tests: `gulp test`
- test coverage: `gulp cov`