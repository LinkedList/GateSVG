window.App = window.App || {};
App.Views = App.Views || {};


//Point Info View
App.Views.PointInfo = Backbone.View.extend({
    el: "#info",
    
    render:function() {
        var template = _.template($("#pointInfoTemplate").html(), this.model.toJSON());
        this.$el.html(template);
        return this;
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
                new App.Views.PointInfo({
                    model: new App.Models.PointInfo({
                        distance:nearestDistance.toFixed(2), 
                        id: " "
                    })
                }).render();
            } else {
                //Put information about NamedIndividual on page
                var pointInfo = new App.Models.PointInfo({   
                        distance: nearestDistance.toFixed(2),
                        id: nearestNamedPoint.id
                    });
                new App.Views.PointInfo({model: pointInfo}).render();
                
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