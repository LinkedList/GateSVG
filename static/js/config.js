//base url for images - will be loaded from here
var baseUrl = "http://localhost:3000/images/";

//tree variable - must be global on page
var tree;
var points;

//Distance function for tree
var distance = function(a, b){
    return Math.sqrt(Math.pow(a.x - b.x, 2) +  Math.pow(a.y - b.y, 2));
}