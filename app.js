//jshint esversion:6
require('dotenv').config();
const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');

const app = express();

app.use(bodyParser.urlencoded({extended:true}));
app.set('view engine', 'ejs');
app.use(express.static('public'));

mongoose.connect('mongodb://localhost:27017/userDB', {useNewUrlParser: true});

const userSchema = new mongoose.Schema ({
  email: String,
  password: String
});

const secret = process.env.SECRET;
// add mongoose-encrypt as a plugin to our schema and pass over our secret as a Javascript object
// without defining encryptedFields, the plugin would encrypt the entire database
userSchema.plugin(encrypt, { secret: secret, encryptedFields: ['password'] });
// add this plugin to the schema before you create your Mongoose model
const User = new mongoose.model("User", userSchema);

app.get('/', function(req, res) {
  res.render('home');
});

app.get('/login', function(req, res) {
  res.render('login');
});

app.get('/register', function(req, res) {
  res.render('register');
});

app.listen(3000, function(){
  console.log("Server started on port 3000");
})

app.post('/register', function(req, res) {
  const newUser = new User({
    email: req.body.username,
    password: req.body.password
  });

   newUser.save(function(err){
     if (err) {
       res.send("Could not register user. Please try again.")
     } else {
       res.render('secrets');
     }
   });
})

app.post('/login', function(req, res){
  User.findOne({
    email: req.body.username
  }, function(err, foundUser){
    if (foundUser){
      if (foundUser.password === req.body.password) {
        res.render('secrets');
      } else {
        res.render('login');
      }
    }
  });
});
