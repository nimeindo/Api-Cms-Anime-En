const express = require('express')
const logger = require('morgan')
const bodyParser = require('body-parser')
const env = require("dotenv");
const app = express()
env.config()

// Router
const webV1 = require('./routers/webV1')

// midleware
app.use(logger('dev'));
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:false})) //biar bsa di injek

// Routes
app.use('/N-En/1', webV1)

//catch 404 error and framework then to error handler
app.use((req, res, next) => {
    const err = new Error("Not Found");
    err.status = 404;
    next(err);
})
// error handler function
app.use((err, req, res, next) =>{
    const error = app.get('env') === 'development' ? err : {};
    const status = err.status || 500;
    // response to client
    res.status(status).json({
        error:{
            message: error.message
        }
    })
    // response to ourselves
    console.error(err);
})

// start the server
const port = app.get('port') || 3000;
app.listen(port, () => console.log('Server is listening on port '+port ));