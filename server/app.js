require('dotenv').config();
var express = require('express');
var multer  = require('multer');
var path = require('path');
var fs = require('fs');
var util = require('util');
var app = express();
var requestify = require('requestify'); 
var bodyParser = require('body-parser');  //handle HTTP POST params
var validator = require('validator');
var nodemailer = require('nodemailer');
//Import the mongoose module
var mongoose = require('mongoose');

//Set up default mongoose connection
var mongoDB = process.env.MONGODB_URI || process.env.MONGOLAB_URI ||
              process.env.MONGOHQ_URL || 'mongodb://localhost/recipes';
mongoose.connect(mongoDB, {
  useMongoClient: true
});
// Get Mongoose to use the global promise library
mongoose.Promise = global.Promise;
//Get the default connection
var db = mongoose.connection;

//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
var findMatchesUrl = "http://api.yummly.com/v1/api/recipes?_app_id=be19e063&_app_key=0385881ac0513254e460d8ea12718926";
var getRecipeUrl = "http://api.yummly.com/v1/api/recipe/";
var apikey = "?_app_id=be19e063&_app_key=0385881ac0513254e460d8ea12718926";
var recipeObj = {recipeName: null, id: null};

const Clarifai = require('clarifai');

const clarifai = new Clarifai.App({
 apiKey: 'd35f844a814c4fafb202c65c1698cfe4'
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


var Recipe = require("./models/recipe");

var upload = multer({dest: 'uploads/'});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/recipes', (req, res) => {
  Recipe.find({}, 'name rating source', function (error, recipes) {
    if (error) { console.error(error); }
    console.log(recipes)
    return res.json({
      recipes: recipes
    })
  }).sort({_id:-1})
});

app.post('/sendEmail', function(req, res) {
  console.log("send email")
  var db = req.db;
  var name = req.body.name;
  var rating = req.body.rating;
  var source = req.body.body;
  var new_recipe = new Recipe({
    name: name,
    rating: rating,
    source: source
  })

  Recipe.findOneAndUpdate(
    {name: name}, // find a document with that filter
    new_recipe, // document to insert when nothing was found
    {upsert: true, new: true, runValidators: true}, // options
    function (err, doc) { // callback
        if (err) {
            // handle error
        } else {
            // handle document
        }
    }
  );

  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'schnapz2017@gmail.com',
      pass: 'comp20group19'
    }
  });

  var mailOptions = {
    from: 'schnapz2017@gmail.com',
    to: req.body.to,
    subject: req.body.subject,
    text: req.body.body
  };

  transporter.sendMail(mailOptions, function(error, info){
    if (error)
    console.log(error);
    else
    console.log('Email sent: ' + info.response);
  });
  return res.json({ error: false, 
      message: JSON.stringify("recipe sent!", null, 4)});

});


app.post('/uploads', upload.single('image'), (req, res) => {
  const image = base64_encode(req.file.path);

        clarifai.models.predict("bd367be194cf45149e75f01d59f77ba7", {base64: image}).then(
                function(response) {
                      
                        var response = response.outputs[0].data.concepts;
                        var labels = []
                        for (var i = 0; i < 4; i++) {
                         
                                labels.push(response[i].name);
                        }
                  
                        fs.unlinkSync(req.file.path);
                    
                        var url = findMatchesUrl + getParams(labels);

                        requestify.get(url).then(function(response) {
                            /*
                             * Get the response body (JSON parsed - JSON 
                             * response or jQuery object in case of XML response)
                             */
                            body = response.getBody();
                            recipes = [];
                            for (var i in body.matches) {
                              recipe = {recipeName: body.matches[i].recipeName, 
                                        id: body.matches[i].id, recipe: null};
                              recipes.push(recipe);
                            }
                            var count = 0
                            recipes.forEach(function(recipe, i, recipes) {

                              requestify.get(getRecipeUrl + recipe.id + apikey).then(function(response2) {
                                recipes[i].recipe = response2.getBody();
                                if (count === recipes.length - 1) {
                                  console.log(recipes);
                                  return res.json({ error: false, 
                                   message: JSON.stringify(recipes, null, 4)});
                                }
                                count++;
                                
                              });
                            });
                            
                            

                        });

                        
                    
                        
              
                },
                function(err) {
                        console.error(err);
                }
        );
});

function getParams(labels)
{
  var params = "";

  for (i = 0; i < labels.length; i++)
    params += "&q=" + labels[i];
  return params;
}

function base64_encode(file) {
    // read binary data
    var bitmap = fs.readFileSync(file);
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
}


app.set('port', (process.env.PORT || 5000));

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});