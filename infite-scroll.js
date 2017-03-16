/**
 *
 Created by zhangzhao on 2017/3/14.
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

function generateHtml(html) {
    return '<div style="text-align:center;font-size:14px;line-height:50px;">' + html + '</div>';
}
function InfiniteScroll(container, loadMoreFn, opts) {
    this.defaults = {
        initLock: false,
        thredshold: 10,
        loadingHtml: generateHtml('加载中...'),
        noDataHtml: generateHtml('没有更多数据...'),
        exceptionHtml: generateHtml('加载异常...')
    }
    this._options = assign({}, this.defaults, opts);
    this.container = container;
    this.win = window;
    this.hasMore = true;

    this.isLock = this.initLock;
    this.loadMoreFn = loadMoreFn;
    this.scrollListener = this.scrollListener.bind(this);

    this.scrollListenerWrapThrottle = throttle(this.scrollListener, 50);

    this.createBottomDom();

    this.attachScrollListener();
}

InfiniteScroll.prototype = {
    constructor: InfiniteScroll,
    createBottomDom: function () {
        this.container.insertAdjacentHTML('beforeend', '<div class="scrollload-bottom">' + this._options.loadingHtml + '</div>');
        this.bottomDom = document.querySelector('.scrollload-bottom');
    },
    isBottom() {
        let domBottom = this.bottomDom.getBoundingClientRect().top;
        let winHeight = window.innerHeight;
        return domBottom - winHeight < this._options.thredshold;
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
    showNoDataDom: function () {
      this.bottomDom.innerHTML = this._options.noDataHtml;
    },
    showExceptionDom: function () {
      this.bottomDom.innerHTML = this._options.exceptionHtml;
    },
    noData: function () {
      this.lock();
      this.hasMore = false;
      this.showNoDataDom();
      this.detachScrollListner();
    },
    lock: function () {
      this.isLock = true;
    },
    unLock: function () {
      this.isLock = false;
      if (this.hasMore) {
          this.scrollListener();
      }
    },
    attachScrollListener: function () {
        this.win.addEventListener('scroll', this.scrollListenerWrapThrottle);
        this.scrollListener();
    },
    detachScrollListner: function () {
        this.win.removeEventListener('scroll', this.scrollListenerWrapThrottle);
    },
    throwException:function () {
        this.showExceptionDom();
    },
    solveException: function () {
        if (this.hasMore) {
            this.showLoadingDom();
            this.unLock();
        } else {
            this.showNoDataDom();
        }
    }
}