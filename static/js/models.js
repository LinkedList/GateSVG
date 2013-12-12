window.App = window.App || {};
App.Models = App.Models || {};

App.Models.Polygon = Backbone.Model.extend({
    inPolygon: function (point) {
        if(typeof point.get("x") === undefined || typeof point.get("y") === undefined) {
            return false;
        }
        var points = this.get("points");

        var i, j, nvert = points.length;
        var result = false;

        for(i = 0, j = nvert - 1; i < nvert; j = i++) {
            if( 
                ( (points[i].y) >= point.get("y") != (points[j].y >= point.get("y"))) && 
                ( point.get("x") <= (points[j].x - points[i].x) * (point.get("y") - points[i].y) / (points[j].y - points[i].y) + points[i].x)
              ) {
                result = !result;
            }
        }

        return result;
    }
});


// Model for points parsed from svg
// As infromation about the center point is in percent of the image size, 
// method recalculate is for calculating a pixel position of the center point
App.Models.Point = Backbone.Model.extend({

        recalculate: function (image_size_width, image_size_height) {
              this.set("x", parseInt(image_size_width * this.get("x_percent")));
              this.set("y", parseInt(image_size_height * this.get("y_percent")));
        }
});

//Language selection model
//Listens to change and creates a request to the server for changing language
App.Models.Language = Backbone.Model.extend({

    initialize: function () {
        this.bind("change", this.change, this);
    },

    change: function (event) {
        var _this = this;
        //language change
        $.post('/language', {
            language: _this.get("language")
        }, function (data) {
            if(data.error) {
                console.log("Error setting language: " + error);
            }
            App.vent.trigger("language_change");
        });
    }
});

//Server status model
App.Models.ServerStatus = Backbone.Model.extend({

    initialize: function () {
        this.testStatus();
        //test server status once in a minute
        setInterval($.proxy(this.testStatus, this), "60000");
    },

    testStatus: function () {
        var _this = this;
        return $.get('/test', {}, function (data) {
            if(typeof data.error !== "undefined") {
                console.log("Error contacting server..");
                _this.set("status", "NOK");
            } else {
                _this.set("status", "OK");
            }
        });
    }
})

App.Models.NamedIndividual = Backbone.Model.extend({});


//Main SVG Model
//TODO structure code a bit more
App.Models.Svg = Backbone.Model.extend({

	//initialize for Svg model - donwloading of Svg happens here
    initialize: function() {
        var thisSvg = this;
        $.ajax({
            type: "GET",
            url: baseUrl + this.get('svgToLoad'),
            dataType: "xml",
            success: function (xml) {
                points = new App.Collections.Points();
                namedIndividuals = new App.Collections.NamedIndividuals();

                //Find all NamedIndviduals in xml
                $(xml).find("NamedIndividual").each(function () {
                    var object = {
                        about: $(this).attr("rdf:about")
                    };
                    
                    //is point
                    if (object.about.indexOf("point") === 0) {
                        $(this).children().each(function () {
                            var _this = $(this).context;
                            if(_this.nodeName === "go:locationPointX") {
                                object.x_percent = parseFloat(_this.textContent) / 100;
                            }

                            if(_this.nodeName === "go:locationPointY") {
                                object.y_percent = parseFloat(_this.textContent) / 100;
                            }
                        });

                        points.push(new App.Models.Point(object));
                    } else { 
                        //is named individual with location point
                        $(this).children().each(function () {
                            var _this = $(this).context;
                            if(_this.nodeName === "go:hasLocationPoint") {
                                object.locationPoint = $(this).attr("rdf:resource");
                                namedIndividuals.push(new App.Models.NamedIndividual(object));
                            }
                        });
                    }
                });
                thisSvg.set('svg', xml.documentElement);

                //Resize to acceptable size
                thisSvg.get('svg').width.baseVal.value = 940;
                thisSvg.get('svg').height.baseVal.value = 706;

                var image_size_width = thisSvg.get('svg').width.baseVal.value;
                var image_size_height = thisSvg.get('svg').height.baseVal.value;

                //add identifier to points
                points.each(function (point) {
                    id = namedIndividuals.where({locationPoint: point.get("about")});
                    //only one identifier should be found, if not, take the first
                    point.set("id", id[0].get("about"));
                    point.recalculate(image_size_width, image_size_height);
                });

                //create array with only names of points, so that checking is easier later
                points_only_names = points.map(function (point) {
                    return point.get('id');
                });

                //Create new kdTree
                tree = new KDTree(points.toJSON(), ["x", "y"] );

                //create polygons
                polygons = new App.Collections.Polygons();
                $(xml).find("polygon").each(function () {
                    var polygon = {
                        id: $(this).attr("id")
                    }

                    var points = $(this).attr("points").split(" ");
                    points = _.map(points, function(point) {
                        var coordinates = point.split(",");
                        return {
                            x: parseFloat(coordinates[0]),
                            y: parseFloat(coordinates[1])
                        };
                    });

                    polygon.points = points;
                    polygons.add(new App.Models.Polygon(polygon));
                });


                //fire svgLoadDone event
                thisSvg.trigger('svgLoadDone');
            }
        });
    }
});


//Main Point info model responsible for fetching information of the point from server
App.Models.PointInfo = Backbone.Model.extend({
    fetchLabel: function () {
        var _this = this;
        if(this.get("id") !== "") {
            return $.post("/simple", {
                uri: this.get("id"),
                lod: 1
            }, function (data) {
                _this.set("label", data.label);
            });    
        }
    },

    fetchClasses: function () {
        var _this = this;
        if(this.get("id") !== "") {
            return $.post("/simple", {
                uri: this.get("id"), 
                lod: 4
            }, function (data) {
                _this.set("classes", data.classes);
            });
        }
    },

    fetchPositionInfo: function () {
        var _this = this;
        if(this.get("id") !== "") {
            return $.post("/simple", {
                uri: this.get("id"),
                lod: 7
            }, function (data) {
                _this.set("position", data);
            });
        }
    },

    fetchInfo: function () {
        //Due to server limitation, we cannot create asynchronous requests, so every info request must
        //be created only after the previous one is done
        var labelDone = this.fetchLabel();
        labelDone.promise().done($.proxy(function () {
            var classesDone = this.fetchClasses();

            classesDone.promise().done($.proxy(this.fetchPositionInfo, this));
        }, this));
    }
});