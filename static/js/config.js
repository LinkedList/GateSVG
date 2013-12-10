//base url for images - will be loaded from here
var baseUrl = "/images/";

//tree variable - must be global on page
var tree;
var points;
var points_only_names;

var polygons;

//Distance function for tree
var distance = function(a, b){
    return Math.sqrt(Math.pow(a.x - b.x, 2) +  Math.pow(a.y - b.y, 2));
}