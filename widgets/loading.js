(function($){
  if ( !appui ){
    alert("There is no appui");
    return false;
  }
  appui.app.loading = function(id, hide){
    var ele = $("#appui_notification"),
      pinned = true,
      top = null,
      left = null,
      bottom = 5,
      right = 5,
      widget = false;

    var show = function(){
      _init();
      widget.show({content: appui.lng.loading}, "loading");
    };

    var setID = function(id){
      if ( !id ){
        id = (new Date()).getTime();
      }
      widget.getNotifications().last().data("appui-id", id);
      return id;
    };

    var getFromID = function(id){
      if ( widget ){
        return widget.getNotifications().filter(function(){
          appui.fn.log("COMPARE", $(this).data("appui-id"), id);
          return $(this).data("appui-id") === id;
        }).first();
      }
      return [];
    };

    var deleteFromID = function(id){
      var $ele = getFromID(id),
          $close = $ele.find(".appui-notification-close:visible");
      appui.fn.log(id, $ele, close);
      if ( $close.length ){
        $close.click();
      }
      else{
        $ele.parent().fadeOut("fast", function(){
          $(this).remove();
        });
      }
    };

    var deleteAll = function(){
      widget.hide();
    };

    var _init = function(show){
      if ( !ele.length ){
        ele = $('<div id="appui_notification"></div>').appendTo(document.body);
      }
      if ( show ){
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
            pinned: pinned,
            top: top,
            left: left,
            bottom: bottom,
            right: right
          },
          hideOnClick: false,
          button: true,
          templates: [{
            // define a custom template for the built-in "loading" notification type
            type: "loading",
            template: function(d){
              return '<div class="appui-notification k-notification-wrap">' +
                '<span class="appui-notification-icon loader"><span class="loader-inner"></span></span> ' +
                appui.lng.loading +
                '</div>';
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
    show();
    return setID(id ? id : false);
  }
})(jQuery);