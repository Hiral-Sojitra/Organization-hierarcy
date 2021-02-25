const express = require('express');
const app = express()
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();
const bodyParser = require('body-parser');
const PORT = process.env.PORT ? process.env.PORT : 3007
const HOST = process.env.HOST ? process.env.HOST : "localhost"
const orgRoute = require('./routes/org')
const MongoClient = require('mongodb').MongoClient;
const fs = require('fs');
const swaggerUi = require('swagger-ui-express')
// Connection URL
const url = 'mongodb://localhost:27017'
// Database Name
const dbName = 'test';
// Use connect method to connect to the server
MongoClient.connect(url, function (err, client) {
    db = module.exports = client.db(dbName);
    let data = JSON.parse(fs.readFileSync('./User.json', 'utf8'));
    db.collection('Users').insertMany(data)
    collection = module.exports = db.collection('OrgCharts');
});

app.use(bodyParser.json({ limit: '150mb', extended: true }));
app.use(cors())
app.use('/org-chart', orgRoute);
const swaggerDocument = require('./swagger/swagger.json')
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.listen(PORT, HOST, () => {
    console.log(`Server is listening on  ${HOST}:${PORT}`);
});
