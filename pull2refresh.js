/**
 *
 Created by zhangzhao on 2017/3/16.
 Email: zhangzhao@gomeplus.com
 */
var assign = function (target, varArgs) { // .length of function is 2
    if (target == null) { // TypeError if undefined or null
        throw new TypeError('Cannot convert undefined or null to object');
    }

    var to = Object(target);

    for (var index = 1; index < arguments.length; index++) {
        var nextSource = arguments[index];

        if (nextSource != null) { // Skip over if undefined or null
            for (var nextKey in nextSource) {
                // Avoid bugs when hasOwnProperty is shadowed
                if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                    to[nextKey] = nextSource[nextKey];
                }
            }
        }
    }
    return to;
};
var noop = function () {};


function generateHtml(str) {
    return `<div style="text-align: center;font-size: 12px;line-height: 50px;">${str}</div>`
}

const defaultMovingHtml = `
    <div style="height: 50px;">
        <div class="sl-ld">
            <div class="sl-ld-ball"></div>
            <div class="sl-ld-ball"></div>
        </div>
   </div>
`
const defaultLoadingHtml = `
    <div style="height: 50px;">
        <div class="sl-ld">
            <div class="sl-ld-ball sl-ld-ball-anim"></div>
            <div class="sl-ld-ball sl-ld-ball-anim"></div>
        </div>
   </div>
`


function effect(ball1, ball2, prop) {
    setStyles([ball1], {transform: `translate3d(-${18 * prop}px, 0, 0)`})
    setStyles([ball2], {transform: `translate3d(${18 * prop}px, 0, 0)`})
}


var setStyles = function(els, cssObj) {
    if ('transform' in cssObj) {
        cssObj['webkitTransform'] = cssObj['transform']
    }
    if ('transition' in cssObj) {
        cssObj['webkitTransition'] = cssObj['transition']
    }
    els.forEach(function(el){
        el && assign(el.style, cssObj);
    })
}

function Scrollload(options) {
    var defaultOptions = {
        window: window,
        enablePullRefresh: false,
        calMovingDistance: function(distance) {
            return distance / 3;
        },
        loadingHtml: defaultLoadingHtml,
        notEnoughRefreshPortHtml: defaultMovingHtml,
        overRefreshPortHtml: defaultMovingHtml,
        refreshingHtml: defaultLoadingHtml,
        arrivedRefreshPortHandler: noop,
        pullRefresh: noop,
        notEnoughRefreshPortHandler: function (sl) {
            effect(sl.ball1, sl.ball2, sl.distance / sl.topContentDomHeight)
        },
        initedHandler(sl) {
            const balls = sl.container.querySelectorAll('.sl-ld-ball')
            sl.ball1 = balls[0]
            sl.ball2 = balls[1]
        }
    };
    this._options = assign({}, defaultOptions, options);
    this.container = this._options.container || document.querySelector('.scrollload-container');
    if (!(this.container instanceof HTMLElement)) {
        throw new Error('container must be a HTMLElement instance!');
    }

    this.win = this._options.window;
    this.isGlobalScroll = this.win === window;
    this.windowHeight = window.innerHeight;
    this.contentDom = this._options.contentDom || this.container.querySelector('.scrollload-content')
    this.createTopDom();
    this.startPageY = 0;
    this.prePageY = 0;
    this.isMoving = false;
    this.isMovingDown = true;
    this.isRefreshing = false;
    this.distance = 0;
    this.enterTouchStart = false;

    this.touchStart = this.touchStart.bind(this);
    this.touchMove = this.touchMove.bind(this);
    this.touchEnd = this.touchEnd.bind(this);

    this.attachTouchListener();
}

Scrollload.prototype = {
    constructor: Scrollload,
    createTopDom: function () {
        var notEnoughRefreshPortHtml = this._options.notEnoughRefreshPortHtml;
        var overRefreshPortHtml = this._options.overRefreshPortHtml;
        var refreshingHtml = this._options.refreshingHtml;


        var con = this.container.insertAdjacentHTML('afterbegin',
            `<div class="scrollload-top" style="position: relative;">
                <div class="scrollload-top-content" style="position: absolute; left: 0; right: 0;">
                    <div class="scrollload-notEnoughRefreshPort" style="display: block">${notEnoughRefreshPortHtml}</div>
                    <div class="scrollload-overRefreshPort" style="display: none">${overRefreshPortHtml}</div>
                    <div class="scrollload-refreshing" style="display: none">${refreshingHtml}</div>
                </div>
            </div>`)

        this.container.insertAdjacentHTML('afterbegin', con);
        var topDom = this.container.querySelector('.scrollload-top');
        var topContentDom = topDom.querySelector('.scrollload-top-content');
        this.notEnoughRefreshPortDom = topContentDom.querySelector('.scrollload-notEnoughRefreshPort');
        this.overRefreshPortDom = topContentDom.querySelector('.scrollload-overRefreshPort');
        this.refreshingDom = topContentDom.querySelector('.scrollload-refreshing');
        var topContentDomHeight = topContentDom.clientHeight;
        var topContentDomWidth = topContentDom.clientWidth;

        topDom.style.top = '-' + topContentDomHeight + 'px';
        topContentDom.style.clip = `rect(${topContentDomHeight}px ${topContentDomWidth}px ${topContentDomHeight}px 0)`

        this.topContentDomHeight = topContentDomHeight;
        this.topContentDomWidth = topContentDomWidth;
        this.topDom = topDom;
        this.topContentDom = topContentDom;
    },
    attachTouchListener: function () {
        this.container.addEventListener('touchstart', this.touchStart);
        this.container.addEventListener('touchmove', this.touchMove);
        this.container.addEventListener('touchend', this.touchEnd);
    },
    touchStart: function (event) {
        if (this.isRefreshing) {
            this.enterTouchStart = false;
            return;
        }

        this.enterTouchStart = true;

        this.startPageY = this.prePageY = event.touches[0].pageY;
        console.log('touchstart---', this.startPageY);

        setStyles([this.topDom, this.contentDom, this.bottomDom, this.topContentDom],{
            transition: 'none'
        });

        this.showNotEnoughRefreshPortDom();

    },
    touchMove: function (event) {
        if (!this.enterTouchStart) {
            return;
        }

        var pageY = event.touches[0].pageY;
        this.isMovingDown = pageY >= this.prePageY;

        if (this.isMoving) {
            this.calMovingDistance(pageY - this.startPageY);
            this.movingHandler();

            event.preventDefault();
        } else if (this.isTop() && this.isMovingDown) {
            this.isMoving = true;

            event.preventDefault();
        }

        this.prePageY = pageY;
    },
    touchEnd: function (event) {
        if (!this.isMoving) {
            return;
        }
        //this._options.touchEnd.call(this, this);

        if (this.isOverRefreshPort()) {
            this.triggerPullRefresh();
        } else {
            this.refreshComplete();
        }

        this.startPageY = this.prePageY = 0;
        this.isMoving = false;
    },
    arrivedRefreshPortHandler: function () {
        if (this.isMovingDown) {
            this.showOverRefreshPortDom();
        } else {
            this.showNotEnoughRefreshPortDom();
        }

        this._options.arrivedRefreshPortHandler.call(this, this);
    },
    showOverRefreshPortDom: function () {
        setStyles([this.notEnoughRefreshPortDom, this.refreshingDom], {display: 'none'});
        setStyles([this.overRefreshPortDom], {display: 'block'});
    },
    showNotEnoughRefreshPortDom: function () {
        setStyles([this.overRefreshPortDom, this.refreshingDom], {display: 'none'})
        setStyles([this.notEnoughRefreshPortDom], {display: 'block'})
    },
    isOverRefreshPort: function () {
        return this.distance >= this.topContentDomHeight;
    },
    showRefreshingDom: function () {
        setStyles([this.notEnoughRefreshPortDom, this.overRefreshPortDom], {display: 'none'})
        setStyles([this.refreshingDom], {display: 'block'})
    },
    triggerPullRefresh: function () {
        this.showRefreshingDom()
        this.isRefreshing = true
        setStyles([this.topDom, this.contentDom, this.bottomDom], {
            transition: 'all 300ms',
            transform: `translate3d(0, ${this.topContentDomHeight}px, 0)`
        })

        this._options.pullRefresh.call(this, this);
    },
    refreshComplete: function () {
        setStyles([this.topDom, this.contentDom, this.bottomDom], {
            transition: 'all 300ms',
            transform: 'translate3d(0, 0, 0)'
        });``
        setStyles([this.topContentDom], {
            transition: 'all 300ms'
        });
        this.setTopDomClipTop(this.topContentDomHeight);
        this.isRefreshing = false;
    },
    setTopDomClipTop: function (top) {
        this.topContentDom.style.clip = 'rect(' + top +'px '+
            this.topContentDomWidth + 'px '+ this.topContentDomHeight + 'px ' + ' 0)';
    },
    movingHandler: function () {
        if (this.isArrivedRefreshPort()) {
            this.arrivedRefreshPortHandler();
        }

        if (this.isOverRefreshPort()) {
            this.overRefreshPortHandler();
        } else {
            this.notEnoughRefreshPortHandler();
        }

        var distance = Math.max(this.distance, 0);
        if (distance === 0) {
            this.isMoving = false;
        }

        setStyles([this.topDom, this.contentDom, this.bottomDom], {
            transform: 'translate3d(0,' + distance + 'px, 0)'
        });

        this.setTopDomClipTop(Math.max(this.topContentDomHeight - distance, 0));
    },
    isArrivedRefreshPort: function () {
        var preDistance = this._options.calMovingDistance(this.prePageY - this.startPageY);
        return (this.distance >= this.topContentDomHeight && preDistance < this.topContentDomHeight) || (this.distance <= this.topContentDomHeight && preDistance > this.topContentDomHeight);
    },
    isTop: function () {
        return this.isGlobalScroll ? window.pageYOffset <= 0 : this.win.scrollTop <= 1
    },
    calMovingDistance(distance) {
        this.distance = this._options.calMovingDistance(distance)
    },
    overRefreshPortHandler() {
        //this._options.overRefreshPortHandler.call(this, this)
    },
    notEnoughRefreshPortHandler() {
        //this._options.notEnoughRefreshPortHandler.call(this, this);
    }
}