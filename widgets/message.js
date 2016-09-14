(function($){
  if ( !appui ){
    alert("There is no appui");
    return false;
  }
  appui.app.message = new function(){
    var
      todo = {
        _num: 0
      },

      isShown = false,

      getCfg = function (obj, type, timeout) {
        var group = type ? type : 'info',
          cfg = {
            time: new Date(),
            type: group,
            widget: {
              cssClass: group
            }
          };

        if ( typeof(obj) !== 'object' ) {
          obj = {text: obj.toString()};
        }
        else if ( obj.widget ){
          return obj;
        }
        if ( timeout === false ){
          cfg.close = true;
        }
        else if ( timeout ){
          cfg.timeout = timeout;
        }
        if ( obj.html ){
          cfg.html = obj.html;
        }
        else if ( obj.text ){
          cfg.html = '<div>' + obj.text + '</div>';
        }
        cfg.title = obj.title ? obj.title : 'misc';
        cfg.cat = md5(cfg.title);
        cfg.data = obj.data ? obj.data : false;
        cfg.url = obj.url ? obj.url : false;
        return cfg;
      },

      getClass = function(cfg){
        return 'appui-notification-section-' + cfg.cat;
      },

      getTitleHTML = function(cfg){
        return '<h5 class="ui dividing header">' + cfg.title + '</h5>';
      },

      getItemHTML = function(cfg){
        if ( cfg.time && cfg.html ){
          var m = moment(cfg.time);
          return '<div class="appui-form-label" style="width: 130px">' +
            '<div class="metadata"><span class="date">' + m.calendar() + '</span></div>' +
            '</div><div class="ui reset appui-form-field">' +
            cfg.html +
            '</div>';

        }
        return '';
      },

      getHTML = function(cfg){
        return '<div class="appui-form-full ' + getClass(cfg) + '">' + getTitleHTML(cfg) + getItemHTML(cfg) + '</div>';
      },

      addHTML = function(cfg){
        var $cont = $(".appui-notification:visible"),
          $ele = $("." + getClass(cfg), $cont[0]);
        if ( !$cont.length ){
          return;
        }
        if ( !$ele.length ){
          $cont.prepend(getHTML(cfg));
        }
        else{
          $ele.prependTo($cont).find(".ui.header:first").after(getItemHTML(cfg));
        }
        if ( cfg.data ){
          var d = $cont.data("appui-data");
          if ( d ){
            d.push(cfg.data);
            $cont.data("appui-data", d);
          }
          else{
            $cont.data("appui-data", [cfg.data]);
          }
        }
        $cont.redraw();
      },

      callWidget = function(cfg){
        isShown = cfg.type;
        var uncertain = {};
        if ( cfg.close ){
          uncertain.close = cfg.close;
        }
        if ( cfg.timeout ){
          uncertain.delay = cfg.timeout;
        }
        $.notifyBar($.extend({
          html: '<div class="appui-notification">' + getHTML(cfg) + '</div>',
          cssClass: cfg.type,
          closeOnClick: false,
          onBeforeHide: function(){
            isShown = false;
            //appui.fn.log($(".appui-notification:visible").length, $(".appui-notification:visible").data("appui-data"));
            if ( cfg.onClose ){
              cfg.onClose(cfg.data ? cfg.data : []);
            }
          },
          onShow: function(){
            var $n = $(".appui-notification:visible").redraw();
            if ( cfg.data ){
              $n.data("appui-data", [cfg.data]);
            }
          }
        }, uncertain));
      };


    this.success = function (obj, timeout) {
      return this.show(obj, "success", timeout);
    };

    this.info = function (obj, timeout) {
      return this.show(obj, "info", timeout ? timeout : false);
    };

    this.warning = function (obj, timeout) {
      return this.show(obj, "warning", timeout ? timeout : false);
    };

    this.error = function (obj, timeout) {
      return this.show(obj, "error", timeout === undefined ? 2000 : timeout);
    };

    this.show = function (obj, type, timeout) {
      if ( !$.notifyBar ) {
        alert("The library notifyBar is needed for appui.app.messages");
        return false;
      }
      var cfg = getCfg(obj, type, timeout);
      if ( isShown ){
        if ( isShown === cfg.type ){
          if ( cfg.close ) {
            addHTML(cfg);
          }
        }
        else{
          if ( !todo[cfg.type] ) {
            todo[cfg.type] = {
              items: []
            };
            todo._num++;
          }
          todo[cfg.type].last = cfg.time.getTime();
          todo[cfg.type].items.push(cfg);
        }
      }
      else{
        callWidget(cfg);
      }
    };

    this.setID = function (id) {
      if (!id) {
        id = (new Date()).getMilliseconds();
      }
      widget.getNotifications().last().data("appui-id", id);
      return id;
    };

    this.getFromID = function (id) {
      return widget.getNotifications().filter(function () {
        return $(this).data("appui-id") === id;
      }).first();
    };

    this.deleteFromID = function (id) {
      var ele = this.getFromID(id),
        close = ele.find(".appui-notification-close");
      if (close.length) {
        close.click();
      }
      else {
        ele.parent().fadeOut("fast", function () {
          $(this).remove();
        });
      }
    };

    this.deleteAll = function () {
      widget.hide();
    };

    setInterval(function(){
      appui.fn.log("setInterval", todo, isShown);
      if ( todo._num && !isShown ){
        for ( var n in todo ){
          if ( (n.indexOf('_') !== 0) && todo[n].items.length ){
            $.each(todo[n].items, function(i, v){
              appui.app.message.show(v, v.type);
            });
            delete todo[n];
            todo._num--;
            break;
          }
        }
      }
    }, 1000);
  };
})(jQuery);