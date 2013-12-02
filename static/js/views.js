window.App = window.App || {};
App.Views = App.Views || {};


//Point Info View
App.Views.PointInfo = Backbone.View.extend({
    el: "#info",

    events: {
        "click #labelButton": "showLabel",
        "click #classesButton": "showClasses",
        "click #positionInfoButton": "showPositionInfo"
    },

    render:function() {
        var template = _.template($("#pointInfoTemplate").html(), this.model.toJSON());
        this.$el.html(template);
        return this;
    },

    showLabel: function (e) {
        e.preventDefault();

        if(this.model.get("id") !== "") {
            $.post("/simple", {
                uri: this.model.get("id"),
                lod: 1
            }, function (data) {
                data.template = "#labelTemplate";
                App.vent.trigger("ontology_info", data);
            });
        }
    },

    showClasses: function (e) {
        e.preventDefault();

        if(this.model.get("id") !== "") {
            $.post("/simple", {
                uri: this.model.get("id"), 
                lod: 4
            }, function (data) {
                data.template = "#classesTemplate";
                App.vent.trigger("ontology_info", data);
            });
        }
    },

    showPositionInfo: function (e) {
        e.preventDefault();

        if(this.model.get("id") !== "") {
            $.post("/simple", {
                uri: this.model.get("id"),
                lod: 7
            }, function (data) {
                var position = {};
                position.template = "#positionInfoTemplate";
                position.data = data;

                App.vent.trigger("ontology_info", position);
            });
        }
    }
});


//Svg View
App.Views.Svg = Backbone.View.extend({
	el: "#svg",

	events: {
		'click' : 'clicked'
	},

	initialize: function() {
		this.model.bind("svgLoadDone", this.render, this);
	},

    render: function() {
        this.$el.html(this.model.get('svg'));
        return this;
    },

    clicked: function(event) {
    	if(event.target.nodeName == "image") {
    		var point = new App.Models.Point({x:event.offsetX, y:event.offsetY});

    		var nearest = tree.nearest(point.toJSON(), 1);
            var nearestNamedPoint = nearest[0][0];
            var nearestDistance = nearest[0][1];
            


            //Distance must be less than 100 for now
            if(nearestDistance > 100) {
                App.vent.trigger("point_info", {
                    distance:nearestDistance.toFixed(2),
                    id: ""
                });
            } else {
                //Put information about NamedIndividual on page
                App.vent.trigger("point_info", {   
                        distance: nearestDistance.toFixed(2),
                        id: nearestNamedPoint.id
                    });
            }
    	}
    }
});

App.Views.Header = Backbone.View.extend({
	el: "#header",

	initialize: function(model) {
		this.model = model;
		this.render();
	},

	render: function() {
		this.$el.html(this.model.text);
		return this;
	}
});

App.Views.OntologyInfo = Backbone.View.extend({
    el: "#ontology_info",

    render: function () {
        var template = _.template($(this.template).html(), this.model.toJSON());
        this.$el.html(template);
        return this;
    }
})