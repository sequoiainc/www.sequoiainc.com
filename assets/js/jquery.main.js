---
---

jQuery.noConflict();
// page init
jQuery(function($){
  initFancyBox();
  initRandomImages();
  $('#layout-header_nav').okayNav();

  // $(".layout-logo").hover(
  //   function() {
  //     $(this).css("background-image", "url({{site.baseurl}}/assets/images/main-logo-swing.gif)");
  //   },
  //   function() {
  //     $(this).css("background-image", "url({{site.baseurl}}/assets/images/main-logo-static.gif)");
  //   }
  // );
});

/*!
 * based on jquery.okayNav.js 2.0.1 (https://github.com/VPenkov/okayNav)
 * Author: Vergil Penkov (http://vergilpenkov.com/)
 * MIT license: https://opensource.org/licenses/MIT
 */

;(function($, window, document, undefined) {

  // Defaults
  var okayNav = 'okayNav',
    defaults = {
      parent: '', // will call nav's parent() by default
      toggle_icon_class: 'okayNav__menu-toggle',
      toggle_icon_content: '<span /><span /><span />',
      align_right: true, // If false, the menu and the kebab icon will be on the left
      resize_delay: 10 // When resizing the window, okayNav can throttle its recalculations if enabled. Setting this to 50-250 will improve performance but make okayNav less accurate.
    };

  // Begin
  function Plugin(element, options) {
    self = this;
    this.options = $.extend({}, defaults, options);
    _options = this.options;

    $navigation = $(element);
    $document = $(document);
    $window = $(window);

    this.options.parent == '' ? this.options.parent = $navigation.parent() : '';

    _nav_visible = false; // Store the state of the hidden nav
    _nav_full_width = 0;
    _parent_full_width = 0;

    self.init();
  }

  Plugin.prototype = {

    init: function() {

      $('body').addClass('okayNav-loaded');

      // Add classes
      $navigation
        .addClass('okayNav loaded')
        .children('ul').addClass('okayNav__nav--visible');

      // Append elements
      if (self.options.align_right) {
        $navigation
          .append('<ul class="okayNav__nav--invisible transition-enabled nav-right" />')
          .append('<a href="#" class="' + _options.toggle_icon_class + ' okay-invisible">' + _options.toggle_icon_content + '</a>')
      } else {
        $navigation
          .prepend('<ul class="okayNav__nav--invisible transition-enabled nav-left" />')
          .prepend('<a href="#" class="' + _options.toggle_icon_class + ' okay-invisible">' + _options.toggle_icon_content + '</a>')
      }

      // Cache new elements for further use
      $nav_visible = $navigation.children('.okayNav__nav--visible');
      $nav_invisible = $navigation.children('.okayNav__nav--invisible');
      $nav_toggle_icon = $navigation.children('.' + _options.toggle_icon_class);

      _toggle_icon_width = $nav_toggle_icon.outerWidth(true);
      _nav_default_width = self.getChildrenWidth($navigation);
      _parent_full_width = $(_options.parent).outerWidth(true);
      _last_visible_child_width = 0; // We'll define this later

      // Events are up once everything is set
      self.initEvents();
    },

    initEvents: function() {
      // Toggle hidden nav when hamburger icon is clicked and
      // Collapse hidden nav on click outside the header
      $document.on('click.okayNav', function(e) {
        var _target = $(e.target);

        if (_nav_visible === true && _target.closest('.okayNav').length == 0)
          self.closeInvisibleNav();

        if (_target.hasClass(_options.toggle_icon_class)) {
          e.preventDefault();
          self.toggleInvisibleNav();
        }
      });

      var optimizeResize = self._debounce(function(){self.recalcNav()}, _options.recalc_delay);
      $window.on('load.okayNav resize.okayNav', optimizeResize);
    },

    /*
     * A few methods to allow working with elements
     */
    getParent: function() {
      return _options.parent;
    },

    getVisibleNav: function() { // Visible navigation
      return $nav_visible;
    },

    getInvisibleNav: function() { // Hidden behind the kebab icon
      return $nav_invisible;
    },

    getNavToggleIcon: function() { // Kebab icon
      return $nav_toggle_icon;
    },

    /*
     * Operations
     */
    _debounce: function(func, wait, immediate) {
      var timeout;
      return function() {
        var context = this, args = arguments;
        var later = function() {
          timeout = null;
          if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
      };
    },

    openInvisibleNav: function() {
      $nav_toggle_icon.addClass('icon--active');
      $nav_invisible.addClass('nav-open');
      _nav_visible = true;
      $nav_invisible.css({
        '-webkit-transform': 'translateX(0%)',
        'transform': 'translateX(0%)'
      });
    },

    closeInvisibleNav: function() {
      $nav_toggle_icon.removeClass('icon--active');
      $nav_invisible.removeClass('nav-open');

      if (self.options.align_right) {
        $nav_invisible.css({
          '-webkit-transform': 'translateX(100%)',
          'transform': 'translateX(100%)'
        });
      } else {
        $nav_invisible.css({
          '-webkit-transform': 'translateX(-100%)',
          'transform': 'translateX(-100%)'
        });
      }
      _nav_visible = false;
    },

    toggleInvisibleNav: function() {
      if (!_nav_visible) {
        self.openInvisibleNav();
      } else {
        self.closeInvisibleNav();
      }
    },

    /*
     * Math stuff
     */
    getChildrenWidth: function(el) {
      var children_width = 0;
      var children = $(el).children();

      for (var i = 0; i < children.length; i++) {
        children_width += $(children[i]).outerWidth(true);
      };

      return children_width;
    },

    getVisibleItemCount: function() {
      return $('li', $nav_visible).length;
    },
    getHiddenItemCount: function() {
      return $('li', $nav_invisible).length;
    },

    recalcNav: function() {
      var wrapper_width = $(_options.parent).outerWidth(true),
        space_taken = self.getChildrenWidth($nav_visible),
        nav_full_width = $navigation.outerWidth(true),
        visible_nav_items = self.getVisibleItemCount(),
        collapse_width = $nav_visible.outerWidth(true) + _toggle_icon_width,
        expand_width = space_taken + _last_visible_child_width + _toggle_icon_width,
        expandAll_width = _nav_default_width;

      if (wrapper_width > expandAll_width) {
        self._expandAllItems();
        $nav_toggle_icon.addClass('okay-invisible');
        return;
      }

      if (visible_nav_items > 0 &&
        nav_full_width <= collapse_width &&
        wrapper_width <= expand_width) {
        self._collapseNavItem();
      }

      if (wrapper_width > expand_width + _toggle_icon_width) {
        self._expandNavItem();
      }

      $nav_invisible.css('height', 48 * self.getHiddenItemCount());

      // Hide the kebab icon if no items are hidden
      self.getHiddenItemCount() == 0 ?
        $nav_toggle_icon.addClass('okay-invisible') :
        $nav_toggle_icon.removeClass('okay-invisible');
    },

    _collapseNavItem: function() {
      var $last_child = $('li:last-child', $nav_visible);
      _last_visible_child_width = $last_child.outerWidth(true);
      $document.trigger('okayNav:collapseItem', $last_child);
      $last_child.detach().prependTo($nav_invisible);
      // All nav items are visible by default
      // so we only need recursion when collapsing

      self.recalcNav();
    },

    _expandNavItem: function() {
      var $first = $('li:first-child', $nav_invisible);
      $document.trigger('okayNav:expandItem', $first);
      $first.detach().appendTo($nav_visible);
    },

    _expandAllItems: function() {
      $('li', $nav_invisible).detach().appendTo($nav_visible);
    },

    _collapseAllItems: function() {
      $('li', $nav_visible).detach().appendTo($nav_invisible);
    },

    destroy: function() {
      $('li', $nav_invisible).appendTo($nav_visible);
      $nav_invisible.remove();
      $nav_visible.removeClass('okayNav__nav--visible');
      $nav_toggle_icon.remove();

      $document.unbind('.okayNav');
      $window.unbind('.okayNav');
    }

  }

  // Plugin wrapper
  $.fn[okayNav] = function(options) {
    var args = arguments;

    if (options === undefined || typeof options === 'object') {
      return this.each(function() {
        if (!$.data(this, 'plugin_' + okayNav)) {
          $.data(this, 'plugin_' + okayNav, new Plugin(this, options));
        }
      });

    } else if (typeof options === 'string' && options[0] !== '_' && options !== 'init') {

      var returns;
      this.each(function() {
        var instance = $.data(this, 'plugin_' + okayNav);
        if (instance instanceof Plugin && typeof instance[options] === 'function') {
          returns = instance[options].apply(instance, Array.prototype.slice.call(args, 1));
        }

        if (options === 'destroy') {
          $.data(this, 'plugin_' + okayNav, null);
        }
      });

      return returns !== undefined ? returns : this;
    }
  };

}(jQuery, window, document));

//random images init
function initRandomImages(){
  jQuery('.random img').randomBox({
    type: 'random'
  });
  jQuery('.random2 img').randomBox({
    type: 'random'
  });
}

//fancy box init
function initFancyBox(){
  jQuery('.btn-play').click(function() {
    jQuery.fancybox({
        padding: 10,
        autoScale: false,
        transitionIn: 'fade',
        transitionOut: 'fade',
        centerOnScroll: 'true',
        speedIn:300,
        speedOut:300,
        title: this.title,
        width: 680,
        hideOnOverlayClick: true,
        height: 495,
        href: this.href.replace(new RegExp("watch\\?v=", "i"), 'v/'),
        type: 'swf',
        swf: {
          wmode: 'transparent',
          allowfullscreen: 'true'
        }
      });
    return false;
  });
}

//jQuery RandomBox plugin
;(function(jQuery){
  jQuery.fn.randomBox = function(o) {
    var options = jQuery.extend({
      type: 'random'
    },o);

    // show random block
    if(options.type === 'random') {
      var randomIndex = getRandomInt(0, this.length - 1);
      this.hide().eq(randomIndex).show();
    }
    // randomly sort blocks
    else {
      var holder = this.parent();
      var elements = this;
      var elementsCount = elements.length;
      if (elementsCount > 1) {
        elements.remove();
        var indices = [];
        for (i = 0; i < elementsCount; i++) {
          indices[indices.length] = i;
        }
        indices = indices.sort(getRandomOrd);
        jQuery(indices).each(function(j,k) {
          holder.append(elements.eq(k));
        });
      }
    }
    return this;
  }
  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  function getRandomOrd() {
    return(Math.round(Math.random())-0.5);
  }
}(jQuery));

// mobile browsers detect
browserPlatform = {
  platforms: [
    { uaString:['symbian','midp'], cssFile:'symbian.css' }, // Symbian phones
    { uaString:['opera','mobi'], cssFile:'opera.css' }, // Opera Mobile
    { uaString:['msie','ppc'], cssFile:'ieppc.css' }, // IE Mobile <6
    { uaString:'iemobile', cssFile:'iemobile.css' }, // IE Mobile 6+
    { uaString:'webos', cssFile:'webos.css' }, // Palm WebOS
    { uaString:'Android', cssFile:'android.css' }, // Android
    { uaString:['BlackBerry','/6.0','mobi'], cssFile:'blackberry.css' },  // Blackberry 6
    { uaString:['BlackBerry','/7.0','mobi'], cssFile:'blackberry.css' },  // Blackberry 7+
    { uaString:'ipad', cssFile:'ipad.css' }, // iPad
    { uaString:['safari','mobi'], cssFile:'safari.css' } // iPhone and other webkit browsers
  ],
  options: {
    cssPath:'css/',
    mobileCSS:'allmobile.css'
  },
  init:function(){
    this.checkMobile();
    this.parsePlatforms();
    return this;
  },
  checkMobile: function() {
    if(this.uaMatch('mobi') || this.uaMatch('midp') || this.uaMatch('ppc') || this.uaMatch('webos')) {
      this.attachStyles({cssFile:this.options.mobileCSS});
    }
  },
  parsePlatforms: function() {
    for(var i = 0; i < this.platforms.length; i++) {
      if(typeof this.platforms[i].uaString === 'string') {
        if(this.uaMatch(this.platforms[i].uaString)) {
          this.attachStyles(this.platforms[i]);
          break;
        }
      } else {
        for(var j = 0, allMatch = true; j < this.platforms[i].uaString.length; j++) {
          if(!this.uaMatch(this.platforms[i].uaString[j])) {
            allMatch = false;
          }
        }
        if(allMatch) {
          this.attachStyles(this.platforms[i]);
          break;
        }
      }
    }
  },
  attachStyles: function(platform) {
    var head = document.getElementsByTagName('head')[0], fragment;
    var cssText = '<link rel="stylesheet" href="' + this.options.cssPath + platform.cssFile + '" type="text/css"/>';
    var miscText = platform.miscHead;
    if(platform.cssFile) {
      if(document.body) {
        fragment = document.createElement('div');
        fragment.innerHTML = cssText;
        head.appendChild(fragment.childNodes[0]);
      } else {
        document.write(cssText);
      }
    }
    if(platform.miscHead) {
      if(document.body) {
        fragment = document.createElement('div');
        fragment.innerHTML = miscText;
        head.appendChild(fragment.childNodes[0]);
      } else {
        document.write(miscText);
      }
    }
  },
  uaMatch:function(str) {
    if(!this.ua) {
      this.ua = navigator.userAgent.toLowerCase();
    }
    return this.ua.indexOf(str.toLowerCase()) != -1;
  }
}.init();

/*
 * FancyBox - jQuery Plugin
 * Simple and fancy lightbox alternative
 *
 * Examples and documentation at: http://fancybox.net
 *
 * Copyright (c) 2008 - 2010 Janis Skarnelis
 * That said, it is hardly a one-person project. Many people have submitted bugs, code, and offered their advice freely. Their support is greatly appreciated.
 *
 * Version: 1.3.4 (11/11/2010)
 * Requires: jQuery v1.3+
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 */

;(function(jQuery) {
  var tmp, loading, overlay, wrap, outer, content, close, title, nav_left, nav_right,

    selectedIndex = 0, selectedOpts = {}, selectedArray = [], currentIndex = 0, currentOpts = {}, currentArray = [],

    ajaxLoader = null, imgPreloader = new Image(), imgRegExp = /\.(jpg|gif|png|bmp|jpeg)(.*)?jQuery/i, swfRegExp = /[^\.]\.(swf)\s*$/i,

    loadingTimer, loadingFrame = 1,

    titleHeight = 0, titleStr = '', start_pos, final_pos, busy = false, fx = jQuery.extend(jQuery('<div/>')[0], { prop: 0 }),

    isIE6 = jQuery.browser.msie && jQuery.browser.version < 7 && !window.XMLHttpRequest,

    /*
     * Private methods
     */

    _abort = function() {
      loading.hide();

      imgPreloader.onerror = imgPreloader.onload = null;

      if (ajaxLoader) {
        ajaxLoader.abort();
      }

      tmp.empty();
    },

    _error = function() {
      if (false === selectedOpts.onError(selectedArray, selectedIndex, selectedOpts)) {
        loading.hide();
        busy = false;
        return;
      }

      selectedOpts.titleShow = false;

      selectedOpts.width = 'auto';
      selectedOpts.height = 'auto';

      tmp.html( '<p id="fancybox-error">The requested content cannot be loaded.<br />Please try again later.</p>' );

      _process_inline();
    },

    _start = function() {
      var obj = selectedArray[ selectedIndex ],
        href,
        type,
        title,
        str,
        emb,
        ret;

      _abort();

      selectedOpts = jQuery.extend({}, jQuery.fn.fancybox.defaults, (typeof jQuery(obj).data('fancybox') == 'undefined' ? selectedOpts : jQuery(obj).data('fancybox')));

      ret = selectedOpts.onStart(selectedArray, selectedIndex, selectedOpts);

      if (ret === false) {
        busy = false;
        return;
      } else if (typeof ret == 'object') {
        selectedOpts = jQuery.extend(selectedOpts, ret);
      }

      title = selectedOpts.title || (obj.nodeName ? jQuery(obj).attr('title') : obj.title) || '';

      if (obj.nodeName && !selectedOpts.orig) {
        selectedOpts.orig = jQuery(obj).children("img:first").length ? jQuery(obj).children("img:first") : jQuery(obj);
      }

      if (title === '' && selectedOpts.orig && selectedOpts.titleFromAlt) {
        title = selectedOpts.orig.attr('alt');
      }

      href = selectedOpts.href || (obj.nodeName ? jQuery(obj).attr('href') : obj.href) || null;

      if ((/^(?:javascript)/i).test(href) || href == '#') {
        href = null;
      }

      if (selectedOpts.type) {
        type = selectedOpts.type;

        if (!href) {
          href = selectedOpts.content;
        }

      } else if (selectedOpts.content) {
        type = 'html';

      } else if (href) {
        if (href.match(imgRegExp)) {
          type = 'image';

        } else if (href.match(swfRegExp)) {
          type = 'swf';

        } else if (jQuery(obj).hasClass("iframe")) {
          type = 'iframe';

        } else if (href.indexOf("#") === 0) {
          type = 'inline';

        } else {
          type = 'ajax';
        }
      }

      if (!type) {
        _error();
        return;
      }

      if (type == 'inline') {
        obj = href.substr(href.indexOf("#"));
        type = jQuery(obj).length > 0 ? 'inline' : 'ajax';
      }

      selectedOpts.type = type;
      selectedOpts.href = href;
      selectedOpts.title = title;

      if (selectedOpts.autoDimensions) {
        if (selectedOpts.type == 'html' || selectedOpts.type == 'inline' || selectedOpts.type == 'ajax') {
          selectedOpts.width = 'auto';
          selectedOpts.height = 'auto';
        } else {
          selectedOpts.autoDimensions = false;
        }
      }

      if (selectedOpts.modal) {
        selectedOpts.overlayShow = true;
        selectedOpts.hideOnOverlayClick = false;
        selectedOpts.hideOnContentClick = false;
        selectedOpts.enableEscapeButton = false;
        selectedOpts.showCloseButton = false;
      }

      selectedOpts.padding = parseInt(selectedOpts.padding, 10);
      selectedOpts.margin = parseInt(selectedOpts.margin, 10);

      tmp.css('padding', (selectedOpts.padding + selectedOpts.margin));

      jQuery('.fancybox-inline-tmp').unbind('fancybox-cancel').bind('fancybox-change', function() {
        jQuery(this).replaceWith(content.children());
      });

      switch (type) {
        case 'html' :
          tmp.html( selectedOpts.content );
          _process_inline();
        break;

        case 'inline' :
          if ( jQuery(obj).parent().is('#fancybox-content') === true) {
            busy = false;
            return;
          }

          jQuery('<div class="fancybox-inline-tmp" />')
            .hide()
            .insertBefore( jQuery(obj) )
            .bind('fancybox-cleanup', function() {
              jQuery(this).replaceWith(content.children());
            }).bind('fancybox-cancel', function() {
              jQuery(this).replaceWith(tmp.children());
            });

          jQuery(obj).appendTo(tmp);

          _process_inline();
        break;

        case 'image':
          busy = false;

          jQuery.fancybox.showActivity();

          imgPreloader = new Image();

          imgPreloader.onerror = function() {
            _error();
          };

          imgPreloader.onload = function() {
            busy = true;

            imgPreloader.onerror = imgPreloader.onload = null;

            _process_image();
          };

          imgPreloader.src = href;
        break;

        case 'swf':
          selectedOpts.scrolling = 'no';

          str = '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="' + selectedOpts.width + '" height="' + selectedOpts.height + '"><param name="movie" value="' + href + '"></param>';
          emb = '';

          jQuery.each(selectedOpts.swf, function(name, val) {
            str += '<param name="' + name + '" value="' + val + '"></param>';
            emb += ' ' + name + '="' + val + '"';
          });

          str += '<embed src="' + href + '" type="application/x-shockwave-flash" width="' + selectedOpts.width + '" height="' + selectedOpts.height + '"' + emb + '></embed></object>';

          tmp.html(str);

          _process_inline();
        break;

        case 'ajax':
          busy = false;

          jQuery.fancybox.showActivity();

          selectedOpts.ajax.win = selectedOpts.ajax.success;

          ajaxLoader = jQuery.ajax(jQuery.extend({}, selectedOpts.ajax, {
            url : href,
            data : selectedOpts.ajax.data || {},
            dataType : 'text',
            error : function(XMLHttpRequest, textStatus, errorThrown) {
              if ( XMLHttpRequest.status > 0 ) {
                _error();
              }
            },
            success : function(data, textStatus, XMLHttpRequest) {
              var o = typeof XMLHttpRequest == 'object' ? XMLHttpRequest : ajaxLoader;
              if (o.status == 200 || o.status === 0) {
                if ( typeof selectedOpts.ajax.win == 'function' ) {
                  ret = selectedOpts.ajax.win(href, data, textStatus, XMLHttpRequest);

                  if (ret === false) {
                    loading.hide();
                    return;
                  } else if (typeof ret == 'string' || typeof ret == 'object') {
                    data = ret;
                  }
                }

                tmp.html( data );
                _process_inline();
              }
            }
          }));

        break;

        case 'iframe':
          _show();
        break;
      }
    },

    _process_inline = function() {
      var
        w = selectedOpts.width,
        h = selectedOpts.height;

      if (w.toString().indexOf('%') > -1) {
        w = parseInt( (jQuery(window).width() - (selectedOpts.margin * 2)) * parseFloat(w) / 100, 10) + 'px';

      } else {
        w = w == 'auto' ? 'auto' : w + 'px';
      }

      if (h.toString().indexOf('%') > -1) {
        h = parseInt( (jQuery(window).height() - (selectedOpts.margin * 2)) * parseFloat(h) / 100, 10) + 'px';

      } else {
        h = h == 'auto' ? 'auto' : h + 'px';
      }

      tmp.wrapInner('<div style="width:' + w + ';height:' + h + ';overflow: ' + (selectedOpts.scrolling == 'auto' ? 'auto' : (selectedOpts.scrolling == 'yes' ? 'scroll' : 'hidden')) + ';position:relative;"></div>');

      selectedOpts.width = tmp.width();
      selectedOpts.height = tmp.height();

      _show();
    },

    _process_image = function() {
      selectedOpts.width = imgPreloader.width;
      selectedOpts.height = imgPreloader.height;

      jQuery("<img />").attr({
        'id' : 'fancybox-img',
        'src' : imgPreloader.src,
        'alt' : selectedOpts.title
      }).appendTo( tmp );

      _show();
    },

    _show = function() {
      var pos, equal;

      loading.hide();

      if (wrap.is(":visible") && false === currentOpts.onCleanup(currentArray, currentIndex, currentOpts)) {
        jQuery.event.trigger('fancybox-cancel');

        busy = false;
        return;
      }

      busy = true;

      jQuery(content.add( overlay )).unbind();

      jQuery(window).unbind("resize.fb scroll.fb");
      jQuery(document).unbind('keydown.fb');

      if (wrap.is(":visible") && currentOpts.titlePosition !== 'outside') {
        wrap.css('height', wrap.height());
      }

      currentArray = selectedArray;
      currentIndex = selectedIndex;
      currentOpts = selectedOpts;

      if (currentOpts.overlayShow) {
        overlay.css({
          'background-color' : currentOpts.overlayColor,
          'opacity' : currentOpts.overlayOpacity,
          'cursor' : currentOpts.hideOnOverlayClick ? 'pointer' : 'auto',
          'height' : jQuery(document).height()
        });

        if (!overlay.is(':visible')) {
          if (isIE6) {
            jQuery('select:not(#fancybox-tmp select)').filter(function() {
              return this.style.visibility !== 'hidden';
            }).css({'visibility' : 'hidden'}).one('fancybox-cleanup', function() {
              this.style.visibility = 'inherit';
            });
          }

          overlay.show();
        }
      } else {
        overlay.hide();
      }

      final_pos = _get_zoom_to();

      _process_title();

      if (wrap.is(":visible")) {
        jQuery( close.add( nav_left ).add( nav_right ) ).hide();

        pos = wrap.position(),

        start_pos = {
          top  : pos.top,
          left : pos.left,
          width : wrap.width(),
          height : wrap.height()
        };

        equal = (start_pos.width == final_pos.width && start_pos.height == final_pos.height);

        content.fadeTo(currentOpts.changeFade, 0.3, function() {
          var finish_resizing = function() {
            content.html( tmp.contents() ).fadeTo(currentOpts.changeFade, 1, _finish);
          };

          jQuery.event.trigger('fancybox-change');

          content
            .empty()
            .removeAttr('filter')
            .css({
              'border-width' : currentOpts.padding,
              'width' : final_pos.width - currentOpts.padding * 2,
              'height' : selectedOpts.autoDimensions ? 'auto' : final_pos.height - titleHeight - currentOpts.padding * 2
            });

          if (equal) {
            finish_resizing();

          } else {
            fx.prop = 0;

            jQuery(fx).animate({prop: 1}, {
               duration : currentOpts.changeSpeed,
               easing : currentOpts.easingChange,
               step : _draw,
               complete : finish_resizing
            });
          }
        });

        return;
      }

      wrap.removeAttr("style");

      content.css('border-width', currentOpts.padding);

      if (currentOpts.transitionIn == 'elastic') {
        start_pos = _get_zoom_from();

        content.html( tmp.contents() );

        wrap.show();

        if (currentOpts.opacity) {
          final_pos.opacity = 0;
        }

        fx.prop = 0;

        jQuery(fx).animate({prop: 1}, {
           duration : currentOpts.speedIn,
           easing : currentOpts.easingIn,
           step : _draw,
           complete : _finish
        });

        return;
      }

      if (currentOpts.titlePosition == 'inside' && titleHeight > 0) {
        title.show();
      }

      content
        .css({
          'width' : final_pos.width - currentOpts.padding * 2,
          'height' : selectedOpts.autoDimensions ? 'auto' : final_pos.height - titleHeight - currentOpts.padding * 2
        })
        .html( tmp.contents() );

      wrap
        .css(final_pos)
        .fadeIn( currentOpts.transitionIn == 'none' ? 0 : currentOpts.speedIn, _finish );
    },

    _format_title = function(title) {
      if (title && title.length) {
        if (currentOpts.titlePosition == 'float') {
          return '<table id="fancybox-title-float-wrap" cellpadding="0" cellspacing="0"><tr><td id="fancybox-title-float-left"></td><td id="fancybox-title-float-main">' + title + '</td><td id="fancybox-title-float-right"></td></tr></table>';
        }

        return '<div id="fancybox-title-' + currentOpts.titlePosition + '">' + title + '</div>';
      }

      return false;
    },

    _process_title = function() {
      titleStr = currentOpts.title || '';
      titleHeight = 0;

      title
        .empty()
        .removeAttr('style')
        .removeClass();

      if (currentOpts.titleShow === false) {
        title.hide();
        return;
      }

      titleStr = jQuery.isFunction(currentOpts.titleFormat) ? currentOpts.titleFormat(titleStr, currentArray, currentIndex, currentOpts) : _format_title(titleStr);

      if (!titleStr || titleStr === '') {
        title.hide();
        return;
      }

      title
        .addClass('fancybox-title-' + currentOpts.titlePosition)
        .html( titleStr )
        .appendTo( 'body' )
        .show();

      switch (currentOpts.titlePosition) {
        case 'inside':
          title
            .css({
              'width' : final_pos.width - (currentOpts.padding * 2),
              'marginLeft' : currentOpts.padding,
              'marginRight' : currentOpts.padding
            });

          titleHeight = title.outerHeight(true);

          title.appendTo( outer );

          final_pos.height += titleHeight;
        break;

        case 'over':
          title
            .css({
              'marginLeft' : currentOpts.padding,
              'width' : final_pos.width - (currentOpts.padding * 2),
              'bottom' : currentOpts.padding
            })
            .appendTo( outer );
        break;

        case 'float':
          title
            .css('left', parseInt((title.width() - final_pos.width - 40)/ 2, 10) * -1)
            .appendTo( wrap );
        break;

        default:
          title
            .css({
              'width' : final_pos.width - (currentOpts.padding * 2),
              'paddingLeft' : currentOpts.padding,
              'paddingRight' : currentOpts.padding
            })
            .appendTo( wrap );
        break;
      }

      title.hide();
    },

    _set_navigation = function() {
      if (currentOpts.enableEscapeButton || currentOpts.enableKeyboardNav) {
        jQuery(document).bind('keydown.fb', function(e) {
          if (e.keyCode == 27 && currentOpts.enableEscapeButton) {
            e.preventDefault();
            jQuery.fancybox.close();

          } else if ((e.keyCode == 37 || e.keyCode == 39) && currentOpts.enableKeyboardNav && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'SELECT') {
            e.preventDefault();
            jQuery.fancybox[ e.keyCode == 37 ? 'prev' : 'next']();
          }
        });
      }

      if (!currentOpts.showNavArrows) {
        nav_left.hide();
        nav_right.hide();
        return;
      }

      if ((currentOpts.cyclic && currentArray.length > 1) || currentIndex !== 0) {
        nav_left.show();
      }

      if ((currentOpts.cyclic && currentArray.length > 1) || currentIndex != (currentArray.length -1)) {
        nav_right.show();
      }
    },

    _finish = function () {
      if (!jQuery.support.opacity) {
        content.get(0).style.removeAttribute('filter');
        wrap.get(0).style.removeAttribute('filter');
      }

      if (selectedOpts.autoDimensions) {
        content.css('height', 'auto');
      }

      wrap.css('height', 'auto');

      if (titleStr && titleStr.length) {
        title.show();
      }

      if (currentOpts.showCloseButton) {
        close.show();
      }

      _set_navigation();

      if (currentOpts.hideOnContentClick) {
        content.bind('click', jQuery.fancybox.close);
      }

      if (currentOpts.hideOnOverlayClick) {
        overlay.bind('click', jQuery.fancybox.close);
      }

      jQuery(window).bind("resize.fb", jQuery.fancybox.resize);

      if (currentOpts.centerOnScroll) {
        jQuery(window).bind("scroll.fb", jQuery.fancybox.center);
      }

      if (currentOpts.type == 'iframe') {
        jQuery('<iframe id="fancybox-frame" name="fancybox-frame' + new Date().getTime() + '" frameborder="0" hspace="0" ' + (jQuery.browser.msie ? 'allowtransparency="true""' : '') + ' scrolling="' + selectedOpts.scrolling + '" src="' + currentOpts.href + '"></iframe>').appendTo(content);
      }

      wrap.show();

      busy = false;

      jQuery.fancybox.center();

      currentOpts.onComplete(currentArray, currentIndex, currentOpts);

      _preload_images();
    },

    _preload_images = function() {
      var href,
        objNext;

      if ((currentArray.length -1) > currentIndex) {
        href = currentArray[ currentIndex + 1 ].href;

        if (typeof href !== 'undefined' && href.match(imgRegExp)) {
          objNext = new Image();
          objNext.src = href;
        }
      }

      if (currentIndex > 0) {
        href = currentArray[ currentIndex - 1 ].href;

        if (typeof href !== 'undefined' && href.match(imgRegExp)) {
          objNext = new Image();
          objNext.src = href;
        }
      }
    },

    _draw = function(pos) {
      var dim = {
        width : parseInt(start_pos.width + (final_pos.width - start_pos.width) * pos, 10),
        height : parseInt(start_pos.height + (final_pos.height - start_pos.height) * pos, 10),

        top : parseInt(start_pos.top + (final_pos.top - start_pos.top) * pos, 10),
        left : parseInt(start_pos.left + (final_pos.left - start_pos.left) * pos, 10)
      };

      if (typeof final_pos.opacity !== 'undefined') {
        dim.opacity = pos < 0.5 ? 0.5 : pos;
      }

      wrap.css(dim);

      content.css({
        'width' : dim.width - currentOpts.padding * 2,
        'height' : dim.height - (titleHeight * pos) - currentOpts.padding * 2
      });
    },

    _get_viewport = function() {
      return [
        jQuery(window).width() - (currentOpts.margin * 2),
        jQuery(window).height() - (currentOpts.margin * 2),
        jQuery(document).scrollLeft() + currentOpts.margin,
        jQuery(document).scrollTop() + currentOpts.margin
      ];
    },

    _get_zoom_to = function () {
      var view = _get_viewport(),
        to = {},
        resize = currentOpts.autoScale,
        double_padding = currentOpts.padding * 2,
        ratio;

      if (currentOpts.width.toString().indexOf('%') > -1) {
        to.width = parseInt((view[0] * parseFloat(currentOpts.width)) / 100, 10);
      } else {
        to.width = currentOpts.width + double_padding;
      }

      if (currentOpts.height.toString().indexOf('%') > -1) {
        to.height = parseInt((view[1] * parseFloat(currentOpts.height)) / 100, 10);
      } else {
        to.height = currentOpts.height + double_padding;
      }

      if (resize && (to.width > view[0] || to.height > view[1])) {
        if (selectedOpts.type == 'image' || selectedOpts.type == 'swf') {
          ratio = (currentOpts.width ) / (currentOpts.height );

          if ((to.width ) > view[0]) {
            to.width = view[0];
            to.height = parseInt(((to.width - double_padding) / ratio) + double_padding, 10);
          }

          if ((to.height) > view[1]) {
            to.height = view[1];
            to.width = parseInt(((to.height - double_padding) * ratio) + double_padding, 10);
          }

        } else {
          to.width = Math.min(to.width, view[0]);
          to.height = Math.min(to.height, view[1]);
        }
      }

      to.top = parseInt(Math.max(view[3] - 20, view[3] + ((view[1] - to.height - 40) * 0.5)), 10);
      to.left = parseInt(Math.max(view[2] - 20, view[2] + ((view[0] - to.width - 40) * 0.5)), 10);

      return to;
    },

    _get_obj_pos = function(obj) {
      var pos = obj.offset();

      pos.top += parseInt( obj.css('paddingTop'), 10 ) || 0;
      pos.left += parseInt( obj.css('paddingLeft'), 10 ) || 0;

      pos.top += parseInt( obj.css('border-top-width'), 10 ) || 0;
      pos.left += parseInt( obj.css('border-left-width'), 10 ) || 0;

      pos.width = obj.width();
      pos.height = obj.height();

      return pos;
    },

    _get_zoom_from = function() {
      var orig = selectedOpts.orig ? jQuery(selectedOpts.orig) : false,
        from = {},
        pos,
        view;

      if (orig && orig.length) {
        pos = _get_obj_pos(orig);

        from = {
          width : pos.width + (currentOpts.padding * 2),
          height : pos.height + (currentOpts.padding * 2),
          top : pos.top - currentOpts.padding - 20,
          left : pos.left - currentOpts.padding - 20
        };

      } else {
        view = _get_viewport();

        from = {
          width : currentOpts.padding * 2,
          height : currentOpts.padding * 2,
          top : parseInt(view[3] + view[1] * 0.5, 10),
          left : parseInt(view[2] + view[0] * 0.5, 10)
        };
      }

      return from;
    },

    _animate_loading = function() {
      if (!loading.is(':visible')){
        clearInterval(loadingTimer);
        return;
      }

      jQuery('div', loading).css('top', (loadingFrame * -40) + 'px');

      loadingFrame = (loadingFrame + 1) % 12;
    };

  /*
   * Public methods
   */

  jQuery.fn.fancybox = function(options) {
    if (!jQuery(this).length) {
      return this;
    }

    jQuery(this)
      .data('fancybox', jQuery.extend({}, options, (jQuery.metadata ? jQuery(this).metadata() : {})))
      .unbind('click.fb')
      .bind('click.fb', function(e) {
        e.preventDefault();

        if (busy) {
          return;
        }

        busy = true;

        jQuery(this).blur();

        selectedArray = [];
        selectedIndex = 0;

        var rel = jQuery(this).attr('rel') || '';

        if (!rel || rel == '' || rel === 'nofollow') {
          selectedArray.push(this);

        } else {
          selectedArray = jQuery("a[rel=" + rel + "], area[rel=" + rel + "]");
          selectedIndex = selectedArray.index( this );
        }

        _start();

        return;
      });

    return this;
  };

  jQuery.fancybox = function(obj) {
    var opts;

    if (busy) {
      return;
    }

    busy = true;
    opts = typeof arguments[1] !== 'undefined' ? arguments[1] : {};

    selectedArray = [];
    selectedIndex = parseInt(opts.index, 10) || 0;

    if (jQuery.isArray(obj)) {
      for (var i = 0, j = obj.length; i < j; i++) {
        if (typeof obj[i] == 'object') {
          jQuery(obj[i]).data('fancybox', jQuery.extend({}, opts, obj[i]));
        } else {
          obj[i] = jQuery({}).data('fancybox', jQuery.extend({content : obj[i]}, opts));
        }
      }

      selectedArray = jQuery.merge(selectedArray, obj);

    } else {
      if (typeof obj == 'object') {
        jQuery(obj).data('fancybox', jQuery.extend({}, opts, obj));
      } else {
        obj = jQuery({}).data('fancybox', jQuery.extend({content : obj}, opts));
      }

      selectedArray.push(obj);
    }

    if (selectedIndex > selectedArray.length || selectedIndex < 0) {
      selectedIndex = 0;
    }

    _start();
  };

  jQuery.fancybox.showActivity = function() {
    clearInterval(loadingTimer);

    loading.show();
    loadingTimer = setInterval(_animate_loading, 66);
  };

  jQuery.fancybox.hideActivity = function() {
    loading.hide();
  };

  jQuery.fancybox.next = function() {
    return jQuery.fancybox.pos( currentIndex + 1);
  };

  jQuery.fancybox.prev = function() {
    return jQuery.fancybox.pos( currentIndex - 1);
  };

  jQuery.fancybox.pos = function(pos) {
    if (busy) {
      return;
    }

    pos = parseInt(pos);

    selectedArray = currentArray;

    if (pos > -1 && pos < currentArray.length) {
      selectedIndex = pos;
      _start();

    } else if (currentOpts.cyclic && currentArray.length > 1) {
      selectedIndex = pos >= currentArray.length ? 0 : currentArray.length - 1;
      _start();
    }

    return;
  };

  jQuery.fancybox.cancel = function() {
    if (busy) {
      return;
    }

    busy = true;

    jQuery.event.trigger('fancybox-cancel');

    _abort();

    selectedOpts.onCancel(selectedArray, selectedIndex, selectedOpts);

    busy = false;
  };

  // Note: within an iframe use - parent.jQuery.fancybox.close();
  jQuery.fancybox.close = function() {
    if (busy || wrap.is(':hidden')) {
      return;
    }

    busy = true;

    if (currentOpts && false === currentOpts.onCleanup(currentArray, currentIndex, currentOpts)) {
      busy = false;
      return;
    }

    _abort();

    jQuery(close.add( nav_left ).add( nav_right )).hide();

    jQuery(content.add( overlay )).unbind();

    jQuery(window).unbind("resize.fb scroll.fb");
    jQuery(document).unbind('keydown.fb');

    if (currentOpts.type === 'iframe') {
      content.find('iframe').attr('src', isIE6 && /^https/i.test(window.location.href || '') ? 'javascript:void(false)' : 'about:blank');
    }

    if (currentOpts.titlePosition !== 'inside') {
      title.empty();
    }

    wrap.stop();

    function _cleanup() {
      overlay.fadeOut('fast');

      title.empty().hide();
      wrap.hide();

      jQuery.event.trigger('fancybox-cleanup');

      content.empty();

      currentOpts.onClosed(currentArray, currentIndex, currentOpts);

      currentArray = selectedOpts = [];
      currentIndex = selectedIndex = 0;
      currentOpts = selectedOpts  = {};

      busy = false;
    }

    if (currentOpts.transitionOut == 'elastic') {
      start_pos = _get_zoom_from();

      var pos = wrap.position();

      final_pos = {
        top  : pos.top ,
        left : pos.left,
        width : wrap.width(),
        height : wrap.height()
      };

      if (currentOpts.opacity) {
        final_pos.opacity = 1;
      }

      title.empty().hide();

      fx.prop = 1;

      jQuery(fx).animate({ prop: 0 }, {
         duration : currentOpts.speedOut,
         easing : currentOpts.easingOut,
         step : _draw,
         complete : _cleanup
      });

    } else {
      wrap.fadeOut( currentOpts.transitionOut == 'none' ? 0 : currentOpts.speedOut, _cleanup);
    }
  };

  jQuery.fancybox.resize = function() {
    if (overlay.is(':visible')) {
      overlay.css('height', jQuery(document).height());
    }

    jQuery.fancybox.center(true);
  };

  jQuery.fancybox.center = function() {
    var view, align;

    if (busy) {
      return;
    }

    align = arguments[0] === true ? 1 : 0;
    view = _get_viewport();

    if (!align && (wrap.width() > view[0] || wrap.height() > view[1])) {
      return;
    }

    wrap
      .stop()
      .animate({
        'top' : parseInt(Math.max(view[3] - 20, view[3] + ((view[1] - content.height() - 40) * 0.5) - currentOpts.padding)),
        'left' : parseInt(Math.max(view[2] - 20, view[2] + ((view[0] - content.width() - 40) * 0.5) - currentOpts.padding))
      }, typeof arguments[0] == 'number' ? arguments[0] : 200);
  };

  jQuery.fancybox.init = function() {
    if (jQuery("#fancybox-wrap").length) {
      return;
    }

    jQuery('body').append(
      tmp = jQuery('<div id="fancybox-tmp"></div>'),
      loading = jQuery('<div id="fancybox-loading"><div></div></div>'),
      overlay = jQuery('<div id="fancybox-overlay"></div>'),
      wrap = jQuery('<div id="fancybox-wrap"></div>')
    );

    outer = jQuery('<div id="fancybox-outer"></div>')
      .append('<div class="fancybox-bg" id="fancybox-bg-n"></div><div class="fancybox-bg" id="fancybox-bg-ne"></div><div class="fancybox-bg" id="fancybox-bg-e"></div><div class="fancybox-bg" id="fancybox-bg-se"></div><div class="fancybox-bg" id="fancybox-bg-s"></div><div class="fancybox-bg" id="fancybox-bg-sw"></div><div class="fancybox-bg" id="fancybox-bg-w"></div><div class="fancybox-bg" id="fancybox-bg-nw"></div>')
      .appendTo( wrap );

    outer.append(
      content = jQuery('<div id="fancybox-content"></div>'),
      close = jQuery('<a id="fancybox-close"></a>'),
      title = jQuery('<div id="fancybox-title"></div>'),

      nav_left = jQuery('<a href="javascript:;" id="fancybox-left"><span class="fancy-ico" id="fancybox-left-ico"></span></a>'),
      nav_right = jQuery('<a href="javascript:;" id="fancybox-right"><span class="fancy-ico" id="fancybox-right-ico"></span></a>')
    );

    close.click(jQuery.fancybox.close);
    loading.click(jQuery.fancybox.cancel);

    nav_left.click(function(e) {
      e.preventDefault();
      jQuery.fancybox.prev();
    });

    nav_right.click(function(e) {
      e.preventDefault();
      jQuery.fancybox.next();
    });

    if (jQuery.fn.mousewheel) {
      wrap.bind('mousewheel.fb', function(e, delta) {
        if (busy) {
          e.preventDefault();

        } else if (jQuery(e.target).get(0).clientHeight == 0 || jQuery(e.target).get(0).scrollHeight === jQuery(e.target).get(0).clientHeight) {
          e.preventDefault();
          jQuery.fancybox[ delta > 0 ? 'prev' : 'next']();
        }
      });
    }

    if (!jQuery.support.opacity) {
      wrap.addClass('fancybox-ie');
    }

    if (isIE6) {
      loading.addClass('fancybox-ie6');
      wrap.addClass('fancybox-ie6');

      jQuery('<iframe id="fancybox-hide-sel-frame" src="' + (/^https/i.test(window.location.href || '') ? 'javascript:void(false)' : 'about:blank' ) + '" scrolling="no" border="0" frameborder="0" tabindex="-1"></iframe>').prependTo(outer);
    }
  };

  jQuery.fn.fancybox.defaults = {
    padding : 10,
    margin : 40,
    opacity : false,
    modal : false,
    cyclic : false,
    scrolling : 'auto', // 'auto', 'yes' or 'no'

    width : 560,
    height : 340,

    autoScale : true,
    autoDimensions : true,
    centerOnScroll : false,

    ajax : {},
    swf : { wmode: 'transparent' },

    hideOnOverlayClick : true,
    hideOnContentClick : false,

    overlayShow : true,
    overlayOpacity : 0.7,
    overlayColor : '#777',

    titleShow : true,
    titlePosition : 'float', // 'float', 'outside', 'inside' or 'over'
    titleFormat : null,
    titleFromAlt : false,

    transitionIn : 'fade', // 'elastic', 'fade' or 'none'
    transitionOut : 'fade', // 'elastic', 'fade' or 'none'

    speedIn : 300,
    speedOut : 300,

    changeSpeed : 300,
    changeFade : 'fast',

    easingIn : 'swing',
    easingOut : 'swing',

    showCloseButton  : true,
    showNavArrows : true,
    enableEscapeButton : true,
    enableKeyboardNav : true,

    onStart : function(){},
    onCancel : function(){},
    onComplete : function(){},
    onCleanup : function(){},
    onClosed : function(){},
    onError : function(){}
  };

  jQuery(document).ready(function() {
    jQuery.fancybox.init();
  });

})(jQuery);