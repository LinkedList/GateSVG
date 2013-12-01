(function () {
    //create namespace App, different namespaces for models, collections and views
    window.App =  window.App || {
        Models: {},
        Collections: {},
        Views: {}
    };

    //simple template function
    window.template = function (id) {
        //return compiled template
        return _.template($('#' + id).html());
    };

    var svgModel = new App.Models.Svg({svgToLoad:"elephants.svg"});
    var svgView = new App.Views.Svg({model: svgModel});    


})();