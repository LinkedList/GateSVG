$(document).ready(function() {

    //base url for images - will be loaded from here
    var baseUrl = "http://localhost/svg/images/";

    //Tree must be global
    var tree;

    initialize("elephants.svg");

    //Distance function for tree
    var distance = function(a, b){
        return Math.sqrt(Math.pow(a.x - b.x, 2) +  Math.pow(a.y - b.y, 2));
    }

    function initialize(svgToLoad) {
        //fetch xml from url
        $.ajax({
         type: "GET",
         url: baseUrl + svgToLoad,
         dataType: "xml",
         success: function(xml) {
            
            var count = $(xml).find("NamedIndividual").length;
            
            var points = new Array();

            //Find all NamedndIviduals in xml
            $(xml).find("NamedIndividual").each(function(){

                //Has coordinates - create point and add to array of points
                if($(this).attr("x")){
                    var point = {
                        x:$(this).attr("x"), 
                        y:$(this).attr("y"), 
                        name:$(this).attr("rdf:about"),
                        czName:$(this).children(":first-child").text().slice(0,-1),
                        enName:$(this).children(":nth-child(2)").text().slice(0,-1)
                    };
                    points.push(point);
                }

                //Header for the page
                if($(this).attr("rdf:about") == "GATE_GRAPHICAL_CONTENT") {
                    $("#header").text($(this).children(":first-child").text().slice(0, -1));
                }
            });
            console.log(points);


            //Create new kdTree
            tree = new kdTree(points, distance, ["x", "y"]);

            console.log(tree);

            //Add image to page
            $("#svg").prepend(xml.documentElement);
            }
        });
    }

    //Click event handler
	$(document).on('click', function(e) {
        if(e.target.nodeName == "image") {
            var point = {x:e.offsetX, y:e.offsetY}
            var nearest = tree.nearest(point, 1);
            var nearestNamedPoint = nearest[0][0];
            
            //Calculate distance between click and nearest point
            var nearestDistance = distance(point, nearestNamedPoint);
            $("#namedNearestDistance").text(nearestDistance.toFixed(2));

            //Distance must be less than 100
            if(nearestDistance > 100) {
                console.log("Nothing here");
                $("#namedNearestId").text("");
                $("#namedNearestCzName").text("");
                $("#namedNearestEnName").text("");
            } else {

                //Put information about NamedIndividual on page
                console.log(nearestNamedPoint.name);
                $("#namedNearestId").text(nearestNamedPoint.name);
                $("#namedNearestCzName").text(nearestNamedPoint.czName);
                $("#namedNearestEnName").text(nearestNamedPoint.enName);
            }
        }
	});
});