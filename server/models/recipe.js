var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var RecipeSchema = new Schema({
  name: String,
  source:  String, 
  rating: String

});

var Recipe = mongoose.model("Recipe", RecipeSchema);
module.exports = Recipe;