// Imports dependencies and set up http server
const express = require('express'),

messengerWebbhookController = require('./controllers/messengerWebhook'),

formController = require('./controllers/formController'),

axios = require('axios'),

app = express();


//set up template engine
app.set('view engine', 'ejs');

// static files
app.use(express.static('./public'));

// Fire controllers
messengerWebbhookController(app);
formController(app);

// Sets server port and logs message on success
app.listen(process.env.PORT || 1337, () => console.log('webhook is listening'));


