function pageEffect(obj) {
	this.head = $('#nr_hd');
	this.foot = $('#nr_footer');
	this.headHeight = this.head.outerHeight();
	this.footHeight = this.foot.outerHeight();

	this.headHeight = $('#nr_hd').outerHeight();
	this.footHeight = $('#nr_footer').outerHeight();
	this.autoHeight = 0;

	this.time = 2;

	this.container = $('#page-container');
	this.bodyWrap = $('.body-wrap');
	this.wrap = this.container.find('.wrap');
	this.clipElem = this.wrap.add(this.bodyWrap);

	// 隐藏图片，用于css动画完成后显示
	this.hidePic = this.container.find('.hidePic');
	this.count = -1;

	// 控制是否能运行动画
	this.state = true;
	this.max = this.wrap.length - 1;
	this.sliderIndex = null;

	// 最后图片渐现
	this.lastElem = $('#lastElem');

	// 初始化
	this.init();
}
pageEffect.prototype = {

	// 储存各各的运行时间
	transitTime: [300, 300 ,1200 ,800 ,800 ,800 ,800 ,800 , 0, 800],
	init:function() {

		// 是否支持css3
		this.isSupCss3();

		// 添加右侧控制圆点
		this.addHandle();		

		// 第一屏slider效果
		this.slider();

		// 添加各类事件
		this.addEvent();
	},

	// 右边控制手柄
	addHandle:function() {
		var len = this.wrap.length,
			i = 0,
			str = '',
			w;
		for(; i < len ; i++) {
			str += '<span></span>';
		};
		str = '<p id="pager">' + str + '</p>';

		// 保存控制器
		this.handleWrap = $(str).insertAfter(this.container);
		this.handle = this.handleWrap.find('span');

		// 垂直居中
		h = this.handleWrap.height();
		this.handleWrap.css('margin-top', -h/2);
	},

	// 第一屏slider
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
			self = this,
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
		});

		// 移动函数
		function _move() {
			index++;
			self.sliderIndex = index;
			console.log(self.sliderIndex);
			current = -index*w + maxW;
			mover.animate({marginLeft: current});
		};

		// 开始烘焙跳转
		startGo.click(function() {			
			self.handle.eq(1).click();
			return false;
		})
	},

	// 添加各种event
	addEvent:function() {
		var self = this;
		// 绑定resize实时监控高度/宽度
		$(window).bind('resize', function() {
			self.winResizeFun.call(self);
		}).resize();

		// 添加鼠标中键控制
		this.addWheel();

		// 右侧小点添加事件
		this.handle.bind('click', function() {
			if(!self.state) return;
			var my = $(this);
			if(self.head.is(':visible')) {
				self.state = false
				self.head.slideUp(300, function(){
					self.state = true;
					self.count = my.index();
					self.setContainerVal();
				});
				return ;
			};

			self.count = $(this).index();
			self.setContainerVal();
		})
	},

	// 添加鼠标中键
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
			var lastElem = this.lastElem,
				isLucency = !lastElem.hasClass('on') && this.count == this.max,
				isFoot = lastElem.hasClass('on') && this.count == this.max,
				head = this.head,
				self = this;
				
			// 如果container正在动画 或者 本pagecss动画没有完成则return
			if(this.container.is(':animated') || !this.state) {
				 return false
			};
			var val;

			// opera两个都支持所以要把wheelDelta放前面，孤立ff
			val = e.wheelDelta/120 || -(e.detail/3);

			// 向下滚动
			if(val < 0) {

				// head 收上去
				if(head.is(':visible')) {
					this.state = false;
					this.head.slideUp(300, function() {
						self.state = true;

						if(!self.wrap.first().hasClass('on')) {
						self.handle.first().click();
						};
					});
					return ;
				};

				if(isLucency) {
					this.state = false;
					lastElem.animate({'opacity': 1}, 300, function() {
						self.state = true;
					}).addClass('on');;
					return ;
				};

				if(isFoot) {
					this.state = false;
					this.bodyWrap.animate({marginTop: -this.footHeight}, 300, function() {
						self.state = true;
					}).addClass('active');
					return ;
				};

				this.count++;

			// 向上
			} else {

				if(head.is(':hidden') && this.count <= 0) {
					this.state = false;
					this.head.slideDown(function() {
						self.state = true;
					})
					return ;
				}

				if(isFoot && this.bodyWrap.hasClass('active')) {
					this.state = false;
					this.bodyWrap.animate({marginTop:0}, 300, function() {
						self.state = true;
					}).removeClass('active');
					return ;
				}

				this.count--;
			};
			if(this.count < 0) {
				this.count = 0;
			};
			if(this.count > this.max){
				if(isLucency == 0) {
					this.lastElem.animate({'opacity': 1}, 600).addClass('on');
				};
				this.count = this.max;
			};

			// 设置container的位置
			this.setContainerVal();
		}
	},

	// 是否支持css动画效果，通过属性判断区分浏览器
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

	    // 如果不支持就默认归为
	    if(!this.isSup) {
			this.wrap.addClass('on');
		} else {
			//this.wrap.first().addClass('on');
		};
	},

	// 监视窗口大小变化
	winResizeFun:function() {
		this.w = $(window).width();
		this.h = $(window).height();
		this.clipElem.css('height', this.h);

		// 初始化不设置
		if(this.count < 0) return;
		this.setContainerVal(true);
	},

	// 设置container的位置
	setContainerVal:function(state) {
		var val = - (this.count) * (this.h),
			self = this,
			isSup = this.isSup,
			mapKey = {
				2: 600
			},
			count = this.count,
			time = isSup ? mapKey[count] : 0,
			hidePic = this.wrap.eq(count).find('.hidePic');

		// 切换第二屏图片
		this.changePicAddress();

		// 这个用于窗口大小变化时改变container的top坐标，没动画
		if(state) {			
			this.container.css('top', val);

		// 动画切换container位置
		} else {
			if(!this.state) return;

			// 支持css3动画的才设置
			if(isSup) {
				this.state = false;
			}

			this.container.animate({'top': val}, 500 , function() {
				if(self.count !== self.max) {
					self.lastElem.removeClass('on').removeAttr('style');
				};
				self.handle.removeClass('on').eq(count).addClass('on');

				// 对于高端浏览器才切换on状态。低端则一直都存在on
				if(isSup) {
					self.wrap.removeClass('on').eq(count).addClass('on');

					// 注册时间，等动画完了才能下一次动画
					window.setTimeout(function() {
						self.state = true;
					}, self.transitTime[count]);
				};

				// 这时为第三屏幕。动画完后要动画完成第二张图的显示
				if(hidePic.length) {
					window.setTimeout(function(){
						hidePic.animate({'opacity': 1}, 600);
					}, time);
				} else {
					self.hidePic.each(function(){
						var my = $(this);
						if(my.is(':visible')) {
							my.stop().removeAttr('style');
						}
					})
				};
			});			
		}
	},

	// 切换第二屏图片显示状况
	changePicAddress:function() {
		var sliderIndex = this.sliderIndex,
			changePic = $('#jumpPic'),
			address = ['pic2.jpg', 'pic3.jpg', 'pic4.jpg', 'pic2.jpg'];

		if(sliderIndex != null) {
			changePic.attr('src', 'images/' + address[sliderIndex]);
			sliderIndex = null;
		}		
	},

	// 最外层移动
	mainWrapMove:function(v) {
		var self = this;
		this.state = false;
		switch(v) {

			case 0:
				this.mainWrap.animate({marginTop: -this.headHeight}, 500, function() {
					_stateChange();
					if(self.count < 0) {
						self.handle.first().click();
					};
				});
				break ;

			case 1:
				this.mainWrap.css('margin-top', -this.headHeight);
				_stateChange();
				break ;

			case 3:
				this.mainWrap.animate({marginTop: 0}, 500, _stateChange);
				break ;

			case 4:
				this.mainWrap.css({marginTop: 0});
				_stateChange();
				break ;

			default:
				this.mainWrap.animate({marginTop: -this.headHeight - this.footHeight}, 500, _stateChange);
				break ;
		};
		function _stateChange() {
			self.state = true;
		}
	}
};

$(function(){
	new pageEffect();
})