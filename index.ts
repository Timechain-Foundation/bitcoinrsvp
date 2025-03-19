import app from './app';
import * as fs from 'fs';
import createDb from './db/create-db';
var https = require('https');

const PORT = process.env.PORT ?? 80;

if (process.env.production) {
  var privateKey = fs.readFileSync('./privkey.pem', 'utf8');
  var certificate = fs.readFileSync('./fullchain.pem', 'utf8');
  var credentials = { key: privateKey, cert: certificate };
  var httpsServer = https.createServer(credentials, app);

  const port = process.env.PORT || 443;

  httpsServer.listen(port, async () => {
    createDb();
    console.log(`Listening on port ${port}`);
  });
} else {
  app.listen(PORT, async () => {
    createDb();
    console.log(`Listening on ${PORT}`);
  });
}