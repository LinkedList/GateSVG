window.App = window.App || {};
App.Views = App.Views || {};


//Point Info View
App.Views.PointInfo = Backbone.View.extend({
    className: "point-info",

    events: {
        "click .close": "hide",
        "click .point-link": "pointLink"
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
        console.log(event);
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
                    id: "",
                    top: event.clientY,
                    left:event.clientX
                });
            } else {
                //Put information about NamedIndividual on page
                App.vent.trigger("point_info", {   
                        distance: nearestDistance.toFixed(2),
                        id: nearestNamedPoint.id,
                        top: event.clientY,
                        left:event.clientX
                    });
            }
    	}
    },

    getOffset: function () {
        return this.$el.offset();
    }
});

App.Views.ServerStatus = Backbone.View.extend({
    el: "#server_status", 

    initialize: function (model) {
        this.model = model;
        this.model.bind("change", this.changed, this);
    },

    changed: function () {
        var status = this.model.get("status");
        if(status === "NOK") {
            this.$el.attr('title', "Server is not responding..");
            this.$el.html("Server is not responding..");
            this.$el.removeClass("badge-success");
            this.$el.addClass("badge-important");
        } else {
            this.$el.attr('title', "Server is responding..");
            this.$el.html("Server is responding..");
            this.$el.removeClass("badge-important");
            this.$el.addClass("badge-success");
        }
    }
});

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

	initialize: function(model) {
		this.model = model;
		this.render();
	},

	render: function() {
		this.$el.html(this.model.text);
		return this;
	}
});