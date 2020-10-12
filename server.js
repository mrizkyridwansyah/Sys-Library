//read if this on development
if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}
// require all dependency
const express = require('express');
const bodyParser = require('body-parser');
const explayouts = require('express-ejs-layouts');
const methodOverride = require('method-override');//used to using method put, delete
const app = express();

//Setup Database MongoDb with Mongoose
const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true
})
const db = mongoose.connection;
db.on('error', err => console.error(err))
db.on('open', err => console.log('connected to Mongoose'))

//Require Controller/Router
const indexRouter = require('./routes/index')
const authorRouter = require('./routes/authors')
const mangasRouter = require('./routes/mangas')

//Setup View Engine, View & Layout Folder
app.set('view engine', 'ejs')
app.set('views', `${__dirname}/views`)
app.set('layout', 'layouts/layout')
app.use(explayouts)

//Using method override
app.use(methodOverride('_method'));
//Setup Public Folder & Use Body Parser
app.use(express.static('public'))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({limit: "10mb", extended: false}));//limit for uploading file max 10mb

//Use the Controller/Router
app.use('/' ,indexRouter)
app.use('/authors', authorRouter)
app.use('/mangas', mangasRouter)

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`server running on port ${PORT}`));