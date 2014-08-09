function pageEffect(obj) {
	this.container = $('#container');
	this.wrap = this.container.find('.wrap');
	this.clipElem = this.wrap.add(this.container);
	this.count = 0;
	this.max = this.wrap.length - 1;

	// 初始化
	this.init();
}
pageEffect.prototype = {
	init:function() {
		var self = this;
		
		// 是否支持css3
		this.isSupCss3();		

		// 绑定resize实时监控高度/宽度
		$(window).bind('resize', function() {
			self.monitoringBody.call(self);
		}).resize();

		// 第一屏slider效果
		this.slider();

		// 绑定鼠标中键事件
		this.addWheel();
	},
	slider:function() {
		var wrap = $('#slider'),
			mover = wrap.find('ul'),
			parentElem = wrap.parent(),
			pre = parentElem.find('.pre'),
			next = parentElem.find('.next'),
			lis = mover.find('li'),
			len = lis.length,
			w = lis.width(),
			maxW = -(w * len),
			index = 0,
			startGo = $('#startGo'),
			changePic = $('#jumpPic'),
			address = ['pic2.jpg', 'pic3.jpg', 'pic4.jpg'],
			current, setInterval_elem;

		// 初始化
		mover.html(mover.html() + mover.html() + mover.html()).css('margin-left', maxW);

		// 绑定事件
		pre.add(next).click(function(){
			if(mover.is(':animated')) return;
			var self = $(this);
			if(self.hasClass('pre')) {
				if(index == 0) {
					index = len;
					mover.css('marginLeft', 2*maxW);
				};
				index = index - 2;
			} else {
				if(index == len) {
					index = 0;
					mover.css('marginLeft', maxW);
				}
			};
			_move();
		})

		// 移动函数
		function _move() {
			index++;
			current = -index*w + maxW;
			mover.animate({marginLeft: current}, function() {

			})
		};

		// 开始烘焙跳转
		startGo.click(function() {
			changePic.attr('src', 'images/' + address[index]);
			return false;
		})
	},
	suppFun:function() {
		// 获取浏览器前缀
		this.getPrefix();
		this.container.addClass('cs3-transition');
	},
	moveFun:function() {
		//
	},
	getPrefix: function() {
		var ua = navigator.userAgent,
			browserType = $.uaMatch(ua).browser,
			obj = {
				'webkit': '-webkit-',
				'mozilla': '-moz-',
				'opera': '-o-',
				'msie': '-ms-',
			};
		this.prefix = obj[browserType];
	},
	addWheel:function() {
		var body = document.body,
			self = this;
		if(!('onmousewheel' in body)) {
			body.addEventListener('DOMMouseScroll', function(e){
				e = e || window.event
				_scroll.call(self, e);
			} , false);
		} else {
			body.onmousewheel = function(e) {
				e = e || window.event
				_scroll.call(self, e);
			};
		};
		function _scroll(e) {
			var val;

			// opera两个都支持所以要把wheelDelta放前面，孤立ff
			val = e.wheelDelta/120 || -(e.detail/3);
			if(val < 0) {
				this.count++;
			} else {
				this.count--;
			};
			this.wheelFun();
		}
	},
	wheelFun:function() {
		if(this.count < 0) {
			this.count = 0;
		};
		if(this.count > this.max){
			this.count = this.max;
		};
		this.setContainerVal();
	},
	isSupCss3: function() {
	    var div = document.createElement('div'),
	        transEndEventNames = {
	          'WebkitTransition' : 'webkitTransitionEnd',
	          'MozTransition'    : 'transitionend',
	          'OTransition'      : 'oTransitionEnd otransitionend',
	          'transition'       : 'transitionend'
	        },
	        type;
	    for (var name in transEndEventNames) {
	      if (div.style[name] !== undefined) {
	        type=transEndEventNames[name];
	        break;
	      };
	    };

	    this.isSup = !!type;
	    if(this.isSup) {
			this.suppFun();
		} else {
			this.moveFun();
		};
	},
	monitoringBody:function() {
		this.w = $(window).width();
		this.h = $(window).height();
		this.clipElem.css('height', this.h);
		this.setContainerVal();
	},
	setContainerVal:function(v) {
		var val = - (v || this.count) * (this.h),
			prefix = this.prefix;
		if(this.isSupCss3) {
			this.container.css(prefix + 'transform', 'translate3d(0, '+ val + 'px, 0)');
		} else {
			this.container.stop().animate({marginTop: val});
		};
	}
};

$(function(){
	new pageEffect();
})