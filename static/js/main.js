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

    //close server session before quiting
    // $(window).unload(function () {
    //     if(typeof App.session_id !== "undefined") {
    //         $.ajax({
    //             type: "POST", 
    //             async: false,
    //             url: "/close",
    //             data: {
    //                 session_id: App.session_id    
    //             }
    //         })
    //         return "Closed session.";
    //     }
    // })
    
})();