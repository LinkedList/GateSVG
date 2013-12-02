window.App = window.App || {};
App.vent = _.extend({}, Backbone.Events);

App.vent.on("point_info", function (data) {
	if(typeof App.pointInfo === "undefined") {
		App.pointInfo = new App.Views.PointInfo({
			model: new App.Models.PointInfo(data),
		});	
	}

	App.pointInfo.model = new App.Models.PointInfo(data);
	App.pointInfo.render();
});

App.vent.on("ontology_info", function (data) {
	var template = data.template;
	delete data.template;

	if(typeof App.ontologyInfo === "undefined") {
		App.ontologyInfo = new App.Views.OntologyInfo({
			model: new App.Models.OntologyInfo(data)
		});	
	}

	App.ontologyInfo.model = new App.Models.OntologyInfo(data);
	App.ontologyInfo.template = template;
	App.ontologyInfo.render();
})