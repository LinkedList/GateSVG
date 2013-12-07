window.App = window.App || {};
App.vent = _.extend({}, Backbone.Events);

App.openedInfos = [];

App.vent.on("point_info", function (data) {	
	console.log(data);
	_.each(App.openedInfos, function (opened) {
		opened.remove();
		App.openedInfos.pop();
	});

	var info = new App.Views.PointInfo({
		model: new App.Models.PointInfo(data)
	});
	info.render();
	App.openedInfos.push(info);
});

App.vent.on("point_link", function (data) {
	var offset = App.svgView.getOffset();
	var point = points.where({id: data.id})[0];
	
	App.vent.trigger("point_info", {
		id: data.id,
		top: offset.top + point.get("y"),
		left: offset.left + point.get("x")
	});
});

App.vent.on("all_points", function () {
	App.pointMarkersView.toggle();
});