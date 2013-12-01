window.App = window.App || {};
App.Collections = App.Collections || {};

App.Collections.Points = Backbone.Collection.extend({
        model: App.Models.Point
});

App.Collections.NamedIndividuals = Backbone.Collection.extend({
		model: App.Models.NamedIndividual
});