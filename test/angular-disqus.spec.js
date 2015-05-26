describe('Angular-disqus', function() {
  var $disqusProvider;

  beforeEach(module('ngDisqus'));

  // Get the provider for testing
  beforeEach(function() {
    var mod = angular.module('providerTest', []).config(function(_$disqusProvider_) {
      $disqusProvider = _$disqusProvider_;
    });

    module(mod.name);
    inject(function() {});
  });

  describe ('$disqusProvider', function() {
    it ('should contain the shortname function', function() {
      expect($disqusProvider.setShortname).toEqual(jasmine.any(Function));
    });

    it ('should set the shortname', inject(function($disqus) {
      $disqusProvider.setShortname('test-name');
      expect($disqus.getShortname()).toEqual('test-name');
    }));
  });

  describe('$disqus', function() {

    describe('#commit', function() {

      describe ('exception throwing', function() {
        it('should throw when no disqus shortname defined', inject(function($disqus, $window) {
          expect(function () {
            $disqus.commit();
          }).toThrow('No disqus shortname defined');
        }));

        it('should throw when no disqus shortname defined (on window)', inject(function($disqus, $window) {
          $window.disqus_shortname = undefined;
          expect(function () {
            $disqus.commit();
          }).toThrow('No disqus shortname defined');
        }));

        it('should not throw when disqus_shortname is defined on window', inject(function($disqus, $window) {
          $window.disqus_shortname = 123;
          expect(function () {
            $disqus.commit();
          }).not.toThrow('No disqus shortname defined');
        }));

        it('should throw when no url is defined', inject(function($disqus, $window) {
          $disqusProvider.setShortname('defined');
          expect(function () {
            $disqus.commit(undefined);
          }).toThrow('No disqus thread url defined');
        }));
      });

      it('should write the script tag to head if there are other script tags present', inject(function($disqus) {
        var el = $('<script></script>', {
          src : 'http://www.google.com'
        }).appendTo((document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]));

        $disqusProvider.setShortname('shortname');
        $disqus.commit('test');
        var tags = $('script[type="text/javascript"][src="//shortname.disqus.com/embed.js"]');

        expect(tags.length).toBe(1);
      }));

      it('should write the script tag to head if not initialized (using provider)', inject(function($disqus) {

        $disqusProvider.setShortname('shortname');
        $disqus.commit('test');
        var tags = $('script[type="text/javascript"][src="//shortname.disqus.com/embed.js"]');

        expect(tags.length).toBe(1);
      }));

      it('should write the script tag to head if not initialized (using $window.disqus_shortname)', inject(function($disqus) {

        $disqusProvider.setShortname('shortname');
        $disqus.commit('test');
        var tags = $('script[type="text/javascript"][src="//shortname.disqus.com/embed.js"]');

        expect(tags.length).toBe(1);
      }));

      it('should write ONLY ONE script tag', inject(function($disqus) {

        $disqusProvider.setShortname('shortname');
        $disqus.commit('test');
        $disqus.commit('test');
        $disqus.commit('test');
        $disqus.commit('test');
        var tags = $('script[type="text/javascript"][src="//shortname.disqus.com/embed.js"]');

        expect(tags.length).toBe(1);
      }));

      it('should write default values to window', inject(function($disqus, $window) {
        $disqusProvider.setShortname('shortname');
        $disqus.commit('http://www.test.com/234');

        expect($window.disqus_shortname).toEqual('shortname');
        expect($window.disqus_identifier).toEqual('http://www.test.com/234');
        expect($window.disqus_url).toEqual('http://www.test.com/234');
        expect($window.disqus_title).toEqual(undefined);
      }));
      
      
      it('should write title to window', inject(function($disqus, $window) {
        $disqusProvider.setShortname('shortname');
        $disqus.commit('http://www.test.com/234', 'Test');

        expect($window.disqus_shortname).toEqual('shortname');
        expect($window.disqus_identifier).toEqual('http://www.test.com/234');
        expect($window.disqus_url).toEqual('http://www.test.com/234');
        expect($window.disqus_title).toEqual('Test');
      }));

      it ('should reset the thread with correct url', inject(function($disqus, $window, $location) {
        var spy  = jasmine.createSpy('reset spy');
        var data = {
          page : {}
        };

        $disqusProvider.setShortname('shortname');
        $window.DISQUS = {
          reset : function(opts) {
            opts.config.call(data);
          }
        };

        $disqus.commit('http://www.test.com/123');
        expect(data.page.url).toBe('http://www.test.com/123');
      }));

      it('should reset the thread if initialized', inject(function($disqus, $window) {
        var spy = jasmine.createSpy('disqus reset spy');

        $disqusProvider.setShortname('shortname');
        // Overwrite the reset method
        $window.DISQUS = {
          reset : spy
        };

        $disqus.commit('wat');
        expect(spy).toHaveBeenCalled();
        expect(spy.callCount).toBe(1);

        // Validate arguments
        expect(spy.mostRecentCall.args[0].reload).toBe(true);
        expect(spy.mostRecentCall.args[0].config).toEqual(jasmine.any(Function));
      }));
    });

    describe('#getShortname', function() {
      it('should contain #getShortname method', inject(function($disqus) {
        expect($disqus.getShortname).toEqual(jasmine.any(Function));
      }));
    });

    describe('#loadCount', function() {
      it('should should contain #loadCount method', inject(function($disqus) {
        expect($disqus.loadCount).toEqual(jasmine.any(Function));
      }));

      it('should set globals on initializing', inject(function($disqus, $window, $location) {
        $disqusProvider.setShortname('shortname');
        $disqus.loadCount('http://www.test.com/345');

        expect($window.disqus_shortname).toEqual('shortname');
        expect($window.disqus_identifier).toEqual('http://www.test.com/345');
        expect($window.disqus_url).toEqual('http://www.test.com/345');
      }));

      it('should add embed script tag if its not added', inject(function($disqus) {
        $disqusProvider.setShortname('shortname');
        $disqus.loadCount('test');
        var tags = $('script[type="text/javascript"][src="//shortname.disqus.com/embed.js"]');

        expect(tags.length).toBe(1);
      }));

      it('should add count script tag if its not added', inject(function($disqus) {
        $disqusProvider.setShortname('shortname');
        $disqus.loadCount('test');
        var tags = $('script[type="text/javascript"][src="//shortname.disqus.com/count.js"]');

        expect(tags.length).toBe(1);
      }));

      it('should add only one script tag for embed and count', inject(function($disqus) {
        $disqusProvider.setShortname('shortname');
        $disqus.loadCount('test');
        $disqus.loadCount('test');
        $disqus.loadCount('test');

        var count = $('script[type="text/javascript"][src="//shortname.disqus.com/count.js"]');
        var embed = $('script[type="text/javascript"][src="//shortname.disqus.com/embed.js"]');

        expect(count.length).toBe(1);
        expect(embed.length).toBe(1);
      }));

      it('should ask getCount from DISQUSWIDGETS on loading', inject(function($disqus, $window) {
        $disqusProvider.setShortname('shortname');
        $window.DISQUSWIDGETS = {
          getCount : jasmine.createSpy()
        };

        $disqus.loadCount();
        expect($window.DISQUSWIDGETS.getCount).toHaveBeenCalled();
      }));
    });
  });

  describe('directive', function() {

    function compileHtml(html) {
      var elem = $compile(html)($rootScope);
      $rootScope.$digest();

      return elem;
    }

    var ID = 'disqus_thread',
    $compile, $rootScope;

    beforeEach(inject(function(_$compile_, _$rootScope_) {
      $compile   = _$compile_;
      $rootScope = _$rootScope_;
    }));

    describe('thread directive', function() {

      it('should compile as class', function() {
        var element = compileHtml('<div class="disqus: \'test-id\'"></div>');
        expect(element.scope().url).toEqual('test-id');
        expect(element.attr('id')).toEqual(ID);
      });

      it('should compile as attribute', function() {
        var element = compileHtml('<div disqus="\'test-id\'"></div>');
        expect(element.scope().url).toEqual('test-id');
        expect(element.attr('id')).toEqual(ID);
      });

      it('should trigger commit if url is defined', inject(function($disqus) {
        $disqus.commit = jasmine.createSpy('commit call spy');
        compileHtml('<div disqus="\'test-id\'"></div>');

        expect($disqus.commit).toHaveBeenCalledWith('test-id', undefined);
      }));
      
      
      it('should use title in commit if title is defined', inject(function($disqus) {
        $disqus.commit = jasmine.createSpy('commit call spy');
        compileHtml('<div disqus="\'test-id\'" title="\'Test Title\'"></div>');

        expect($disqus.commit).toHaveBeenCalledWith('test-id', 'Test Title');
      }));

      it('should trigger commit if url changes', inject(function($window, $disqus, $rootScope) {
        $disqus.commit = jasmine.createSpy('commit call spy');
        $rootScope.url = 'http://www.test.com/345';
        compileHtml('<div disqus="url"></div>');

        $rootScope.url = 'http://www.test.com/456';
        $rootScope.$apply();

        expect($disqus.commit).toHaveBeenCalledWith('http://www.test.com/456', undefined);
      }));
    });

    describe('disqus-identifier directive', function() {

      it('should trigger disqusProvider loadCount', inject(function($disqus) {
        spyOn($disqus, 'loadCount');
        var element = compileHtml('<div data-disqus-identifier="id"></div>');
        expect($disqus.loadCount).toHaveBeenCalled();
      }));

      it('should trigger disqusProvider loadCount with given id', inject(function($disqus) {
        spyOn($disqus, 'loadCount');
        var element = compileHtml('<div data-disqus-identifier="id"></div>');
        expect($disqus.loadCount).toHaveBeenCalledWith('id');
      }));

    });
  });
});
