(function($){
  if ( !appui ){
    alert("There is no appui");
    return false;
  }
  appui.app.notification = {
    ele: false,
    is_init: false,
    pinned: true,
    top: null,
    left: null,
    bottom: 5,
    right: 5,
    widget: false,
    _init: function () {
      if ( !window.kendo ) {
        alert("There is no kendo");
        return false;
      }
      if (!this.is_init) {
        this.ele = $("#appui_notification");
        if (!this.ele.length) {
          this.ele = $('<div id="appui_notification"></div>').appendTo(document.body);
        }
        this.widget = this.ele.kendoNotification({
          autoHideAfter: 0,
          hide: function (e) {
            e.preventDefault();
            var $p = e.element.parent(),
              h = $p.outerHeight(true) + 4;
            $p.nextAll(".k-animation-container").each(function () {
              var n = $(this);
              n.animate({top: (parseFloat(n.css('top')) + h) + 'px'});
            });
            setTimeout(function () {
              $p.remove();
            }, 500);
          },
          position: {
            pinned: this.pinned,
            top: this.top,
            left: this.left,
            bottom: this.bottom,
            right: this.right
          },
          hideOnClick: false,
          button: true,
          templates: [{
            // define a custom template for the built-in "info" notification type
            type: "info",
            template: function (d) {
              return appui.app.notification.template(d, "info");
            }
          }, {
            // define a custom template for the built-in "success" notification type
            type: "success",
            template: function (d) {
              return appui.app.notification.template(d, "success");
            }
          }, {
            // define a custom template for the built-in "warning" notification type
            type: "warning",
            template: function (d) {
              return appui.app.notification.template(d, "warning");
            }
          }, {
            // define a custom template for the built-in "error" notification type
            type: "error",
            template: function (d) {
              return appui.app.notification.template(d, "error");
            }
          }, {
            // define a custom template for the built-in "loading" notification type
            type: "loading",
            template: function (d) {
              return appui.app.notification.template(d, "loading");
            }
          }]
        }).data("kendoNotification");
        this.is_init = 1;
      }
      return this;
    },
    cfg: {
      info: {
        cls: 'groupe',
        icon: 'info'
      },
      success: {
        cls: 'adherent',
        icon: 'flag-checkered'
      },
      warning: {
        cls: 'prospect',
        icon: 'warning'
      },
      error: {
        cls: 'radie',
        icon: 'bomb'
      }
    },
    template: function (obj, type) {
      if (typeof(obj) === 'object') {
        if (obj.type) {
          type = obj.type;
        }
        var cfg = appui.app.notification.cfg;
        return '<div class="appui-notification k-notification-wrap ' +
          '">' +
          ( type && cfg[type] ? '<button class="appui-notification-close k-i-close k-button" title="' + appui.lng.close + '"><i class="fa fa-times"> </i></button>' : '' ) +
          ( type && cfg[type] ? '<i class="appui-notification-icon fa fa-' + cfg[type].icon + '"> </i>' : '<span class="appui-notification-icon loader"><span class="loader-inner"></span></span> ' ) +
          ( obj.title ? '<span class="appui-b">' + obj.title + '</span><hr>' : '' ) +
          ( obj.content ? obj.content : ( obj.text ? obj.text : appui.lng.loading ) ) +
          '</div>';
      }
      appui.fn.log("Bad argument for notification template");
    },
    success: function (obj, timeout) {
      return this.show(obj, "success", timeout ? timeout : 2000);
    },
    show: function (obj, type, timeout) {
      this._init();
      if (typeof(obj) === 'string') {
        obj = {content: obj};
      }
      if (typeof(obj) === 'object') {
        this.widget.show(obj, type);
        if (timeout) {
          var id = this.setID(),
            t = this;
          setTimeout(function () {
            t.deleteFromID(id);
          }, timeout < 50 ? timeout * 1000 : timeout);
        }
      }
      else {
        this.widget.show({content: appui.lng.loading}, "loading");
      }
    },
    setID: function (id) {
      if (!id) {
        id = (new Date()).getMilliseconds();
      }
      this.widget.getNotifications().last().data("appui-id", id);
      return id;
    },
    getFromID: function (id) {
      return appui.app.notification.widget.getNotifications().filter(function () {
        return $(this).data("appui-id") === id;
      }).first();
    },
    deleteFromID: function (id) {
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
    },
    deleteAll: function () {
      this.widget.hide();
    }
  };
})(jQuery);