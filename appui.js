/*
 *
 *  Appui the App-UI library
 *  Copyright 2012 Thomas Nabet
 *  v 0.2
 *
 *  appui is a window object containing elements dispatched in 3 sub-objects:
 *  - functions (f),
 *  - variables (v),
 *  - language (l)
 */
;
/**
 * Copyright Marc J. Schmidt. See the LICENSE file at the top-level
 * directory of this distribution and at
 * https://github.com/marcj/css-element-queries/blob/master/LICENSE.
 */
;
/*!
 * jQuery resize event - v1.1 - 3/14/2010
 * http://benalman.com/projects/jquery-resize-plugin/
 *
 * Copyright (c) 2010 "Cowboy" Ben Alman
 * Dual licensed under the MIT and GPL licenses.
 * http://benalman.com/about/license/
 */

// Script: jQuery resize event
//
// *Version: 1.1, Last updated: 3/14/2010*
//
// Project Home - http://benalman.com/projects/jquery-resize-plugin/
// GitHub       - http://github.com/cowboy/jquery-resize/
// Source       - http://github.com/cowboy/jquery-resize/raw/master/jquery.ba-resize.js
// (Minified)   - http://github.com/cowboy/jquery-resize/raw/master/jquery.ba-resize.min.js (1.0kb)
//
// About: License
//
// Copyright (c) 2010 "Cowboy" Ben Alman,
// Dual licensed under the MIT and GPL licenses.
// http://benalman.com/about/license/
//
// About: Examples
//
// This working example, complete with fully commented code, illustrates a few
// ways in which this plugin can be used.
//
// resize event - http://benalman.com/code/projects/jquery-resize/examples/resize/
//
// About: Support and Testing
//
// Information about what version or versions of jQuery this plugin has been
// tested with, what browsers it has been tested in, and where the unit tests
// reside (so you can test it yourself).
//
// jQuery Versions - 1.3.2, 1.4.1, 1.4.2
// Browsers Tested - Internet Explorer 6-8, Firefox 2-3.6, Safari 3-4, Chrome, Opera 9.6-10.1.
// Unit Tests      - http://benalman.com/code/projects/jquery-resize/unit/
//
// About: Release History
//
// 1.1 - (3/14/2010) Fixed a minor bug that was causing the event to trigger
//       immediately after bind in some circumstances. Also changed $.fn.data
//       to $.data to improve performance.
// 1.0 - (2/10/2010) Initial release

(function($,window,undefined){
  '$:nomunge'; // Used by YUI compressor.
  
  // A jQuery object containing all non-window elements to which the resize
  // event is bound.
  var elems = $([]),
  
      // Extend $.resize if it already exists, otherwise create it.
      jq_resize = $.resize = $.extend( $.resize, {} ),
  
      timeout_id,
  
      // Reused strings.
      str_setTimeout = 'setTimeout',
      str_resize = 'resize',
      str_data = str_resize + '-special-event',
      str_delay = 'delay',
      str_throttle = 'throttleWindow';
  
  // Property: jQuery.resize.delay
  //
  // The numeric interval (in milliseconds) at which the resize event polling
  // loop executes. Defaults to 250.
  
  jq_resize[ str_delay ] = 250;
  
  // Property: jQuery.resize.throttleWindow
  //
  // Throttle the native window object resize event to fire no more than once
  // every <jQuery.resize.delay> milliseconds. Defaults to true.
  //
  // Because the window object has its own resize event, it doesn't need to be
  // provided by this plugin, and its execution can be left entirely up to the
  // browser. However, since certain browsers fire the resize event continuously
  // while others do not, enabling this will throttle the window resize event,
  // making event behavior consistent across all elements in all browsers.
  //
  // While setting this property to false will disable window object resize
  // event throttling, please note that this property must be changed before any
  // window object resize event callbacks are bound.
  
  jq_resize[ str_throttle ] = true;
  
  // Event: resize event
  //
  // Fired when an element's width or height changes. Because browsers only
  // provide this event for the window element, for other elements a polling
  // loop is initialized, running every <jQuery.resize.delay> milliseconds
  // to see if elements' dimensions have changed. You may bind with either
  // .resize( fn ) or .bind( "resize", fn ), and unbind with .unbind( "resize" ).
  //
  // Usage:
  //
  // > jQuery('selector').bind( 'resize', function(e) {
  // >   // element's width or height has changed!
  // >   ...
  // > });
  //
  // Additional Notes:
  //
  // * The polling loop is not created until at least one callback is actually
  //   bound to the 'resize' event, and this single polling loop is shared
  //   across all elements.
  //
  // Double firing issue in jQuery 1.3.2:
  //
  // While this plugin works in jQuery 1.3.2, if an element's event callbacks
  // are manually triggered via .trigger( 'resize' ) or .resize() those
  // callbacks may double-fire, due to limitations in the jQuery 1.3.2 special
  // events system. This is not an issue when using jQuery 1.4+.
  //
  // > // While this works in jQuery 1.4+
  // > $(elem).css({ width: new_w, height: new_h }).resize();
  // >
  // > // In jQuery 1.3.2, you need to do this:
  // > var elem = $(elem);
  // > elem.css({ width: new_w, height: new_h });
  // > elem.data( 'resize-special-event', { width: elem.width(), height: elem.height() } );
  // > elem.resize();
  
  $.event.special[ str_resize ] = {
    
    // Called only when the first 'resize' event callback is bound per element.
    setup: function() {
      // Since window has its own native 'resize' event, return false so that
      // jQuery will bind the event using DOM methods. Since only 'window'
      // objects have a .setTimeout method, this should be a sufficient test.
      // Unless, of course, we're throttling the 'resize' event for window.
      if ( !jq_resize[ str_throttle ] && this[ str_setTimeout ] ) { return false; }
      
      var elem = $(this);
      
      // Add this element to the list of internal elements to monitor.
      elems = elems.add( elem );
      
      // Initialize data store on the element.
      $.data( this, str_data, { w: elem.width(), h: elem.height() } );
      
      // If this is the first element added, start the polling loop.
      if ( elems.length === 1 ) {
        loopy();
      }
    },
    
    // Called only when the last 'resize' event callback is unbound per element.
    teardown: function() {
      // Since window has its own native 'resize' event, return false so that
      // jQuery will unbind the event using DOM methods. Since only 'window'
      // objects have a .setTimeout method, this should be a sufficient test.
      // Unless, of course, we're throttling the 'resize' event for window.
      if ( !jq_resize[ str_throttle ] && this[ str_setTimeout ] ) { return false; }
      
      var elem = $(this);
      
      // Remove this element from the list of internal elements to monitor.
      elems = elems.not( elem );
      
      // Remove any data stored on the element.
      elem.removeData( str_data );
      
      // If this is the last element removed, stop the polling loop.
      if ( !elems.length ) {
        clearTimeout( timeout_id );
      }
    },
    
    // Called every time a 'resize' event callback is bound per element (new in
    // jQuery 1.4).
    add: function( handleObj ) {
      // Since window has its own native 'resize' event, return false so that
      // jQuery doesn't modify the event object. Unless, of course, we're
      // throttling the 'resize' event for window.
      if ( !jq_resize[ str_throttle ] && this[ str_setTimeout ] ) { return false; }
      
      var old_handler;
      
      // The new_handler function is executed every time the event is triggered.
      // This is used to update the internal element data store with the width
      // and height when the event is triggered manually, to avoid double-firing
      // of the event callback. See the "Double firing issue in jQuery 1.3.2"
      // comments above for more information.
      
      function new_handler( e, w, h ) {
        var elem = $(this),
            data = $.data( this, str_data );
        
        // If called from the polling loop, w and h will be passed in as
        // arguments. If called manually, via .trigger( 'resize' ) or .resize(),
        // those values will need to be computed.
        data.w = w !== undefined ? w : elem.width();
        data.h = h !== undefined ? h : elem.height();
        
        old_handler.apply( this, arguments );
      };
      
      // This may seem a little complicated, but it normalizes the special event
      // .add method between jQuery 1.4/1.4.1 and 1.4.2+
      if ( $.isFunction( handleObj ) ) {
        // 1.4, 1.4.1
        old_handler = handleObj;
        return new_handler;
      } else {
        // 1.4.2+
        old_handler = handleObj.handler;
        handleObj.handler = new_handler;
      }
    }
    
  };
  
  function loopy() {
    
    // Start the polling loop, asynchronously.
    timeout_id = window[ str_setTimeout ](function(){
      
      // Iterate over all elements to which the 'resize' event is bound.
      elems.each(function(){
        var elem = $(this),
            width = elem.width(),
            height = elem.height(),
            data = $.data( this, str_data );
        
        // If element size has changed since the last time, update the element
        // data store and trigger the 'resize' event.
        if ( width !== data.w || height !== data.h ) {
          elem.trigger( str_resize, [ data.w = width, data.h = height ] );
        }
        
      });
      
      // Loop.
      loopy();
      
    }, jq_resize[ str_delay ] );
    
  };
  
})(jQuery,this);

(function($) {
  "use strict";
  /*global window */
  /*global jQuery */
  /*global appui */
  
  $.migrateMute = true;
  if ( $.fn.reverse === undefined ){
    $.fn.reverse = [].reverse;//save a new function from Array.reverse
  }
  var $window = $(window);
  window.appui = {
    opt: {
      _cat: {}
    },
    lng: {
      /* User-defined languages elements */
      select_unselect_all: "Select/Clear all",
      search: 'Search',
      loading: 'Loading...',
      choose: 'Choose',
      error: 'Error',
      server_response: 'Server response',
      reload: 'Reload',
      errorText: 'Something went wrong',
      closeAll: "Close all",
      closeOthers: "Close others",
      pin: "Pin",
      arrange: "Arrange",
      unpin: "Unpin",
      yes: "Yes",
      no: "No",
      unknown: "Unknown",
      untitled: "Untitled",
      confirmation: "Confirmation"
    },
    var: {
      /* Usable datatypes through jQuery Ajax function */
      datatypes: ['xml', 'html', 'script', 'json', 'jsonp', 'text'],
      /* The default value used by the function shorten */
      shortenLen: 30,
      /* Categorizing keyboard map */
      keys: {
        upDown: [33, 34, 35, 36, 38, 40],
        leftRight: [36, 35, 37, 39],
        dels: [8, 46, 45],
        confirm: [13, 9],
        alt: [20, 16, 17, 18, 144],
        numbers: [48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105]
      },
      comparators: [">=", "<=", ">", "<", "="],
      operators: ["+", "-", "/", "*"],
      defaultDiacriticsRemovalMap: [
        {'base':'A', 'letters':/[\u0041\u24B6\uFF21\u00C0\u00C1\u00C2\u1EA6\u1EA4\u1EAA\u1EA8\u00C3\u0100\u0102\u1EB0\u1EAE\u1EB4\u1EB2\u0226\u01E0\u00C4\u01DE\u1EA2\u00C5\u01FA\u01CD\u0200\u0202\u1EA0\u1EAC\u1EB6\u1E00\u0104\u023A\u2C6F]/g},
        {'base':'AA','letters':/[\uA732]/g},
        {'base':'AE','letters':/[\u00C6\u01FC\u01E2]/g},
        {'base':'AO','letters':/[\uA734]/g},
        {'base':'AU','letters':/[\uA736]/g},
        {'base':'AV','letters':/[\uA738\uA73A]/g},
        {'base':'AY','letters':/[\uA73C]/g},
        {'base':'B', 'letters':/[\u0042\u24B7\uFF22\u1E02\u1E04\u1E06\u0243\u0182\u0181]/g},
        {'base':'C', 'letters':/[\u0043\u24B8\uFF23\u0106\u0108\u010A\u010C\u00C7\u1E08\u0187\u023B\uA73E]/g},
        {'base':'D', 'letters':/[\u0044\u24B9\uFF24\u1E0A\u010E\u1E0C\u1E10\u1E12\u1E0E\u0110\u018B\u018A\u0189\uA779]/g},
        {'base':'DZ','letters':/[\u01F1\u01C4]/g},
        {'base':'Dz','letters':/[\u01F2\u01C5]/g},
        {'base':'E', 'letters':/[\u0045\u24BA\uFF25\u00C8\u00C9\u00CA\u1EC0\u1EBE\u1EC4\u1EC2\u1EBC\u0112\u1E14\u1E16\u0114\u0116\u00CB\u1EBA\u011A\u0204\u0206\u1EB8\u1EC6\u0228\u1E1C\u0118\u1E18\u1E1A\u0190\u018E]/g},
        {'base':'F', 'letters':/[\u0046\u24BB\uFF26\u1E1E\u0191\uA77B]/g},
        {'base':'G', 'letters':/[\u0047\u24BC\uFF27\u01F4\u011C\u1E20\u011E\u0120\u01E6\u0122\u01E4\u0193\uA7A0\uA77D\uA77E]/g},
        {'base':'H', 'letters':/[\u0048\u24BD\uFF28\u0124\u1E22\u1E26\u021E\u1E24\u1E28\u1E2A\u0126\u2C67\u2C75\uA78D]/g},
        {'base':'I', 'letters':/[\u0049\u24BE\uFF29\u00CC\u00CD\u00CE\u0128\u012A\u012C\u0130\u00CF\u1E2E\u1EC8\u01CF\u0208\u020A\u1ECA\u012E\u1E2C\u0197]/g},
        {'base':'J', 'letters':/[\u004A\u24BF\uFF2A\u0134\u0248]/g},
        {'base':'K', 'letters':/[\u004B\u24C0\uFF2B\u1E30\u01E8\u1E32\u0136\u1E34\u0198\u2C69\uA740\uA742\uA744\uA7A2]/g},
        {'base':'L', 'letters':/[\u004C\u24C1\uFF2C\u013F\u0139\u013D\u1E36\u1E38\u013B\u1E3C\u1E3A\u0141\u023D\u2C62\u2C60\uA748\uA746\uA780]/g},
        {'base':'LJ','letters':/[\u01C7]/g},
        {'base':'Lj','letters':/[\u01C8]/g},
        {'base':'M', 'letters':/[\u004D\u24C2\uFF2D\u1E3E\u1E40\u1E42\u2C6E\u019C]/g},
        {'base':'N', 'letters':/[\u004E\u24C3\uFF2E\u01F8\u0143\u00D1\u1E44\u0147\u1E46\u0145\u1E4A\u1E48\u0220\u019D\uA790\uA7A4]/g},
        {'base':'NJ','letters':/[\u01CA]/g},
        {'base':'Nj','letters':/[\u01CB]/g},
        {'base':'O', 'letters':/[\u004F\u24C4\uFF2F\u00D2\u00D3\u00D4\u1ED2\u1ED0\u1ED6\u1ED4\u00D5\u1E4C\u022C\u1E4E\u014C\u1E50\u1E52\u014E\u022E\u0230\u00D6\u022A\u1ECE\u0150\u01D1\u020C\u020E\u01A0\u1EDC\u1EDA\u1EE0\u1EDE\u1EE2\u1ECC\u1ED8\u01EA\u01EC\u00D8\u01FE\u0186\u019F\uA74A\uA74C]/g},
        {'base':'OI','letters':/[\u01A2]/g},
        {'base':'OO','letters':/[\uA74E]/g},
        {'base':'OU','letters':/[\u0222]/g},
        {'base':'P', 'letters':/[\u0050\u24C5\uFF30\u1E54\u1E56\u01A4\u2C63\uA750\uA752\uA754]/g},
        {'base':'Q', 'letters':/[\u0051\u24C6\uFF31\uA756\uA758\u024A]/g},
        {'base':'R', 'letters':/[\u0052\u24C7\uFF32\u0154\u1E58\u0158\u0210\u0212\u1E5A\u1E5C\u0156\u1E5E\u024C\u2C64\uA75A\uA7A6\uA782]/g},
        {'base':'S', 'letters':/[\u0053\u24C8\uFF33\u1E9E\u015A\u1E64\u015C\u1E60\u0160\u1E66\u1E62\u1E68\u0218\u015E\u2C7E\uA7A8\uA784]/g},
        {'base':'T', 'letters':/[\u0054\u24C9\uFF34\u1E6A\u0164\u1E6C\u021A\u0162\u1E70\u1E6E\u0166\u01AC\u01AE\u023E\uA786]/g},
        {'base':'TZ','letters':/[\uA728]/g},
        {'base':'U', 'letters':/[\u0055\u24CA\uFF35\u00D9\u00DA\u00DB\u0168\u1E78\u016A\u1E7A\u016C\u00DC\u01DB\u01D7\u01D5\u01D9\u1EE6\u016E\u0170\u01D3\u0214\u0216\u01AF\u1EEA\u1EE8\u1EEE\u1EEC\u1EF0\u1EE4\u1E72\u0172\u1E76\u1E74\u0244]/g},
        {'base':'V', 'letters':/[\u0056\u24CB\uFF36\u1E7C\u1E7E\u01B2\uA75E\u0245]/g},
        {'base':'VY','letters':/[\uA760]/g},
        {'base':'W', 'letters':/[\u0057\u24CC\uFF37\u1E80\u1E82\u0174\u1E86\u1E84\u1E88\u2C72]/g},
        {'base':'X', 'letters':/[\u0058\u24CD\uFF38\u1E8A\u1E8C]/g},
        {'base':'Y', 'letters':/[\u0059\u24CE\uFF39\u1EF2\u00DD\u0176\u1EF8\u0232\u1E8E\u0178\u1EF6\u1EF4\u01B3\u024E\u1EFE]/g},
        {'base':'Z', 'letters':/[\u005A\u24CF\uFF3A\u0179\u1E90\u017B\u017D\u1E92\u1E94\u01B5\u0224\u2C7F\u2C6B\uA762]/g},
        {'base':'a', 'letters':/[\u0061\u24D0\uFF41\u1E9A\u00E0\u00E1\u00E2\u1EA7\u1EA5\u1EAB\u1EA9\u00E3\u0101\u0103\u1EB1\u1EAF\u1EB5\u1EB3\u0227\u01E1\u00E4\u01DF\u1EA3\u00E5\u01FB\u01CE\u0201\u0203\u1EA1\u1EAD\u1EB7\u1E01\u0105\u2C65\u0250]/g},
        {'base':'aa','letters':/[\uA733]/g},
        {'base':'ae','letters':/[\u00E6\u01FD\u01E3]/g},
        {'base':'ao','letters':/[\uA735]/g},
        {'base':'au','letters':/[\uA737]/g},
        {'base':'av','letters':/[\uA739\uA73B]/g},
        {'base':'ay','letters':/[\uA73D]/g},
        {'base':'b', 'letters':/[\u0062\u24D1\uFF42\u1E03\u1E05\u1E07\u0180\u0183\u0253]/g},
        {'base':'c', 'letters':/[\u0063\u24D2\uFF43\u0107\u0109\u010B\u010D\u00E7\u1E09\u0188\u023C\uA73F\u2184]/g},
        {'base':'d', 'letters':/[\u0064\u24D3\uFF44\u1E0B\u010F\u1E0D\u1E11\u1E13\u1E0F\u0111\u018C\u0256\u0257\uA77A]/g},
        {'base':'dz','letters':/[\u01F3\u01C6]/g},
        {'base':'e', 'letters':/[\u0065\u24D4\uFF45\u00E8\u00E9\u00EA\u1EC1\u1EBF\u1EC5\u1EC3\u1EBD\u0113\u1E15\u1E17\u0115\u0117\u00EB\u1EBB\u011B\u0205\u0207\u1EB9\u1EC7\u0229\u1E1D\u0119\u1E19\u1E1B\u0247\u025B\u01DD]/g},
        {'base':'f', 'letters':/[\u0066\u24D5\uFF46\u1E1F\u0192\uA77C]/g},
        {'base':'g', 'letters':/[\u0067\u24D6\uFF47\u01F5\u011D\u1E21\u011F\u0121\u01E7\u0123\u01E5\u0260\uA7A1\u1D79\uA77F]/g},
        {'base':'h', 'letters':/[\u0068\u24D7\uFF48\u0125\u1E23\u1E27\u021F\u1E25\u1E29\u1E2B\u1E96\u0127\u2C68\u2C76\u0265]/g},
        {'base':'hv','letters':/[\u0195]/g},
        {'base':'i', 'letters':/[\u0069\u24D8\uFF49\u00EC\u00ED\u00EE\u0129\u012B\u012D\u00EF\u1E2F\u1EC9\u01D0\u0209\u020B\u1ECB\u012F\u1E2D\u0268\u0131]/g},
        {'base':'j', 'letters':/[\u006A\u24D9\uFF4A\u0135\u01F0\u0249]/g},
        {'base':'k', 'letters':/[\u006B\u24DA\uFF4B\u1E31\u01E9\u1E33\u0137\u1E35\u0199\u2C6A\uA741\uA743\uA745\uA7A3]/g},
        {'base':'l', 'letters':/[\u006C\u24DB\uFF4C\u0140\u013A\u013E\u1E37\u1E39\u013C\u1E3D\u1E3B\u017F\u0142\u019A\u026B\u2C61\uA749\uA781\uA747]/g},
        {'base':'lj','letters':/[\u01C9]/g},
        {'base':'m', 'letters':/[\u006D\u24DC\uFF4D\u1E3F\u1E41\u1E43\u0271\u026F]/g},
        {'base':'n', 'letters':/[\u006E\u24DD\uFF4E\u01F9\u0144\u00F1\u1E45\u0148\u1E47\u0146\u1E4B\u1E49\u019E\u0272\u0149\uA791\uA7A5]/g},
        {'base':'nj','letters':/[\u01CC]/g},
        {'base':'o', 'letters':/[\u006F\u24DE\uFF4F\u00F2\u00F3\u00F4\u1ED3\u1ED1\u1ED7\u1ED5\u00F5\u1E4D\u022D\u1E4F\u014D\u1E51\u1E53\u014F\u022F\u0231\u00F6\u022B\u1ECF\u0151\u01D2\u020D\u020F\u01A1\u1EDD\u1EDB\u1EE1\u1EDF\u1EE3\u1ECD\u1ED9\u01EB\u01ED\u00F8\u01FF\u0254\uA74B\uA74D\u0275]/g},
        {'base':'oi','letters':/[\u01A3]/g},
        {'base':'ou','letters':/[\u0223]/g},
        {'base':'oo','letters':/[\uA74F]/g},
        {'base':'p','letters':/[\u0070\u24DF\uFF50\u1E55\u1E57\u01A5\u1D7D\uA751\uA753\uA755]/g},
        {'base':'q','letters':/[\u0071\u24E0\uFF51\u024B\uA757\uA759]/g},
        {'base':'r','letters':/[\u0072\u24E1\uFF52\u0155\u1E59\u0159\u0211\u0213\u1E5B\u1E5D\u0157\u1E5F\u024D\u027D\uA75B\uA7A7\uA783]/g},
        {'base':'s','letters':/[\u0073\u24E2\uFF53\u00DF\u015B\u1E65\u015D\u1E61\u0161\u1E67\u1E63\u1E69\u0219\u015F\u023F\uA7A9\uA785\u1E9B]/g},
        {'base':'t','letters':/[\u0074\u24E3\uFF54\u1E6B\u1E97\u0165\u1E6D\u021B\u0163\u1E71\u1E6F\u0167\u01AD\u0288\u2C66\uA787]/g},
        {'base':'tz','letters':/[\uA729]/g},
        {'base':'u','letters':/[\u0075\u24E4\uFF55\u00F9\u00FA\u00FB\u0169\u1E79\u016B\u1E7B\u016D\u00FC\u01DC\u01D8\u01D6\u01DA\u1EE7\u016F\u0171\u01D4\u0215\u0217\u01B0\u1EEB\u1EE9\u1EEF\u1EED\u1EF1\u1EE5\u1E73\u0173\u1E77\u1E75\u0289]/g},
        {'base':'v','letters':/[\u0076\u24E5\uFF56\u1E7D\u1E7F\u028B\uA75F\u028C]/g},
        {'base':'vy','letters':/[\uA761]/g},
        {'base':'w','letters':/[\u0077\u24E6\uFF57\u1E81\u1E83\u0175\u1E87\u1E85\u1E98\u1E89\u2C73]/g},
        {'base':'x','letters':/[\u0078\u24E7\uFF58\u1E8B\u1E8D]/g},
        {'base':'y','letters':/[\u0079\u24E8\uFF59\u1EF3\u00FD\u0177\u1EF9\u0233\u1E8F\u00FF\u1EF7\u1E99\u1EF5\u01B4\u024F\u1EFF]/g},
        {'base':'z','letters':/[\u007A\u24E9\uFF5A\u017A\u1E91\u017C\u017E\u1E93\u1E95\u01B6\u0225\u0240\u2C6C\uA763]/g}
      ]
    },
    env: {
      siteTitle: $("head title").text(),
      /* This variable should be set to true in debugging mode only */
      logging: false,
      /* Address of the CDN (where this file should be hosted) */
      cdn: 'http://cdn.app-ui.com/',
      /* Default language */
      lang: 'en',
      ele: $(document.body),
      version: "0.2",
      host: window.location.protocol + '//' + window.location.hostname,
      url: window.location.href,
      old_path: null,
      /* True when non asynchronous Ajax loads */
      loading: false,
      /* Window width */
      width: $window.width(),
      /* Window height */
      height: $window.height(),
      /* Element currently focused (jQuery object) */
      focused: false,
      /* Last time user has been active */
      last_focus: new Date(),
      /* Sleep mode (tab or window unfocused */
      sleep: false,
      /* appui.env.loaders is an array of MD5 of data and url preventing the same call to be made at the same time */
      loaders: [],
      /* appui.env.params is an array of each element of the path */
      resizeTimer: false,
      params: [],
      isInit: false
    },
    app: {
      popups: [],
    },
    events: {},
    fn: {
      money: function(m){
        if ( window.kendo !== undefined ) {
          return kendo.toString(parseInt(m), "n0");
        }
        else{

        }
      },

      fdate: function(d, wrong_result){
        var r;
        if ( (typeof(d) === 'string') && (d.length > 5) && (d.substring(d.length-5, d.length-4) === '.') ){
          d = Math.floor(d);
        }
        if ( (typeof(d) === 'number') && (d > 0) ){
          if ( d < 10000000000 ){
            d = d*1000;
          }
          r = new Date(d);
        }
        else if ( window.kendo !== undefined ) {
          try {
            r = kendo.parseDate(d);
          }
          catch (err) {
            r = d;
          }
        }
        else{

        }
        if ( !r ){
          return wrong_result && !$.isNumeric(wrong_result) ? wrong_result : '';
        }
        if ( wrong_result === 1 ){
          return
        }
        if ( r.isSame && r.isSame(new Date()) ){
          r = kendo.toString(r, 'H:mm');
          if ( r === '0:00' ){
            r = "Aujourd'hui";
          }
          return r;
        }
        else{
          return kendo.toString(r, 'd');
        }
      },

      /* Predefined callback functions for appui.fn.link function */
      ajaxErrorFunction: function(jqXHR, textStatus, errorThrown) {
        //appui.fn.log(r);
        return true;
      },
      defaultPreLinkFunction: function(r, ele) {
        //appui.fn.log(r);
        return true;
      },
      defaultLinkFunction: function(r, ele) {
        //appui.fn.log(r);
        return true;
      },
      defaultPostLinkFunction: function(r) {
        //appui.fn.log(r);
        return true;
      },
      startLoadingFunction: function(r) {
        //appui.fn.log(r);
        return true;
      },
      endLoadingFunction: function(end) {
        //appui.fn.log(r);
        return true;
      },
      defaultHistoryFunction: function(url, title, data) {
        //appui.fn.log(r);
        return true;
      },
      defaultResizeFunction: function() {
        //appui.fn.log(r);
        return true;
      },
      defaultAlertFunction: function() {
        //appui.fn.log(r);
        return true;
      },
      /* The History object if history has been loaded */
      history: window.History === undefined ? false : window.History,

      /* Extracts the URL from the parameters */
      getURL: function() {
        return appui.env.root + appui.env.params.join("/") + "/";
      },

      isEmpty: function(obj) {
        if ( !obj ){
          return true;
        }
        if ( $.isArray(obj) ){
          return obj.length ? false : true;
        }
        if ( typeof(obj) === 'object' ){
          for(var prop in obj) {
            return false;
          }
          return true;
        }
        return false;
      },
      // see http://stackoverflow.com/questions/1144783/replacing-all-occurrences-of-a-string-in-javascript
      replaceAll: function(find, replace, str) {
        if ( str !== undefined ){
          return str.toString().replace(new RegExp(appui.fn.escapeRegExp(find), 'g'), replace);
        }
        return false;
      },

      remove_quotes: function(st){
        return appui.fn.replaceAll('"', '&quot;', appui.fn.replaceAll("'", "&#39;", st));
      },

      remove_nl: function(st){
        return appui.fn.replaceAll("\n", " ", st);
      },

      remove_all: function(st){
        return appui.fn.remove_nl(appui.fn.remove_quotes(st));
      },

      nl2br: function(st){
        return appui.fn.replaceAll("\n", "<br>", st);
      },

      br2nl: function(st){
        return appui.fn.replaceAll("<br />", "\n", appui.fn.replaceAll("<br/>", "\n", appui.fn.replaceAll("<br>", "\n", st)));
      },

      html2text: function(st){
        var $test = $('<div/>').html(appui.fn.br2nl(st)).appendTo(document.body);
        st = $test.text();
        $test.remove();
        return st;
      },

      /* Extract a parameter from the URL, for when using key pairs parameters */
      getParam: function(param, num) {
        if (!num) {
          num = 1;
        }
        var i = $.inArray(param, appui.env.params),
            res = '';
        if (i > -1) {
          for ( var a = 1; a <= num; a++ ) {
            if (appui.env.params[i + a]) {
              if (res !== '') {
                res += '/';
              }
              res += appui.env.params[i + a];
            }
          }
          return res;
        }
        return false;
      },

      /* Adds or replace if exists a parameter in the URL, for when using key pairs parameters */
      setParam: function(name, value) {
        if (name && value) {
          var toAdd = value.split("/"),
              i = $.inArray(name, appui.env.params);
          if (i > -1) {
            if (toAdd.length > 1) {
              appui.env.params.splice(i + 1, 1000);
            }
          }
          else {
            toAdd.unshift(name);
          }
          $.each(toAdd, function(idx, val) {
            appui.env.params.push(encodeURI(val));
          });
        }
        return false;
      },

      // @return {integer} a random int between min and max
      randomInt: function(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
      },

      randomString: function(length, chars) {
        if ( !length ){
          length = appui.fn.randomInt(8, 14);
        }
        if ( !chars ){
          chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        }
        var result = '';
        for ( var i = length; i > 0; --i ) {
          result += chars[Math.floor(Math.random() * chars.length)];
        }
        return result;
      },

      numProperties: function(obj){
        if ( typeof(obj) !== 'object' ){
          return false;
        }
        var i = 0;
        for ( var n in obj ){
          i++;
        }
        return i;
      },

      removeAccents: function(st){
        var m = appui.var.defaultDiacriticsRemovalMap;
        for(var i=0; i < m.length; i++) {
          st = st.replace(m[i].letters, m[i].base);
        }
        return st;
      },

      makeURL: function(st){
        st = appui.fn.removeAccents(st).replace(/[^a-zA-Z0-9]/g, '-').replace(/--/g, '').toLowerCase();
        if ( st.charAt(st.length - 1) === '-' ){
          st = st.substr(0, st.length - 1);
        }
        return st;
      },

      tickNews: function(id) {
        var $ele = $("#" + id);
        $ele.find("p:first").slideUp(
          function() {
            $(this).appendTo($ele).slideDown();
          }
        );
      },

      shorten: function(st, len){
        if ( typeof(st).toLowerCase() === 'string' ){
          if ( !len ){
            len = appui.var.shortenLen;
          }
          if ( st.length > len ){
            st = st.substr(0, len-1) + '...';
          }
        }
        return st;
      },
  
      userName: function(d){
        var type = (typeof(d)).toLowerCase();
        if ( type === 'object' ){
          if ( d.full_name ){
            return d.full_name;
          }
          if ( d.login ){
            return d.login;
          }
          return appui.lng.unknown + (d.id ? " (" + d.id + ")" : "");
        }
        if ( (type === 'number') ){
          if ( appui.app.users !== undefined ){
            return appui.fn.get_field(appui.app.users, "value", id, "text");
          }
          return appui.lng.unknown + " (" + d + ")";
        }
        return appui.lng.unknown;
      },
  
      userGroup: function(d){
        var type = (typeof(d)).toLowerCase();
        if ( type === 'object' ){
          d = d.id_group;
          type = (typeof(d)).toLowerCase();
        }
        if ( (type === 'number') ){
          if ( appui.app.groups !== undefined ){
            return appui.fn.get_field(appui.app.groups, "value", id, "text");
          }
          return appui.lng.unknown + " (" + d + ")";
        }
        return appui.lng.unknown;
      },
  
      userAvatar: function(id){
        var type = (typeof(d)).toLowerCase(),
            avatar;
        if ( (type === 'object') && d.avatar ){
          avatar = d.avatar;
        }
        if ( (type === 'number') && (appui.app.users !== undefined) ){
          avatar = appui.fn.get_field(appui.app.users, "value", id, "avatar");
        }
        if ( avatar ){
          return '<span class="appui-avatar"><img src="' + avatar + '" alt="' + name + '"></span>';
        }
        return appui.var.defaultAvatar;
      },
  
      isColor: function(st){
        var reg = new RegExp('^(#[a-f0-9]{6}|#[a-f0-9]{3}|rgb *\( *[0-9]{1,3}%? *, *[0-9]{1,3}%? *, *[0-9]{1,3}%? *\)|rgba *\( *[0-9]{1,3}%? *, *[0-9]{1,3}%? *, *[0-9]{1,3}%? *, *[0-9]{1,3}%? *\)|black|green|silver|gray|olive|white|yellow|maroon|navy|red|blue|purple|teal|fuchsia|aqua)$', 'i');
        return reg.test(st);
      },

      isDimension: function(st){
        if ( typeof(st) === 'number' ){
          return 1;
        }
        if ( (typeof(st) === 'string') &&
            (st.length > 0) && (
          (st.indexOf('calc') === 0 ) ||
          (!isNaN(st.substr(0,1))) ) ){
          var el = document.createElement('div'),
              style = el.style;
          style.width = st;
          return !!style.width.length;
        }
        return false;

      },
  
      /* Sends a message in a modal dialog */
      alert: function() {
        if ( window.kendo !== undefined ) {
          var msg,
              title,
              width,
              height,
              callbackOpen,
              callbackClose,
              onOpen,
              options = {},
              onClose,
              has_msg = false,
              has_width = false,
              has_callback = false,
              $d;
          for ( var i = 0; i < arguments.length; i++ ) {
            if ( !has_msg ){
              msg = arguments[i];
              has_msg = 1;
            }
            else if ( appui.fn.isDimension(arguments[i]) || (arguments[i] === 'auto') ){
              if ( has_width ){
                height = arguments[i];
              }
              else{
                width = arguments[i];
                has_width = 1;
              }
            }
            else if ( typeof(arguments[i]) === 'string' ) {
              title = arguments[i];
            }
            else if ( $.isFunction(arguments[i]) ){
              if ( has_callback ){
                callbackClose = arguments[i];
              }
              else{
                callbackOpen = arguments[i];
                has_callback = 1;
              }
            }
            else if ( typeof(arguments[i]) === 'object' ){
              options = arguments[i];
            }
          }
          if (!msg) {
            msg = appui.lng.errorText;
          }
          if (!title) {
            title = appui.lng.error;
          }
          if (!height) {
            height = "auto";
          }
          $d = $('<div/>').appendTo(document.body);
          onOpen = function(){
            appui.fn.defaultAlertFunction($d);
            if ( callbackOpen ){
              callbackOpen($d);
            }
            appui.fn.analyzeContent($d);
          };
          onClose = function(){
            if ( callbackClose ){
              callbackClose($d);
            }
          };
          $d.kendoAlert({
            content: msg,
            title: title,
            maxWidth: options.maxWidth !== undefined ? options.maxWidth : appui.env.width - 50,
            maxHeight: options.maxHeight !== undefined ? options.maxHeight : appui.env.height - 50,
            width: width,
            height: height,
            open: function() {
              return onOpen($d);
            },
            close: function() {
              return onClose($d);
            }
          });
        }
      },
      
      confirm: function(){
        if ( window.kendo !== undefined ) {
          var msg,
              title,
              width,
              height,
              callbackYes,
              callbackNo,
              options = {},
              has_msg = false,
              has_width = false,
              has_callback = false,
              $d;
          for ( var i = 0; i < arguments.length; i++ ) {
            if ( !has_msg ){
              msg = arguments[i];
              has_msg = 1;
            }
            else if ( appui.fn.isDimension(arguments[i]) || (arguments[i] === 'auto') ){
              if ( has_width ){
                height = arguments[i];
              }
              else{
                width = arguments[i];
                has_width = 1;
              }
            }
            else if ( typeof(arguments[i]) === 'string' ) {
              title = arguments[i];
            }
            else if ( $.isFunction(arguments[i]) ){
              if ( has_callback ){
                callbackNo = arguments[i];
              }
              else{
                callbackYes = arguments[i];
                has_callback = 1;
              }
            }
            else if ( typeof(arguments[i]) === 'object' ){
              options = arguments[i];
            }
          }
          if ( callbackYes ){
            if (!msg) {
              msg = appui.lng.errorText;
            }
            if (!title) {
              title = appui.lng.confirmation;
            }
            if (!height) {
              height = "auto";
            }
            if (!callbackNo) {
              callbackNo = function(){};
            }
            $d = $('<div/>').appendTo(document.body);
            $d.kendoConfirm({
              actions: [
                {text: appui.lng.yes, action: callbackYes},
                {text: appui.lng.no, action: callbackNo}
              ],
              content: msg,
              title: title,
              maxWidth: options.maxWidth !== undefined ? options.maxWidth : appui.env.width - 50,
              maxHeight: options.maxHeight !== undefined ? options.maxHeight : appui.env.height - 50,
              width: width,
              height: height,
              open: function() {
                appui.fn.defaultAlertFunction($d);
                appui.fn.analyzeContent($d);
              }
            });
          }
        }
      },

      closePopup: function(ele) {
        if (appui.app.popups.length > 0) {
          if ( ele && !appui.app.popups[appui.app.popups.length - 1].has(ele) ){
            return;
          }
          if (appui.app.popups[appui.app.popups.length - 1].data("kendoWindow")) {
            appui.app.popups[appui.app.popups.length - 1].data("kendoWindow").close();
          }
          else if (appui.app.popups[appui.app.popups.length - 1].data("dialog")) {
            appui.app.popups[appui.app.popups.length - 1].dialog("close");
          }
        }
      },

      /* Sends a message in a modal dialog */
      popup: function() {
        var msg,
            title,
            width,
            height,
            callbackOpen,
            callbackClose,
            onOpen,
            options = {},
            onClose,
            has_msg = false,
            has_width = false,
            has_callback = false,
            i, $d, postLoad;
        for ( i = 0; i < arguments.length; i++ ) {
          if ( !has_msg ){
            msg = arguments[i];
            has_msg = 1;
          }
          else if ( appui.fn.isDimension(arguments[i]) || (arguments[i] === 'auto') ){
            if ( has_width ){
              height = arguments[i];
            }
            else{
              width = arguments[i];
              has_width = 1;
            }
          }
          else if ( typeof(arguments[i]) === 'string' ) {
            title = arguments[i];
          }
          else if ( $.isFunction(arguments[i]) ){
            if ( has_callback ){
              callbackClose = arguments[i];
            }
            else{
              callbackOpen = arguments[i];
              has_callback = 1;
            }
          }
          else if ( typeof(arguments[i]) === 'object' ){
            options = arguments[i];
          }
        }
        if (!msg) {
          msg = appui.lng.errorText;
        }
        if (!title) {
          title = appui.lng.error;
        }
        if (!height) {
          height = false;
        }
        $d = $('<div class="appui-logger"/>').appendTo(document.body);
        if ( callbackOpen ){
          $d.data("appui_callbackOpen", callbackOpen);
        }
        if ( callbackClose ){
          $d.data("appui_callbackClose", callbackClose);
        }
        onOpen = function(ele){
          appui.app.popups.push(ele);
          appui.fn.defaultAlertFunction(ele);
          if ( ele.data("appui_callbackOpen") ){
            ele.data("appui_callbackOpen")(ele);
          }
          if ( $.fn.restyle !== undefined ) {
            ele.restyle();
          }
          appui.fn.analyzeContent(ele);
        };
        onClose = function(ele){
          appui.app.popups.pop();
          if ( ele.data("appui_callbackClose") ){
            return ele.data("appui_callbackClose")(ele);
          }
        };
        if ( window.kendo !== undefined ) {
          var cfg = {
            modal: options.modal !== undefined ? options.modal : true,
            title: title || appui.lng.errorText,
            maxWidth: options.maxWidth !== undefined ? options.maxWidth : appui.env.width - 50,
            maxHeight: options.maxHeight !== undefined ? options.maxHeight : appui.env.height - 50,
            width: width,
            pinned: options.pinned !== undefined ? options.pinned : true,
            resizable: options.resizable !== undefined ? options.resizable : true,
            closable: options.closable !== undefined ? options.closable : true,
            actions: options.actions !== undefined ? options.actions : [
              "Maximize",
              "Close"
            ],
            resize: function() {
              this.refresh();
            },
            refresh: function() {
              this.center();
            },
            deactivate: function() {
              this.destroy();
            },
            open: function() {
              this.center();
            },
            close: function() {
              return onClose($d);
            }
          };
          if ( height ){
            appui.fn.log(height);
            cfg.height = height;
          }
          $d.html(msg).kendoWindow(cfg);
          appui.fn.analyzeContent($d);
        }
        else {
          $d.append(msg).dialog({
            width: Math.round(appui.env.width * 0.4),
            resizable: options.resizable !== undefined ? options.resizable : true,
            stack: false,
            modal: options.modal !== undefined ? options.modal : true,
            close: function() {
              onClose($d);
              $(this).dialog("destroy").remove();
            }
          });
          appui.fn.analyzeContent($d);
        }
        onOpen($d);
      },

      resize_popup: function(){
        var w = appui.fn.get_popup();
        if ( w ){
          if ( window.kendo !== undefined ) {
            w.data("kendoWindow").setOptions({
              maxHeight: appui.env.height - 100,
              minWidth: 850
            });
            w.data("kendoWindow").center();
          }
        }
      },

      get_popup: function(){
        if ( appui.app.popups.length > 0 ){
          return appui.app.popups[appui.app.popups.length-1];
        }
        return false;
      },

      /* Adds inputs to a form, respecting the data structure */
      add_inputs: function(form, params, prefix){
        var name,
            is_array;
        if ( form.length && params ){
          is_array = $.isArray(params);
          for ( var i in params ) {
            name = prefix ? prefix + '[' +
            ( is_array ? '' : i ) + ']' : i;
            if ( typeof(params[i]) === 'object' ){
              appui.fn.add_inputs(form, params[i], name);
            }
            else {
              form.append($("<input>").attr({
                type: "hidden",
                name: name
              }).val(params[i]));
            }
          }
        }
      },

      /* Creates a form and send data with it to a new window */
      post_out: function(action, params, callback){
        var $form = $("form#appui-form_out"),
            has_appui = false;
        if ( $form.length === 0 ){
          $form = $('<form id="appui-form_out" style="display:none"/>').appendTo(document.body);
        }
        $form.empty().attr({
          method: "post",
          action: action,
          target: "_blank"
        });
        if ( params ){
          for ( var i in params ) {
            if (i === 'appui') {
              has_appui = 1;
              break;
            }
          }
          if ( has_appui ) {
            delete params.appui;
          }
          appui.fn.add_inputs($form, params);
        }
        if ( !has_appui ){
          $form.append($("<input>").attr({
            type: "hidden",
            name: "appui"
          }).val("public"));
        }
        $form.submit();
        if ( callback ){
          callback();
        }
      },

      uniqString: function(){
        var st = '';
        for ( var i = 0; i < arguments.length; i++ ){
          if ( typeof(arguments[i]) === 'object' ){
            st += JSON.stringify(arguments[i]);
          }
          else if ( typeof(arguments[i]) !== 'string' ){
            st += arguments[i].toString();
          }
          else{
            st += arguments[i];
          }
        }
        return md5(st);
      },

      /* Posting function (with path rewriting) */
      post: function() {
        var action,
            datatype,
            callback,
            data,
            change = false,
            ele = false,
            i,
            uniq;
        for (i = 0; i < arguments.length; i++) {
          if ($.isFunction(arguments[i])) {
            callback = arguments[i];
          }
          /* jQuery object */
          else if (arguments[i] instanceof jQuery) {
            ele = arguments[i];
          }
          else if (typeof (arguments[i]) === 'object') {
            data = arguments[i];
          }
          else if ($.inArray(arguments[i], appui.var.datatypes) > -1) {
            datatype = arguments[i];
          }
          else if (typeof (arguments[i]) === 'string') {
            action = arguments[i];
          }
        }
        if (!datatype) {
          datatype = "json";
        }
        if ( typeof(data) !== 'object' ) {
          data = {};
        }
        if ( data.appui_data_checker === undefined ) {
          change = 1;
        }
        /*
           * Automatic check for same field values
           * Would be better to put it in the form's data (jquery data)
           else if ( action && data.appui_data_checkers ){
           for ( var i in data.appui_data_checkers ){
           if ( (typeof(data[i]) === 'undefined') || (data[i] !== data.appui_data_checkers) ){
           change = 1;
           break;
           }
           }
           if ( !change ){
           appui.fn.callback(action, data, callback);
           }
           }
           */
        if ( change && action ) {
          uniq = appui.fn.uniqString(action, data ? data : {});
          appui.fn.ajax(action, datatype, data, uniq, function(res){
            appui.fn.callback(action, res, callback, false, ele);
            if ( res && res.new_url !== undefined ) {
              appui.fn.setNavigationVars(res.new_url, (res.siteTitle || appui.env.siteTitle), {}, 1);
            }
          });
        }
      },

      treat_vars: function(args){
        var cfg = {}, t, i;
        for (i = 0; i < args.length; i++) {
          t = typeof (args[i]);
          /* Callbacks */
          if ($.isFunction(args[i])) {
            if (cfg.fn && !cfg.fn1) {
              cfg.fn1 = args[i];
            }
            else if (cfg.fn && cfg.fn1 && !cfg.fn2) {
              cfg.fn2 = args[i];
            }
            else if (!cfg.fn) {
              cfg.fn = args[i];
            }
          }
          /* jQuery object */
          else if (args[i] instanceof jQuery) {
            cfg.ele = args[i];
          }
          else if ( (args[i] === 1) || (args[i] === true) ) {
            cfg.force = 1;
          }
          else if (t.toLowerCase() === 'string') {
            /* Hash */
            if (args[i].indexOf('#') === 0 || args[i].indexOf(appui.env.root + '#') === 0) {
              return true;
            }
            /* Ajax datatype */
            if ($.inArray(args[i], appui.var.datatypes) > -1) {
              cfg.datatype = args[i];
            }
            /* Link */
            else {
              cfg.url = args[i];
              if (cfg.url.indexOf(appui.env.root) === 0) {
                cfg.url = cfg.url.substr(appui.env.root.length);
              }
            }
          }
          /* Event */
          else if ( t.toLowerCase() === 'object' ) {
            if ((args[i].type !== undefined) &&
                (args[i].target !== undefined)) {
              cfg.e = args[i];
            }
            /* HTML Element */
            else if (!cfg.ele && (args[i].nodeType === 1)) {
              cfg.ele = args[i];
            }
            /* An object to post */
            else if (t.toLowerCase() === 'object') {
              cfg.obj = args[i];
            }
          }
        }
        if ( cfg.obj === undefined ){
          cfg.obj = {appui: "public"};
        }
        return cfg;

      },

      ajax: function(url, datatype, data, uniq, success, failure){
        if ( $.inArray(uniq, appui.env.loaders) === -1 ){
          if ( uniq ){
            appui.env.loaders.push(uniq);
            appui.fn.startLoadingFunction(url, uniq, data);
          }
          if ( typeof(data) !== 'object' ) {
            data = {};
          }
          var empty = true;
          for ( var n in data ){
            empty = false;
            break;
          }
          if ( empty ){
            data = {appui: "public"};
          }
          $.ajax({
            type: "POST",
            url: url,
            async: true,
            datatype: datatype,
            data: JSON.stringify(data),
            contentType: 'application/json',
            success: function(res) {
              if ( uniq ) {
                appui.fn.endLoadingFunction(url, uniq, data, res);
                var idx = $.inArray(uniq, appui.env.loaders);
                if (idx > -1) {
                  appui.env.loaders.splice(idx, 1);
                }
              }
              if ($.isFunction(success) ){
                success(res);
              }
            },
            error: function(xhr, textStatus, errorThrown) {
              if ( uniq ) {
                appui.fn.endLoadingFunction(url, uniq, data, errorThrown);
                var idx = $.inArray(uniq, appui.env.loaders);
                if (idx > -1) {
                  appui.env.loaders.splice(idx, 1);
                }
              }
              var ok = 1;
              if ($.isFunction(failure) ){
                ok = failure(res);
              }
              if ( ok ) {
                appui.fn.ajaxErrorFunction(xhr, textStatus, errorThrown);
              }
            }
          });
        }
      },

      /*
         Operates a link, making use of History if available, and triggering special functions
         The possible arguments are:
         - a link or an absolute path
         - a jQuery element to inject html in
         - a callback to be called instead of defaultLinkFunction - the argument is the Ajax return
         - a callback to be called instead of defaultPostLinkFunction - the argument is the url about to be loaded
         - a callback to be called instead of defaultPreLinkFunction - the argument is the Ajax return
         It will post and expects an object with the following properties:
         - prescript: some javascript to execute before the Ajax call is made
         - script: some script to execute just after the Ajax call
         - postscript: some script to execute just after the defaultPostLinkFunction function
         - new_url: the URL to change
         - siteTitle: The title to put in the title tag
         - error: an error message
         - html: an html string to inject
         */
      link: function() {
        var cfg = appui.fn.treat_vars(arguments),
            ok = 1,
            i,
            uniq;
        if ( cfg === true ){
          return true;
        }
        /* If we can't find a correct link we load the current URL */
        if ( !cfg || (cfg.url === undefined) ) {
          return appui.fn.link(window.location.href);
        }
        /* Just executing the javascript if there is */
        if (cfg.url.indexOf('javascript:') === 0) {
          return true;
        }
        /* Mail link */
        else if (cfg.url.indexOf('mailto:') === 0) {
          window.location.href = cfg.url;
          return false;
        }
        /* Opens an external page in a new window */
        if ( ((cfg.url.indexOf("http://") === 0) || (cfg.url.indexOf("https://") === 0)) &&
            (cfg.url.indexOf(window.document.location.hostname) === -1) && cfg.e) {
          cfg.e.preventDefault();
          window.open(cfg.url);
        }
        /* The URL is fine so go ahead if something is not already loading */
        else if ( (cfg.url !== appui.env.params.join("/")) || (cfg.force === 1) ) {
          /* If a second callback is defined, it is triggered instead of defaultPreLinkFunction */
          if (cfg.fn1) {
            ok = cfg.fn1(cfg.url);
          }
          else if (appui.fn.defaultPreLinkFunction) {
            ok = appui.fn.defaultPreLinkFunction(cfg.url, cfg.force, cfg.ele);
            if (ok.data !== undefined) {
              $.extend(cfg.obj, ok.data);
              ok = 1;
            }
          }
          if (ok) {
            if (ok !== 1 && (typeof ok === 'string') ){
              cfg.url = ok;
            }
            uniq = appui.fn.uniqString(cfg.url, cfg.obj ? cfg.obj : {});
            appui.fn.ajax(cfg.url, cfg.datatype || "json", cfg.obj, uniq, function(res) {
              if (res && res.new_url) {
                res.old_path = cfg.url;
                cfg.url = res.new_url;
              }
              else if ( res.url && (cfg.url !== res.url) ){
                res.old_path = cfg.url;
              }
              // If there's nothing in the result, just an empty object, the callback stops here and the URL is not changed
              if ( (typeof(res) === 'object') && (Object.keys(res).length === 0) ){
                return;
              }
              if ( appui.fn.callback(cfg.url, res, cfg.fn, cfg.fn2, cfg.ele) &&
                  res &&
                  res.noNav === undefined) {

                // This solution is not very clean (we can't shorten a URL)
                if ( appui.env.path.indexOf(cfg.url) !== 0 ){
                  appui.fn.setNavigationVars(cfg.url, (res.title ? res.title + ' - ' : '' ) + appui.env.siteTitle);
                }
              }
            });
          }
        }
        return true;
      },

      window: function(url){
        var data = {},
            w,
            h,
            fn,
            type;
        $.each(arguments, function(i, v){
          if ( i > 0 ){
            if ( $.isFunction(v) ){
              fn = v;
            }
            else{
              type = (typeof(v)).toLowerCase();
              if ( type === 'object' ){
                data = v;
              }
              else if ( (type === 'string') || (type === 'number') ){
                if ( !w ){
                  w = v;
                }
                else if ( !h ){
                  h = v;
                }
              }
            }
          }
        });
        appui.fn.post(url, data, function(d){
          var type2 = (typeof(d)).toLowerCase();
          if ( type2 === 'string' ){
            appui.fn.alert(d, "Returned...", w ? w : "auto", h ? h : "auto", function(ele){
              appui.fn.callback(url, d, false, false, ele);
              if ($.isFunction(fn) ){
                eval(fn(ele));
              }
            });
          }
          if ( (type2 === 'object') && d.content){
            appui.fn.alert(d.content, d.title ? d.title : ' ', w ? w : "auto", h ? h : "auto", function(ele){
              appui.fn.callback(url, d, false, false, ele);
              if ($.isFunction(fn) ){
                eval(fn(ele));
              }
            });
          }
        });
      },

      callback: function(url, res, fn, fn2, ele) {
        if (res) {
          var tmp = true,
              t = typeof res,
              isObj = t.toLowerCase() === 'object',
              errTitle;
          if (isObj && res.prescript) {
            /* var ok can be changed to false in prescript execution */
            eval(res.prescript);
          }
          if (isObj && res.url === undefined) {
            res.url = url;
          }
          /* Case where a callback is defined */
          if (fn) {
            tmp = fn(res, ele);
          }
          else {
            tmp = appui.fn.defaultLinkFunction(res, ele);
          }
          if (ele && isObj && (res.content !== undefined) ){
            if (ele.is("input,textarea")) {
              ele.val(res.content);
            }
            else {
              appui.fn.insertContent(res.content, ele);
            }
          }
          if (tmp && isObj && res.script) {
            tmp = (function(data, ele){
              return eval(res.script);
              appui.fn.analyzeContent(ele, true);
            })(res.data ? res.data : {}, ele ? ele : appui.env.ele);
          }
          /* Case where a callback is defined */
          if (tmp && fn2) {
            fn2(res);
          }
          else if (isObj && appui.fn.defaultPostLinkFunction) {
            appui.fn.defaultPostLinkFunction(res, ele);
          }
          if (tmp && isObj && res.postscript) {
            eval(res.postscript);
          }
          if (isObj && res.error) {
            errTitle = res.errorTitle || appui.lng.server_response;
            appui.fn.alert(res.error, errTitle);
          }
        }
        else {
          appui.fn.alert(appui.lng.error, appui.lng.errorText);
        }
        return tmp;
      },

      /* Set the vars appui.env.url, appui.env.url and appui.env.params, and call appui.fn.history if loaded
         * If a function is passed it will be executed on return instead of appui.fn.link
         */
      setNavigationVars: function(url, title, data, repl) {
        appui.env.old_path = appui.env.path;
        appui.env.url = url.indexOf('http') > -1 ? url : appui.env.root + url;
        appui.env.path = appui.env.url.substr(appui.env.root.length);
        var tmp = appui.env.path.split("/"), state, obj;
        appui.env.params = [];
        $.each(tmp, function(i, v) {
          v = decodeURI(v.trim());
          if (v !== "") {
            appui.env.params.push(v);
          }
        });
        if ( appui.fn.history ){
          state = appui.fn.history.getState();
          obj = {
            url: appui.env.path,
            old_path: appui.env.old_path || null
          };
          if ( state.url === appui.env.url ){
            if ( state.data ){
              obj = $.extend({}, state.data, obj);
            }
            if ( state.title && !title ){
              title = state.title;
            }
            repl = 1;
          }
          if (!title) {
            title = appui.env.siteTitle;
          }
          else{
            title = appui.fn.html2text(title);
            if (title.indexOf(appui.env.siteTitle) === -1 ) {
              title += ' - ' + appui.env.siteTitle;
            }
          }
          if ( repl ){
            obj.reload = 1;
            appui.fn.history.replaceState(obj, title, appui.env.url);
          }
          else{
            appui.fn.history.pushState(obj, title, appui.env.url);
          }
        }
      },

      extend: function(){
        var r = arguments[0];
        if ( typeof(r) !== 'object' ){
          throw new Error("Each argument for appui.fn.extend must be an object");
          return;
        }
        if ( $.isArray(r) ){
          throw new Error("You cannot extend arrays with appui.fn.extend");
          return;
        }
        for ( var i = 1; i < arguments.length; i++ ){
          if ( typeof(arguments[i]) !== 'object' ){
            throw new Error("Each argument for appui.fn.extend must be an object");
            return;
          }
          if ( $.isArray(arguments[i]) ){
            throw new Error("You cannot extend arrays with appui.fn.extend");
            return;
          }
          for ( var n in arguments[i] ){
            if ( (r[n] !== undefined) &&
              (typeof(arguments[i][n]) === 'object') &&
              !$.isArray(arguments[i][n])
            ){
              appui.fn.extend(r[n], arguments[i][n]);
            }
            else{
              r[n] = arguments[i][n];
            }
          }
        }
      },

      autoExtend: function(namespace, obj){
        if ( !appui[namespace] ){
          appui[namespace] = {};
          $.extend(appui[namespace], obj);
        }
        else if ( appui.env.isInit ){
          $.extend(appui[namespace], obj);
        }
      },


  // Logging function
      log: function() {
        if ( (!appui.env.isInit || appui.env.logging) && window.console !== undefined) {
          var args = arguments,
              i = 0;
          while (i < args.length) {
            window.console.log(args[i]);
            i++;
          }
        }
      },

      order: function(arr, prop, dir) {
        var r = typeof (arr.toJSON) === 'function' ? arr.toJSON() : arr;
        return r.sort(function(a, b) {
          var va = a[prop],
              vb = b[prop],
              ta = (typeof (a[prop])).toLowerCase(),
              tb = (typeof (b[prop])).toLowerCase();
          if (ta === tb) {
            switch (ta) {
              case 'string':
                va = appui.fn.removeAccents(a[prop]).toLowerCase();
                vb = appui.fn.removeAccents(b[prop]).toLowerCase();
                break;
              case 'boolean':
                va = a[prop] ? 1 : 0;
                vb = b[prop] ? 1 : 0;
                break;
              case 'object':
                if (a[prop].getTime) {
                  va = a[prop].getTime();
                  vb = b[prop].getTime();
                }
                break;
            }
          }
          if ( va < vb ) {
            return dir === 'desc' ? 1 : -1;
          }
          if ( va > vb ) {
            return dir === 'desc' ? -1 : 1;
          }
          return 0;
        });
      },

      // Returns the index of a row in the array of objects arr where the prop is equal to val.
      // Now prop can also be an object with several properties to search against
      search: function(arr, prop, val, mode){
        if ( arr ){
          var i,
              found,
              isObj = typeof(prop) === 'object',
              r = typeof (arr.toJSON) === 'function' ? arr.toJSON() : arr,
              compare = function(v1, v2){
                switch ( mode ){
                  case "===":
                    return v1 === v2;
                  case "contains":
                    if ( v1 && v2 ){
                      return v1.toString().indexOf(v2.toString()) !== -1;
                    }
                  case "starts":
                    if ( v1 && v2 ) {
                      return v1.toString().indexOf(v2.toString()) === 0;
                    }
                  case "startsi":
                    if ( v1 && v2 ) {
                      return v2.toString().indexOf(v1.toString()) === 0;
                    }
                  default:
                    return v1 == v2;
                }
              };
          if (r && r.length && (r[0]!== undefined) ){
            for (i = 0; i < r.length; i++) {
              if ( isObj ){
                found = 1;
                for ( var n in prop ){
                  if ( !compare(r[i][n], prop[n]) ){
                    found = false;
                    break;
                  }
                }
                if ( found ){
                  return i;
                }
              }
              else if ( r[i][prop] && compare(r[i][prop], val) ) {
                return i;
              }
            }
          }
        }
        return -1;
      },

      // Returns an object from an array of objects arr where the prop is equal to val
      get_row: function(arr, prop, val){
        var idx = appui.fn.search(arr, prop, val);
        if (idx > -1) {
          return arr[idx];
        }
        return false;
      },

      // Returns a given property from the row of an array of objects arr where the prop is equal to val
      get_field: function(arr, prop, val, prop2){
        var r;
        if ( r = appui.fn.get_row(arr, prop, val) ){
          return r[prop2 ? prop2 : val] || false;
        }
        return false;
      },
      
      // Filters an object
      filter_object: function(obj, deep){
        var r = false;
        if ( typeof(o) === "object" ){
          r = {};
          for ( var n in obj ){
            if ( n.indexOf('_') !== 0 ){
              if ( deep && (typeof(obj[n]) === "object") ){
                r[n] = appui.fn.filter_object(obj[n], true);
              }
              else{
                r[n] = obj[n];
              }
            }
          }
        }
        return r;
      },
      
      countProperties: function(obj){
        if ( (typeof(obj)).toLowerCase() === 'object' ){
          var i = 0;
          for ( var n in obj ){
            i++;
          }
          return i;
        }
        return false;
      },

      cancel: function(form, e){
      },

      reset: function(form, e){
        $(form).data("appuiSubmit", null);
      },

      submit: function(form, e){
        var $form = $(form),
            url = $form.attr("action") || appui.env.path,
            data;
        if ( url === '' ){
          url = '.';
        }
        if ( (typeof(url) === 'string') && (url.indexOf("http") !== 0 || url.indexOf(window.document.location.hostname) !== -1) && !$form.is("[target]") ){
          if ( e ){
            e.preventDefault();
          }
          data = appui.fn.formdata(form);
          if ( data ){
            $form.attr("action", null);
            $form.data("appuiSubmit", 1);
            var script = $form.data("script");
            if ($.isFunction(script) ){
              $form.data("script", function(d){
                $form.attr("action", url);
                script(d);
              })
            }
            if ($form.data("script")) {
              appui.fn.post(url, data, $form.data("script"));
            }
            else {
              appui.fn.post(url, data);
            }
          }
        }
      },

      formupdated: function(form){
        var res = true,
            $f = $(form),
            data = appui.fn.formdata($f),
            $inputs = $f.find(":input:not(.appui-no)").filter("[name]").filter(function(){
              return $(this).data("appuiOriginalValue") !== undefined;
            }).each(function(){
              if ( $(this).data("appuiOriginalValue")  != data[$(this).attr("name")] ){
                //appui.fn.log($(this).data("appuiOriginalValue"), data[$(this).attr("name")]);
                res = false;
              }
            });
        return res;
      },
      
      fieldValue: function(field){
        var $f = $(field),
            v;
        if ( $f.is(":checkbox") ){
          if ( $f.is(":checked") ){
            v = $f.val();
            if ( !v ){
              v = 1;
            }
          }
          else{
            v = 0;
          }
        }
        else if ( $f.is(":radio") ){
          if ( $f.is(":checked") ){
            v = $f.val();
          }
        }
        else{
          v = $f.val();
        }
        return v;
      },

      formdata: function(form){
        var $f = $(form),
            // inputs with a name
            $inputs = $f.find(":input").filter("[name]"),
            num_changes = 0,
            $$,
            res = {},
            n,
            v,
            forget;
        $inputs.each(function(j){
          $$ = $(this);
          v = appui.fn.fieldValue(this);
          if ( (v !== undefined) && !$$.is(":disabled") ){
            var name = this.name;
            if (
              (name.indexOf("[]") === -1) &&
              (name.indexOf("[") > -1) &&
              (name.indexOf("]") > -1) &&
              (name.lastIndexOf("]") === name.length-1)
            ){
              name = appui.fn.replaceAll("][", ".", name);
              name = appui.fn.replaceAll("[", ".", name);
              name = appui.fn.replaceAll("]", "", name);
            }
            if (
              (name.length > 2) &&
              (name.indexOf("[]") === (name.length - 2))
            ) {
              n = name.substr(0, name.length - 2);
              if (res[n] === undefined) {
                res[n] = [];
              }
              res[n].push(v);
            }
            else if ( name.indexOf(".") > -1 ){
              var tmp, parts = name.split(".");
              tmp = res;
              for ( var i = 0; i < parts.length; i++ ){
                if ( res[parts[i]] === undefined ){
                  if ( i < (parts.length-1) ){
                    tmp[parts[i]] = {};
                  }
                  else{
                    tmp[parts[i]] = v;
                  }
                }
                tmp = tmp[parts[i]];
              }
            }
            else {
              res[name] = v;
            }
          }
        });
        // return num_changes ? res : false;
        return res;
      },
      
      formChanges: function(form){
        var $f = $(form),
            // inputs with a name
            $inputs = $f.find(":input[name]:not(.appui-no)"),
            data = appui.fn.formdata(form),
            changes = {},
            v,
            name;
        $inputs.each(function(){
          name = this.name;
          v = $(this).data("appuiOriginalValue");
          if ( (v !== undefined) && (data[name] !== undefined) && (data[name] !== v) ){
            changes[name] = {
              value: data[name],
              oldValue: v
            };
          }
        });
        return changes;
      },

      // http://stackoverflow.com/questions/3900701/onclick-go-full-screen
      toggle_full_screen: function() {
        var wscript;
        if (window.document.documentElement.mozRequestFullScreen) {
          if (window.document.mozFullScreen) {
            window.document.mozCancelFullScreen();
          }
          else {
            window.document.documentElement.mozRequestFullScreen();
          }
        }
        else if (window.document.documentElement.webkitRequestFullScreen) {
          if (window.document.webkitIsFullScreen) {
            window.document.webkitCancelFullScreen();
          }
          else {
            window.document.documentElement.webkitRequestFullScreen();
          }
        }
        else if (window.document.msRequestFullScreen) {
          if (window.document.msFullscreenEnabled) {
            window.document.msExitFullscreen();
          }
          else {
            window.document.documentElement.msRequestFullScreen();
          }
        }
        else if (window.document.requestFullscreen) {
          if (window.document.fullscreenEnabled) {
            window.document.exitFullscreen();
          }
          else {
            window.document.documentElement.requestFullscreen();
          }
        }
        else if (window.ActiveXObject !== undefined) { // Older IE.
          if (wscript = new window.ActiveXObject("WScript.Shell")) {
            wscript.SendKeys("{F11}");
          }
        }
        setTimeout(function(){
          appui.fn.resize();
        }, 200);
      },

      wait_for_script: function(varname, fn, attemptsLeft) {
        // 50 = 10 seconds max
        var tick = attemptsLeft || 50,
            myvar = eval(varname);
        if ( (myvar === undefined) || (myvar.appui === 'appui') ){
          if (tick > 1) {
            // recurse
            window.setTimeout(function() {
              appui.fn.wait_for_script(varname, fn, tick - 1);
            }, 200);
          }
          else {
            // no ticks left, log error
            appui.fn.log('Failed to load ' + varname);
          }
        }
        else {
          // script is loaded, fire fn
          fn();
        }
      },

      resize: function(){
        appui.env.width = $window.width();
        appui.env.height = $window.height();
        appui.fn.defaultResizeFunction();
      },

      md5: function(st){
        return md5.md5(st);
      },

      replaceHistory: function(url, title, data){
        if ( appui.fn.history !== undefined ){
          if ( (typeof(url) === 'string') && (url.indexOf(appui.env.root) === 0) ){
            url = url.substr(appui.env.root.length);
          }
          var state = appui.fn.history.getState();
          if ( !data ){
            data = {};
          }
          data.url = url || state.url.substr(appui.env.root.length);
          appui.fn.history.replaceState(state.data ? $.extend(state.data, data) : data, title || state.title, appui.env.root + data.url);
        }
      },

      addHistoryScript: function(script){
        if ( appui.fn.history !== undefined ){
          var state = appui.fn.history.getState();
          if ( state.data.script ){
            state.data.script = function(){
              state.data.script();
              script();
            };
          }
          else{
            state.data.script = script;
          }
          appui.fn.replaceHistory(state.url, state.title, state.data);
        }
      },

      escapeRegExp: function(str) {
        return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
      },

      roundDecimal: function(value, decimals){
        return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
      },

      rgb2hex: function(rgb){
        rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
        return (rgb && rgb.length === 4) ? "#" +
          ("0" + parseInt(rgb[1],10).toString(16)).slice(-2) +
          ("0" + parseInt(rgb[2],10).toString(16)).slice(-2) +
          ("0" + parseInt(rgb[3],10).toString(16)).slice(-2) : '';
      },

      cssExists: function (f) {
        var ok, rules, css = document.styleSheets;
        for (var sx = 0; sx < css.length; sx++) {
          ok = 1;
          try{
            rules = css[sx].rules || css[sx].cssRules;
          }
          catch (e){
            ok = false;
            if ( e.name !== 'SecurityError' ){
              throw e;
            }
          }
          if ( ok ){
            //appui.fn.log(rules);
            for (var cx = 0; cx < rules.length; cx++) {
              //appui.fn.log(rules[cx].selectorText);
              if ( new RegExp("(^|\\s)" + appui.fn.escapeRegExp(f) + "(\\{|\\s)", "g").test(rules[cx].selectorText) ){
                return true;
              }
            }
          }
        }
        return false;
      },
  
      camelize: function(str) {
        return str.replace('/^([A-Z])|[\\s-_](\\w)/g', function(match, p1, p2, offset) {
          if (p2) return p2.toUpperCase();
          return p1.toLowerCase();
        });
      },
      
      camelToCss: function(str){
        return str.replace('/([A-Z])/g', function(st){
          return '-' + st.toLowerCase();
        }).replace('/^./', function(st){
          return st.toLowerCase()
        });
      },
      
      insertContent: function(content, target){
        target.empty().append(content);
        appui.fn.analyzeContent(target, true);
      },
  
      cssFullWidth: function(ele){
        // Resizing the .appui-full-width containers
        return ele.each(function(i, cont){
          /** @var jQuery $p */
          var $p = $(cont),
              allFW = $(cont).children(".appui-full-width:visible");
          if ( allFW.length ){
            if ( $p.css("overflow") === 'auto' ){
              $p.css("overflow", "hidden");
            }
            var $$ = $p.children(".appui-full-width:first"),
                w = $p.width(),
                siblings = $$.siblings(),
                siblingsFW = siblings.filter(".appui-full-width");
            while ( !w && ($p[0] !== document.body) ){
              $p = $p.parent();
              w = $p.width();
            }
            if ( w ){
              var num = allFW.length,
                  diff = $$.outerWidth(true) - $$.width();
    
              // Calculating the space left by the siblings within the container
              // Excepting the ones with absolute positioning
    
              siblings.each(function(){
                var $t = $(this);
                if ( !$t.hasClass("appui-full-width") &&
                  $t.is(":visible") &&
                  ($t.css('position') !== 'absolute') &&
                  ($t.css('position') !== 'fixed') &&
                  ($t.css('display') !== 'inline')
                ){
                  var w2 = $t.outerWidth(true);
                  if ( w2 ){
                    w -= w2;
                  }
                }
              });
              if ( diff ){
                w -= diff;
              }
              if ( num && (w > 0) ){
                if ( num > 1 ){
                  $.each(siblingsFW, function(){
                    var $t = $(this);
                    w -= $t.outerWidth(true) - $t.width();
                  });
                }
                if ( siblingsFW.length ){
                  siblingsFW.width(w/num);
                }
                $$.width(w/num);
                var $table = $$.children(".k-grid-content:visible");
                if ( $table.length === 1 ){
                  // @todo See if we leave it or not
                  //$(ele).css({overflow:"hidden"});
                  w = $$.width();
                  $table.siblings().each(function(){
                    w -= $(this).outerWidth(true);
                  });
                  $table
                    .width(w)
                    .closest("[data-role=grid]")
                    .data("kendoGrid")
                    .refresh();
                }
              }
            }
          }
        });
      },
  
      cssFullHeight: function(ele){
        // Resizing the .appui-full-height containers
        return ele.each(function(i, cont){
          /** @var jQuery $p */
          var $p = $(cont),
              allFH = $(cont).children(".appui-full-height:visible");
          if ( allFH.length ){
            if ( $p.css("overflow") === 'auto' ){
              $p.css("overflow", "hidden");
            }
            var $$ = $p.children(".appui-full-height:visible:first"),
                h = $p.height(),
                siblings = $$.siblings(),
                siblingsFH = siblings.filter(".appui-full-height"),
                num = allFH.not(".appui-full-width").length;
            if ( $p[0] === document.body ){
              h = window.appui ? window.appui.env.height : $(window).height();
            }
  
            // Calculating the space left by the siblings within the container
            // Excepting the ones with absolute positioning
  
            siblings.each(function(){
              var h2, $t = $(this);
              if ( !$t.hasClass("appui-full-height") &&
                $t.is(":visible") &&
                !$t.hasClass("appui-full-width") &&
                ($t.css('position') !== 'absolute') &&
                ($t.css('position') !== 'fixed') &&
                ($t.css('display') !== 'inline')
              ){
                h2 = $t.outerHeight(true);
                if ( h2 ){
                  h -= h2;
                }
              }
            });
            if ( num && (h > 0) ){
              if ( num > 1 ){
                $.each(siblingsFH, function(){
                  var $t = $(this);
                  h -= $t.outerHeight(true) - $t.outerHeight();
                });
              }
              if ( siblingsFH.length ){
                siblingsFH.outerHeight(h/num);
              }
              $$.outerHeight(h/num);
            }
          }
        });
      },
  
      cssForm: function(ele){
        // Now taking care of each $fieldParents for resizing form's elements
        return ele.each(function (i, fpar) {
          var $fpar = $(fpar),
              isOverflow = true,
              // Final width of the labels
              w = 0,
              w1,
              w2,
              total = 0,
              $lbl,
              $hiddenEle,
              center = false,
              space = false,
              // Puts/adds elements with class appui-elem-hidden (so hidden) in the object $hiddenChildren and removes the class to show them
              $hiddenChildren = $hiddenChildren ?
                $hiddenChildren.add($fpar.children(".appui-elem-hidden").removeClass("appui-elem-hidden")) : $fpar.children(".appui-elem-hidden").removeClass("appui-elem-hidden"),
              // Each element with class appui-form-label
              $lbls = $fpar.children(".appui-form-label");
          $lbls.each(function () {
            $lbl = $(this);
            // Defining appuiIsDone to check if the original width has been picked
            if (!$lbl.data("appuiIsDone")) {
              $lbl.data("appuiIsDone", 1);
              if (parseInt($lbl.get(0).style.width) > 0) {
                if ( w < parseInt($lbl.get(0).style.width) ) {
                  w = parseInt($lbl.get(0).style.width);
                }
                $lbl.data("appuiOriginalWidth", w);
              }
            }
            // Picking the original width if has been originally defined
            else if ($lbl.data("appuiOriginalWidth")) {
              if ( w < $lbl.data("appuiOriginalWidth") ){
                w = $lbl.data("appuiOriginalWidth");
              }
            }
          });
          $lbls.each(function () {
            $lbl = $(this);
            // checking if a parent is hidden and adds it to $hiddenEle, and shows it
            if ($lbl.parents(":hidden").length > 0) {
              $($lbl.parents(":hidden").get().reverse()).each(function () {
                if (!$(this).is(":visible")) {
                  $hiddenEle = $hiddenEle ?
                    $hiddenEle.add($(this).show()) : $(this).show();
                }
              });
            }
            // space is the total dimension of the paddings and margins of both label and field elements
            // It is calculated only for the first element
            if (!space) {
              // Corresponding field object for this label
              var $fld = $lbl.nextUntil(".appui-form-label", ".appui-form-field");
              space = ( $lbl.outerWidth(true) - $lbl.width() ) + ( $fld.outerWidth(true) - $fld.width() );
            }
            // centered elements
            if ($lbl.hasClass("appui-c")) {
              center = 1;
            }
            // Removing the width to get the "natural" width
            $lbl.css("width", "auto");
            // w2 is the natural width, we assign it a minimal width if none is found
            w2 = $lbl.width() || 20;
            // If the natural width is larger than the current final width, final width takes its value
            if (w2 > w) {
              w = w2;
            }
          });
    
          if (w > 0) {
            if ($fpar.children(".appui-form-full:visible:first").length) {
              total = $fpar.children(".appui-form-full:visible:first").width() - 1;
            }
            else {
              total = false;
              for (var $par = $fpar; !total; $par = $par.parent()) {
                total = $par.width() - 1;
                isOverflow = $par.css("overflow") === "auto";
              }
            }
            if ( isOverflow ){
              total -= 25;
            }
      
            if (total > ( 25 + space )) {
              total -= space;
              if (center) {
                w1 = total/2;
                w = w1;
              }
              else {
                w1 = total - w;
              }
              $fpar.children(".appui-form-label").each(function () {
                var $l = $(this);
                $l.width(w);
                if (center) {
                  $l.css("text-align", "right");
                }
                var $f = $l.nextUntil(".appui-form-label", ".appui-form-field");
                if ($f.length === 0) {
                  $f = $l.nextAll("a:first").find(".appui-form-field");
                }
                if ($f.length) {
                  $l.css("minHeight", $f.height());
                  $f.each(function () {
                    var $$ = $(this),
                        t = $f.prop("tagName");
                    if (t.toLowerCase() === 'div' || t.toLowerCase() === 'textarea') {
                      $$.css("width", w1 + "px");
                    }
                    else {
                      $$.css("max-width", w1 + "px");
                    }
                  });
                }
                else{
                  $l.css("minHeight", null);
                }
              });
            }
            if ($hiddenChildren) {
              $hiddenChildren.addClass("appui-elem-hidden");
              $hiddenChildren = false;
            }
          }
          if ($hiddenEle) {
            $hiddenEle.hide();
            $hiddenEle = false;
          }
        });
      },
      
      cssMason: function(ele){
        if ( $.isFunction($.fn.masonry) ){
          return ele.each(function(){
            var $ele = $(this),
                actualWidth = $ele.width(),
                $widgets = $ele.children(".appui-widget:visible:not(.appui-widget_full)");
            if ( $widgets.length ){
              var w;
              if ( actualWidth < 800 ) {
                w = "99.5%";
              }
              else if ( actualWidth < 1150 ) {
                w = "49.5%";
              }
              else if ( actualWidth < 1550 ) {
                w = "32.8%";
              }
              else {
                w = "24.5%";
              }
              $widgets.css({width: w});
              $ele.masonry({
                itemSelector: '.appui-widget',
                transitionDuration: 0,
                isInitLayout: true
              });
            }
          })
        }
      },
      
      setInitialValues: function(ele, force){
        // Keeping the original values in a data attached to the element
        $(":input[name]:not(.appui-no)", ele).each(function(){
          var $$ = $(this),
              v;
          if ( force || ($$.data("appuiOriginalValue") === undefined) ){
            v = appui.fn.fieldValue(this);
            if ( v !== undefined ){
              $$.data("appuiOriginalValue", v === undefined ? "" : v);
            }
          }
        });
      },
  
      analyzeContent: function(ele, force){
        if ( !ele ){
          ele = $(document.body);
        }
        return ele.each(function(){
          var ele = this,
              $ele = $(ele),
              nodes = [];
          if ( force ){
            $ele
              .add($ele.find(".appui-sensor"))
              .filter(".appui-sensor")
              .each(function(){
                var $$ = $(this);
                $$.unbind("resize")
                  .removeClass("appui-sensor")
                  .removeData("appuiFullHeight appuiFullWidth appuiForm appuiMasonry");
              });
          }
          
          // In case we have data bindings we leave a bit of time before setting initial values
          setTimeout(function(){
            appui.fn.setInitialValues(ele);
          }, 200);
  
          $ele
            .add($(".appui-full-width", ele))
            .filter(".appui-full-width")
            .not(".appui-sensor > .appui-full-width")
            .each(function(){
              $(this.parentNode).data("appuiFullWidth", 1);
              if ( $.inArray(this.parentNode, nodes) === -1 ){
                nodes.push(this.parentNode);
              }
            });
  
          $ele
            .add($(".appui-full-height", ele))
            .filter(".appui-full-height")
            .not(".appui-sensor > .appui-full-height")
            .each(function(){
              $(this.parentNode).data("appuiFullHeight", 1);
              if ( $.inArray(this.parentNode, nodes) === -1 ){
                nodes.push(this.parentNode);
              }
            });
  
          $ele
            .find(".appui-form-label")
            .not(".appui-sensor > .appui-form-label")
            .each(function(){
              $(this.parentNode).data("appuiForm", 1);
              if ( $.inArray(this.parentNode, nodes) === -1 ){
                nodes.push(this.parentNode);
              }
            });
  
          $ele
            .add($(".appui-masonry", ele))
            .filter(".appui-masonry")
            .not(".appui-sensor > .appui-masonry")
            .each(function(){
              $(this).data("appuiMasonry", 1);
              if ( $.inArray(this, nodes) === -1 ){
                nodes.push(this);
              }
            });
  
          $.each(nodes, function(i, o){
            var $o = $(o);
            if ( !$o.hasClass("appui-sensor") ){
              $o.addClass("appui-sensor").resize(function(){
                appui.fn.redraw($o);
              });
            }
            appui.fn.redraw($o);
          });
        });
      },
      
      redraw: function(eles, all){
        if ( !eles ){
          eles = $(".appui-sensor:visible");
        }
        else if ( all ){
          eles = eles.add(eles.find(".appui-sensor:visible")).filter(".appui-sensor:visible");
        }
        eles.filter(":visible").each(function(i, ele){
          var $ele = $(ele);
          if ( $ele.data("appuiFullWidth") ){
            appui.fn.cssFullWidth($ele)
          }
          if ( $ele.data("appuiFullHeight") ){
            appui.fn.cssFullHeight($ele)
          }
          if ( $ele.data("appuiMasonry") ){
            appui.fn.cssMason($ele)
          }
          if ( $ele.data("appuiForm") ){
            appui.fn.cssForm($ele)
          }
        });
      },

      /* Onload functions: keep the var screen width and height up-to-date and binds history if enabled */
      init: function(cfg){
        var o, p, parts;
        if ( appui && !appui.env.isInit ){
          appui.env.width = $window.width();
          appui.env.height = $window.height();
          appui.env.root = $("head base").length > 0 ? $("head base").attr("href") : appui.env.host;
          /* The server's path (difference between the host and the current dir */
          appui.env.path = appui.env.url.substr(appui.env.root.length);
          parts = appui.env.path.split("/");
          $.each(parts, function(i, v) {
            v = decodeURI(v.trim());
            if (v !== "") {
              appui.env.params.push(v);
            }
          });
          if (typeof (cfg) === 'object') {
            $.extend(true, window.appui, cfg);
          }
          $(window.document).on("focus", "*", function(e){
            appui.env.focused = $(e.target);
            appui.env.last_focus = new Date().getMilliseconds();
          }).on("click", "a:not(.appui-no)", function(e) {
            if (this.href && !this.getAttribute("target") && window.Modernizr.history) {
              appui.fn.link(this.href, e);
              return false;
            }
          }).on("submit", "form:not(.appui-no)", function(e) {
            appui.fn.submit(this, e);
          }).keyup(function(e){
            if ( (e.key === 'Esc') || (e.key === 'Escape') ){
              appui.fn.closePopup();
            }
          });

          $window.resize(function() {
            appui.fn.resize();
          });

          if (appui.fn.history) {
            appui.fn.history.clearAllIntervals();
            //window.localStorage.clear();
            //window.sessionStorage.clear();
            window.onpopstate = function(e) {
              if ( e.state !== undefined ){
                var state = appui.fn.history.getState();
                if ( appui.fn.defaultHistoryFunction(state) ){
                  appui.fn.link(state.url.substr(appui.env.root.length), $.extend({title: state.title}, state.data));
                }
                else{
                  if ( $.isFunction(state.data.script) ){
                    state.data.script();
                  }
                }
              }
              return false;
            };
          }
          appui.env.isInit = true;
        }
        // Kendo adaptations
        if ( window.kendo !== undefined ) {

          var kendo = window.kendo,
            ui = kendo.ui,
            fn;

          fn = kendo.ui.DropDownList.prototype.open;
          kendo.ui.DropDownList.prototype.open = function () {
            var res = fn.apply(this, arguments);
            var w = this.list.width();
            this.list.width("auto");
            var w2 = this.list.width();
            if (w2 < w) {
              this.list.width(w);
            }
            return res;
          };
          fn = kendo.ui.ComboBox.prototype.open;
          kendo.ui.ComboBox.prototype.open = function () {
            var res = fn.apply(this, arguments);
            var w = this.list.width();
            this.list.width("auto");
            var w2 = this.list.width();
            if (w2 < w) {
              this.list.width(w);
            }
            return res;
          };

          var dropDownTreeView = ui.Widget.extend({
            _uid: null,
            _selId: null,
            _treeview: null,
            _dropdown: null,

            init: function(element, options) {
              var that = this,
                isInput = element.tagName.toLowerCase() === "input";

              ui.Widget.fn.init.call(that, element, options);

              that._uid = new Date().getTime();

              var classes = $(element).attr("class");
              var of = $(element).css("overflow");
              var mh = $(element).css("max-height");
              var of = $(element).css("overflow");
              var w = $(element).width() - 24;
              var additionalStyle = "";
              var container = $(element);
              if (of && mh) {
                additionalStyle = kendo.format("max-height:{0};overflow:{1};", mh, of);
              }
              if ( w ){
                additionalStyle += kendo.format("width:{0};", w);
              }
              if ( isInput ){
                container = $(kendo.format('<div class="{0}" style="{1}"/>', classes, additionalStyle));
                $(element).hide().after(container);
              }
              var treeID = 'extTreeView' + that._uid;
              container.append(kendo.format("<input id='extDropDown{0}' class='k-ext-dropdown {1}'/>", that._uid, classes));
              container.append(kendo.format("<div id='{0}' class='k-ext-treeview' style='z-index:1;{1}'/>", treeID, additionalStyle));

              var $treeviewRootElem,
                $dropdownRootElem,
                ds = [];
              if ( inputVal ){
                ds.push({
                  text: inputVal,
                  value: inputVal
                });
              }

              var ddCfg = {
                dataSource: [],
                dataTextField: "text",
                dataValueField: "value",
                open: function(e) {
                  //to prevent the dropdown from opening or closing. A bug was found when clicking on the dropdown to
                  //"close" it. The default dropdown was visible after the treeview had closed.
                  e.preventDefault();
                  // If the treeview is not visible, then make it visible.
                  if (!$treeviewRootElem.hasClass("k-custom-visible")) {
                    // Position the treeview so that it is below the dropdown.
                    $treeviewRootElem.css({
                      "top": $dropdownRootElem.position().top + $dropdownRootElem.height(),
                      "left": $dropdownRootElem.position().left
                    });
                    // Display the treeview.
                    $treeviewRootElem.slideToggle("fast", function() {
                      that._dropdown.close();
                      $treeviewRootElem.addClass("k-custom-visible");
                    });
                  }
                  if (that._selId) {
                    that._treeview.expandTo(that._selId);
                    var ddVal = $dropdownRootElem.find("span.k-input").text();
                    var selectedNode = that._treeview.findByText(ddVal);
                    that._treeview.select(selectedNode);
                  }
                  var list = $("#" + treeID);
                  var width = list.width();
                  list.width("auto");
                  var width2 = list.width();
                  var width3 = $dropdownRootElem.width() + 22;
                  if ( width3 > width2 ){
                    list.width(width3);
                  }
                  else if ( width2 > width ){
                    list.css({width: width2});
                  }
                  else {
                    list.width(width);
                  }
                }
              };
              if ( options.optionLabel ){
                ddCfg.optionLabel = options.optionLabel;
              }
              if ( options.change ){
                ddCfg.change = options.change;
              }
              if ( options.select ){
                ddCfg.select = options.select;
              }

              // Create the dropdown.
              that._dropdown = $(kendo.format("#extDropDown{0}", that._uid)).kendoDropDownList(ddCfg).data("kendoDropDownList");

              if (options.dropDownWidth) {
                that._dropdown._inputWrapper.width(options.dropDownWidth);
              }
              else if ( w ){
                that._dropdown._inputWrapper.css({width: w}).parent().css({width: w});
              }

              $dropdownRootElem = $(that._dropdown.element).closest("span.k-dropdown"); // Create the treeview.
              that._treeview = $(kendo.format("#extTreeView{0}", that._uid)).kendoTreeView(options.treeview).data("kendoTreeView");
              that._treeview.bind("select", function(e) {
                //appui.fn.log("SELECT", e);
                // When a node is selected, display the text for the node in the dropdown and hide the treeview.
                $dropdownRootElem.find("span.k-input").text($(e.node).children("div").text());
                $treeviewRootElem.slideToggle("fast", function() {
                  that._selId = $("#extTreeView" + that._uid).data("kendoTreeView").dataItem(e.node).id;
                  $treeviewRootElem.removeClass("k-custom-visible");
                  that.trigger("select", e);
                });
              });

              $treeviewRootElem = $(that._treeview.element).closest("div.k-treeview"); // Hide the treeview.
              $treeviewRootElem
                .width($dropdownRootElem.width() - 2)
                .css({
                  "border": "1px solid #ccc",
                  "display": "none",
                  "position": "absolute",
                  "background-color": that._dropdown.list.css("background-color")
                });
              var inputVal = that.element.val();
              if ( inputVal ){
                that.value(inputVal);
              }
              $(document).click(function(e) {
                // Ignore clicks on the treetriew.
                if ($(e.target).closest("div.k-treeview").length === 0) {
                  // If visible, then close the treeview.
                  if ($treeviewRootElem.hasClass("k-custom-visible")) {
                    $treeviewRootElem.slideToggle("fast", function() {
                      $treeviewRootElem.removeClass("k-custom-visible");
                    });
                  }
                }
              });
            },

            value: function (value) {
              if (value !== undefined) {
                var that = this,
                  dataItem = that._treeview.dataSource.get(value),
                  item = that._treeview.findByUid(dataItem.uid),
                  $dropdownRootElem = $(that._dropdown.element).closest("span.k-dropdown");
                that._dropdown.value(value);
                $dropdownRootElem.find("span.k-input").text($(item).children("div").text());
                that._selId = value;
                return this.element.val(value);
              }
              else {
                return this.element.val();
              }
            },

            dropDownList: function() {
              return this._dropdown;
            },

            treeview: function() {
              return this._treeview;
            },

            options: {
              name: "DropDownTreeView"
            }
          });
          ui.plugin(dropDownTreeView);

        }
      }
    },
  };
})(jQuery);