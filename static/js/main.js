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

    Backbone.View.prototype.close = function(){
        this.undelegateEvents();
        $(this).empty();
        this.unbind();
        if (this.onClose){
            this.onClose();
        }
    }
    
    App.svgModel = new App.Models.Svg({svgToLoad:"elephants.svg"});
    App.svgView = new App.Views.Svg({model: App.svgModel});

    //server status initialization
    App.serverStatus = new App.Models.ServerStatus();
    App.serverStatusView = new App.Views.ServerStatus(App.serverStatus);

    App.svgModel.bind("svgLoadDone", function (event) {

        //upload svg to server and get a session_id
        // $.get('/upload', function (data) {
        //     App.session_id = data;
        //     console.log(App.session_id);
        // });

        //create initializing view to indicate uploading and getting session_id

        //initialize language after the upload is done -- TODO
        App.language = new App.Models.Language();
        App.languageView = new App.Views.Language(App.language);
        App.language.set("language", "en");

        App.allPointsButtonView = new App.Views.AllPointsButton();
        App.pointMarkersView = new App.Views.PointMarkers({collection: points});

    })
    
    //close server session before quiting
    $(window).unload(function () {
        if(typeof App.session_id !== "undefined") {
            $.ajax({
                type: "POST", 
                async: false,
                url: "/close",
                data: {
                    session_id: App.session_id    
                }
            })
            return "Closed session.";
        }
    })
    
})();