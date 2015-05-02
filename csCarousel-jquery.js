(function($) {
  var self, options, iframeOptions;
  var statePlaying = 'playing';
  var statePaused = 'paused';
  var stateStopped = 'stopped';
  
  var methods = {
    'init' : function(opts) {
      options = $.extend({
        'duration'    : 5,
        'slides'      : [],
        'nextButton'    : null, // jQuery object
        'prevButton'    : null, // jQuery object
        'playPauseButton' : null, // jQuery object
        'pauseOnHover'  : true,
        'useIFrames': false,
        iframeOptions: {
          width: '100%',
          height: '100%'
        }
      }, opts);
      
      return this.each(function() {
        if (options.slides.length < 1) return;
        
        var $this = $(this);
        var data = $this.data('csCarousel');
        
        // set up carousel
        $this.addClass('csCarousel');
        
        if (!data) { // set data object on carousel element
          $this.data('csCarousel', {
            'setTimer' : function() {
              if ($this.csCarousel('isStopped')) return;
              
              if ($this.data('csCarousel').carouselTimer != null)
                window.clearTimeout($this.data('csCarousel').carouselTimer);
              
              $this.data('csCarousel').carouselTimer = window.setTimeout(function() {
                methods['next']();
              }, (options.slides[$this.data('csCarousel').index].duration || options.duration) * 1000);
            },
            'clearTimer' : function() {
              if ($this.data('csCarousel').carouselTimer != null)
                window.clearTimeout($this.data('csCarousel').carouselTimer);
            },
            'carouselTimer' : null,
            'index' : 0, // index of the .current.slide
            'state' : statePlaying
          });
        }
        
        if (options.pauseOnHover) {
          self.hover(function() {
            if (!self.csCarousel('isStopped')) self.csCarousel('playPause');
          });
        }
        
        if (options.nextButton != null) {
          options['nextButton'].click(function() {
            self.csCarousel('next', true);
            return false;
          });
        }
        
        if (options.prevButton != null) {
          options['prevButton'].click(function() {
            self.csCarousel('prev', true);
            return false;
          });
        }
        
        if (options.playPauseButton != null) {
          options['playPauseButton'].click(function() {
            self.data('csCarousel').state == statePlaying? self.csCarousel('stop') : self.csCarousel('start');
            return false;
          });
        }
        
        if (options.useIFrames) {
          $('<div/>').addClass('slide current').append($('<iframe/>').attr($.extend({src: options.slides[0].url}, options.iframeOptions))).appendTo(self);
          $('<div/>').addClass('slide incoming').append($('<iframe/>').attr($.extend({src: options.slides[1 % options.slides.length].url}, options.iframeOptions))).appendTo(self);
          $('<div/>').addClass('slide outgoing').append($('<iframe/>').attr($.extend({src: options.slides[options.slides.length - 1].url}, options.iframeOptions))).appendTo(self);
        } else {
          $('<div/>').addClass('slide current').load(options.slides[0].url).appendTo(self);
          $('<div/>').addClass('slide incoming').load(options.slides[1 % options.slides.length].url).appendTo(self);
          $('<div/>').addClass('slide outgoing').load(options.slides[options.slides.length - 1].url).appendTo(self);
        }
        
        $this.data('csCarousel').setTimer();
      });
    },
    'next' : function(force) {
      force = force || false;
      if (!self.csCarousel('isPaused') || force) {
        var idx = (self.data('csCarousel').index + 1) % options.slides.length;
      
        self.find('.slide.outgoing').remove();
        self.find('.slide.current').toggleClass('current outgoing'); // .slide.current -> .slide.outgoing
        self.find('.slide.incoming').toggleClass('current incoming'); // .slide.incoming -> .slide.current
        
        if (options.useIFrames) {
          $('<div/>').addClass('slide incoming')
            .append($('<iframe/>').attr($.extend({src: options.slides[(idx + 1) % options.slides.length].url}, options.iframeOptions)))
            .appendTo(self);
        } else {
          $('<div/>').addClass('slide incoming') // load .slide.incoming
            .load(options.slides[(idx + 1) % options.slides.length].url)
            .appendTo(self);
        }
      
        self.data('csCarousel').index = idx;
      }
      
      self.data('csCarousel').setTimer();
    },
    'prev' : function(force) {
      force = force || false;
      if (!self.csCarousel('isPaused') || force) {
        var idx = (self.data('csCarousel').index - 1);
        if (idx < 0) idx = options.slides.length - 1;
      
        var incoming_idx = idx - 1;
        if (incoming_idx < 0) incoming_idx = options.slides.length - 1;
      
        self.find('.slide.incoming').remove();
        self.find('.slide.current').toggleClass('current incoming');
        self.find('.slide.outgoing').toggleClass('current outgoing');
        
        if (options.useIFrames) {
          $('<div/>').addClass('slide outgoing')
            .append($('<iframe/>').attr($.extend({src: options.slides[incoming_idx].url}, options.iframeOptions)))
            .appendTo(self);
        } else {
          $('<div/>').addClass('slide outgoing')
            .load(options.slides[incoming_idx].url)
            .appendTo(self);
        }
      
        self.data('csCarousel').index = idx;
      }
      
      self.data('csCarousel').setTimer();
    },
    'playPause' : function() {
      if (self.csCarousel('isStopped')) return;
      
      switch (self.data('csCarousel').state) {
        case stateStopped:
          return;
          break;
        case statePlaying:
          self.data('csCarousel').state = statePaused;
          self.trigger('pause');
          break;
        case statePaused:
          self.data('csCarousel').state = statePlaying;
          self.trigger('play');
          break;
      }
    },
    'isPaused' : function() {
      return self.data('csCarousel').state == statePaused;
    },
    'isPlaying' : function() {
      return self.data('csCarousel').state == statePlaying;
    },
    'isStopped' : function() {
      return self.data('csCarousel').state == stateStopped;
    },
    'stop' : function() {
      self.data('csCarousel').state = stateStopped;
      self.data('csCarousel').clearTimer();
      self.trigger('stop');
    },
    'start' : function() {
      self.data('csCarousel').state = statePlaying;
      self.data('csCarousel').setTimer();
      self.trigger('start');
    }
  };
  
  $.fn.csCarousel = function(method) {
    self = this;
    if (methods[method]) {
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof(method) === 'object' || !method) {
      return methods.init.apply(this, arguments);
    } else {
      $.error('csCarousel: Unknown method: ' + method);
    }
  };
})(jQuery);