window.App = window.App || {};
App.vent = _.extend({}, Backbone.Events);

App.openedInfos = [];
App.openedInfosIds = [];

App.vent.on("point_info", function (data) {
	hide_infos();

	if($.inArray(data.id, App.openedInfosIds) === -1) {
		var info = new App.Views.PointInfo({
			model: new App.Models.PointInfo(data)
		});

		info.render();
		App.openedInfos.push(info);
		App.openedInfosIds.push(data.id);	
	} else {
		var info = _.find(App.openedInfos, function (opened) {
			return opened.model.get("id") === data.id;
		});
		console.log(data);
		info.model.set("top", data.top);
		info.model.set("left", data.left);
		info.show();
	}
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

App.vent.on("language_change", function (data) {
	_.each( App.openedInfos, function (opened) {
		opened.close();
	});

	//empty opened infos
	App.openedInfos.length = 0;
	App.openedInfosIds.length = 0;

	//Change header
	header.unset("header");
	header.fetchHeader();
});

App.vent.on("hide_infos", function () {
	hide_infos();
});

function hide_infos() {
	_.each( App.openedInfos, function (opened) {
		opened.hide();
	});
}