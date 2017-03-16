/**
 *
 Created by zhangzhao on 2017/3/7.
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

function throttle(func, wait, options) {
    var timeout, context, args, result;
    var previous = 0;
    if (!options) options = {};

    var later = function() {
        previous = options.leading === false ? 0 : Date.now();
        timeout = null;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
    };

    var throttled = function() {
        var now = Date.now();
        if (!previous && options.leading === false) previous = now;
        var remaining = wait - (now - previous);
        context = this;
        args = arguments;
        if (remaining <= 0 || remaining > wait) {
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }
            previous = now;
            result = func.apply(context, args);
            if (!timeout) context = args = null;
        } else if (!timeout && options.trailing !== false) {
            timeout = setTimeout(later, remaining);
        }
        return result;
    };

    throttled.cancel = function() {
        clearTimeout(timeout);
        previous = 0;
        timeout = context = args = null;
    };

    return throttled;
};

var generateHtml = function (str) {
    return '<div style="text-align:center;font-size:14px;line-height:50px;">' + str + "</div>";
}
var ScrollLoad = function (container, loadMoreFn, options) {
    this.defaults = {
            isInitLock: false,
            thredshold: 10,
            window: window,
            loadingHtml: generateHtml('加载中...'),
            noDataHtml: generateHtml('没有更多数据了...'),
            exceptionHtml: generateHtml('出现异常')
        };
    this.container = container;
    this.loadMoreFn = loadMoreFn;
    this._options = assign({}, this.defaults, options);
    this.isLock = this._options.isInitLock;
    this.hasMore = true;
    this.win = this._options.window;
    this.windowHeight = window.innerHeight; // 视口的高度

    this.createBottomDom();

    this.scrollListener = this.scrollListener.bind(this);

    this.scrollListenerWrapThrottle = throttle(this.scrollListener, 50);

    this.attachScrollListener();
}

ScrollLoad.prototype = {
    constructor: ScrollLoad,
    createBottomDom: function() {
        this.container.insertAdjacentHTML('beforeend','<div class="scrollload-bottom">' +this._options.loadingHtml+ '</div>')
        this.bottomDom = this.container.querySelector('.scrollload-bottom');
    },
    scrollListener: function () {
        if (this.isLock) {
            return;
        }
        if (this.isBottom()) {
            this.isLock = true;
            this.loadMoreFn.call(this, this);
        }
    },
    isBottom: function () {
        var bottomDomTop = this.bottomDom.getBoundingClientRect().top;

        var winHeight;
        if (this.win === window) {
            winHeight = this.windowHeight;
        } /*else {
            winHeight = this.win.getBoundingClientRect().height;
            bottomDomTop = bottomDomTop - this.win.getBoundingClientRect().top;
        }
*/
        console.log(bottomDomTop, winHeight);
        return bottomDomTop - winHeight <= this._options.thredshold;
    },
    attachScrollListener: function () {
        this.win.addEventListener('scroll', this.scrollListenerWrapThrottle);
        this.scrollListener();
    },
    unLock: function () {
        this.isLock = false;
        if (this.hasMore) {
            this.scrollListener();
        }
    },
    lock: function () {
        this.isLock = true;
    },
    noData: function () {
        this.lock();

        this.hasMore = false;
        this.showNoDataDom();

        this.detachScrollListner();
    },
    detachScrollListner: function () {
        this.win.removeEventListener('scroll', this.scrollListenerWrapThrottle);
    },
    showNoDataDom: function () {
        this.bottomDom.innerHTML = this._options.noDataHtml;
    },
    showExceptionDom: function () {
        this.bottomDom.innerHTML = this._options.exceptionHtml;
    },
    showLoadingDom: function () {
        this.bottomDom.innerHTML = this._options.loadingHtml;
    },
    throwException() {
        this.showExceptionDom();
    },
    solveException() {
        if (this.hasMore) {
            this.showLoadingDom();
            this.unLock();
        } else {
            this.showNoDataDom();
        }
    }
    
}