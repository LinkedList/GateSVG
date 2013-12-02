window.App = window.App || {};
App.Models = App.Models || {};


//Point model
App.Models.Point = Backbone.Model.extend({
        validate: function(attrs) {
          if(! attrs.hasOwnProperty('x')) {
            return "Point must have x coordinate";
          }
          if(! attrs.hasOwnProperty('y')) {
            return "Point must have y coordinate";
          }
        },

        recalculate: function (image_size_width, image_size_height) {
              this.set("x", parseInt(image_size_width * this.get("x_percent")));
              this.set("y", parseInt(image_size_height * this.get("y_percent")));
        }
});

App.Models.NamedIndividual = Backbone.Model.extend({});


//Svg model
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
                    } else { //is named individual with location point
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

                var image_size_width = thisSvg.get('svg').width.baseVal.value;
                var image_size_height = thisSvg.get('svg').height.baseVal.value;

                //add identifier to points
                points.each(function (point) {
                    id = namedIndividuals.where({locationPoint: point.get("about")});
                    //only one identifier should be found, if not, take the first
                    point.set("id", id[0].get("about"));
                    point.recalculate(image_size_width, image_size_height);
                });

                //Create new kdTree
                tree = new kdTree(points.toJSON(), distance, ["x", "y"] );

                //upload svg to server and get a session_id
                // $.get('/upload', function (data) {
                //     App.session_id = data;
                //     console.log(App.session_id);
                // });

                //language to english
                $.post('/language', {
                    language: 'en'
                });

                //fire svgLoadDone event
                thisSvg.trigger('svgLoadDone');
            }
        });
    }
});

App.Models.PointInfo = Backbone.Model.extend({
});

App.Models.OntologyInfo = Backbone.Model.extend({
});