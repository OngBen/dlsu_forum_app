var PORT = process.env.PORT || 3000;
var express = require("express");
var app = express();

const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/gallerydb",{useNewURLParser: true, useUnifiedTopology: true});

const bodyParser = require(`body-parser`);
app.use(bodyParser.urlencoded({ extended: false }));
const fileUpload = require("express-fileupload");
const routes = require(`./routes/routes.js`);

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static("public"));

const session = require('express-session');
const flash = require('connect-flash');
const MongoStore = require('connect-mongo');
app.use(session({
  secret: 'somethingsomething',
  store: new MongoStore({ mongoUrl: mongoose.connection._connectionString }),
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, maxAge: 1000 * 60 * 60 * 24 * 7 }
}));
app.use(flash())

app.use(fileUpload());
app.use('/', routes);


var hbs = require("hbs");
app.set("view engine", "hbs");

var server = app.listen(PORT, function(){
	console.log("Listening at port 3000");
});