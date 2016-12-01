(function($){
  // appui library is mandatory
  if ( !window.appui ){
    alert("There is no appui");
    return false;
  }

  appui.app.loading = function(id, url){
    // The notification widget DOM element
    var ele = $("#appui_loading"),
    // The notification widget
        widget = false,

        show = function(url){
          _init();
          widget.show({url: url}, "loading");
        },

        setID = function(id){
          if ( !id ){
            id = (new Date()).getTime();
          }
          widget.getNotifications().last().data("appui-id", id);
          return id;
        },

        getFromID = function(id){
          if ( widget ){
            return widget.getNotifications().filter(function(){
              //appui.fn.log("COMPARE", $(this).data("appui-id"), id);
              return $(this).data("appui-id") === id;
            }).first();
          }
          return [];
        },

        deleteFromID = function(id){
          var $ele = getFromID(id),
              $close = $ele.find(".appui-notification-close:visible");
          //appui.fn.log(id, $ele, close);
          if ( $close.length ){
            $close.click();
          }
          else{
            $ele.parent().fadeOut("fast", function(){
              $(this).remove();
            });
          }
        },

        deleteAll = function(){
          widget.hide();
        },

        _init = function(show){
          if ( !ele.length ){
            ele = $('<div id="appui_loading"></div>').appendTo(document.body);
            ele.kendoNotification({
              autoHideAfter: 0,
              hide: function(e){
                e.preventDefault();
                var $p = e.element.parent(),
                    h = $p.outerHeight(true) + 4;
                $p.nextAll(".k-animation-container").each(function(){
                  ele.animate({top: (parseFloat(ele.css('top')) + h) + 'px'});
                });
                setTimeout(function(){
                  $p.remove();
                }, 500);
              },
              position: {
                bottom: 5,
                right: 5
              },
              stacking: "up",
              hideOnClick: true,
              button: true,
              templates: [{
                // define a custom template for the built-in "loading" notification type
                type: "loading",
                template: function(d){
                  return '<div class="appui-loading k-notification-wrap">' +
                    '<div><span class="appui-notification-icon loader"><span class="loader-inner"></span></span> ' +
                    appui.lng.loading +
                    ( d.url ? '</div><div class="appui-notification-info">' + d.url : '' ) +
                    '</div></div>';
                }
              }]
            });
          }
          widget = ele.data("kendoNotification");
        };
    if ( id ){
      _init();
      if ( getFromID(id).length ){
        return deleteFromID(id);
      }
    }
    if ( id === false ){
      return deleteAll();
    }
    _init(true);
    show(url);
    return setID(id ? id : false);
  }
})(jQuery);