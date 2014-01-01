window.App = window.App || {};
App.Views = App.Views || {};


// Point Info View
// Is responsible for showing ontology info of the point
// Listens to model change and subsequently renders new information into the DOM
// Doesn't get removed, only hidden, so we can show old information to the user and save requests on the server
App.Views.PointInfo = Backbone.View.extend({
    className: "point-info",

    events: {
        "click .close": "hide",
        "click .point-link": "pointLink",
        "click .send": "send",
        "submit form": "send",
        "click .more": "more",
        "click .less": "less",
        "click .all": "all",
        "click .reload": "reload"
    },

    initialize: function () {
        this.model.bind("change", this.render, this);
        this.model.fetchInfo();
    },

    render:function() {
        var template = _.template($("#pointInfoTemplate").html(), this.model.toJSON());
        this.$el.css({
            "position": "absolute",
            "top": this.model.get("top") + "px",
            "left": this.model.get("left") + "px"
        });
        this.$el.html(template);
        $("body").append(this.$el);
        return this;
    },

    pointLink: function (event) {
        event.preventDefault();
        var id = $(event.target).html().toLowerCase();
        App.vent.trigger("point_link", {
            id: id
        });
    },

    close: function (event) {
        if(typeof event !== "undefined") {
            event.preventDefault();    
        }
        this.undelegateEvents();
        this.model.unbind();
        this.remove();
    },

    hide: function () {
        this.$el.hide();
    }, 

    show: function () {
        this.$el.show();
    },

    send: function (event) {
        event.preventDefault();
        var query = this.$el.find(".query").val();
        if(query.length > 0) {
            this.model.query(query);    
        }
    }, 

    less: function (event) {
        event.preventDefault();
        this.model.less();
    },

    more: function (event) {
        event.preventDefault();
        this.model.more();
    },

    all: function(event) {
        event.preventDefault();
        this.model.all();
    },

    reload: function (event) {
        event.preventDefault();
        this.model.reload();
    }
});


// Main SVG view
// Gets rendered after the SVG is fully loaded and points are created in the model
// Listens to click event, on the image, finds the nearest object and show Point info accordingly
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

    		var nearest = tree.nearest(point.toJSON());

            var polygon = polygons.findWhere({id: nearest.point.id});

            if(polygon.inPolygon(point)) {
                App.vent.trigger("point_info", {
                    id: nearest.point.id,
                    top: event.clientY,
                    left:event.clientX
                });            
            } else {
                App.vent.trigger("hide_infos");
            }
    	}
    },

    getOffset: function () {
        return this.$el.offset();
    }
});

//View for controlling GATE server status and showing it to the user
//Changes automatically depending on the model status
App.Views.ServerStatus = Backbone.View.extend({
    el: "#server_status", 

    initialize: function (model) {
        this.model = model;
        this.model.bind("change", this.render, this);
    },

    render: function () {
            this.$el.html(this.model.get("label"));
            this.badgeColor();
    },

    badgeColor: function () {
        var status = this.model.get("status");
        if(status === "NOK") {
            this.$el.removeClass("badge-success").addClass("badge-important");
        } else {
            this.$el.removeClass("badge-important").addClass("badge-success");
        }
    }
});

//View for Language selection
//Delegates language change to the model
App.Views.Language = Backbone.View.extend({
    el: "#language_select",

    events: {
        'change': "changed"
    },

    initialize: function (model) {
        this.model = model;
    },

    changed: function (event) {
        var value = this.$el.val();
        this.model.set("language", value);
    }
})

//View for the button that toggles point markers
//Registers clicked event and sends it to Event Aggregator
App.Views.AllPointsButton = Backbone.View.extend({
    el: "#all_points",

    events: {
        "click": "clicked"
    },

    clicked: function (event) {
        event.preventDefault();
        App.vent.trigger("all_points");
    }
});

// View for Point markers, toggle is the main method to use
// When markers are shown a new span is created as a little lime point in the center of the object
App.Views.PointMarkers = Backbone.View.extend({
    visible: false,

    toggle: function () {
        if(this.visible) {
            this.hide();
        } else {
            this.show();
        }
    },

    show: function () {
        var offset = App.svgView.getOffset();
        this.collection.each(function (point) {
            var point_id = point.get("id");
            $("<span />", {"class": "point-marker", html: '&nbsp'})
                .css({
                    "position": "absolute",
                    "top": point.get("y") + offset.top,
                    "left": point.get("x") +offset.left,
                    "background-color": "lime",
                    "border-radius": "50%",
                    "width": "10px",
                    "height": "10px"
                })
                .attr("id", point_id)
                .insertAfter("svg");
        });
        this.visible = true;
    },

    hide: function () {
        $(".point-marker").remove();
        this.visible = false;
    }
})

App.Views.Header = Backbone.View.extend({
	el: "#header",

    events: {
        "click .send": "send",
        "submit form": "send"
    },

	initialize: function(model) {
		this.model = model;
        this.model.fetchHeader();
		this.model.bind("change", this.showLabel, this);
        this.model.bind("change", this.showResponse, this);
	},

	showLabel: function () {
        $(".svg-header").html(this.model.get("header"));
    },

    showResponse: function () {
        $(".svg-response").html(this.model.get("response"));
    },

    send: function () {
        event.preventDefault();
        var query = this.$el.find(".svg-query").val();
        if(query.length > 0) {
            this.model.query(query);    
        }    
    }
});