import app from './';
import mongoose from 'mongoose';

after(function(done) {
  app.server.on('close', () => done());
  mongoose.connection.close();
  app.server.close();
});
