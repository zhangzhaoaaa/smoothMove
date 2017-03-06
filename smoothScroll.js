/**
 *
 Created by zhangzhao on 2017/3/4.
 Email: zhangzhao@gomeplus.com
 */

var easeInOutCubic = function (t) {
    return t < 0.5 ? 4 * t * t * t:(t-1)*(2*t-2)*(2*t-2)+1;
}
var position = function(start, end ,elapsed, duration) {
    if (elapsed > duration) {
        return end;
    }
    return start + (end - start) * easeInOutCubic(elapsed / duration);
}
var getTop = function (ele, start) {
    if (ele.nodeName === 'HTML') {
        return -start;
    } else {
        return ele.getBoundingClientRect().top + start;
    }
}

var smoothScroll = function(el, duration, callback, context) {
    duration = duration || 500;
    context = context || window;
    var start = context.scrollTop || window.pageYOffset;

    var end = getTop(el, start);

    var clock = Date.now();
    var requestAnimationFrame = window.requestAnimationFrame ||
            window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame ||
            function (fn) {window.setTimeout(fn, 15);};
    var step = function () {
        var elapsed = Date.now() - clock;
        window.scrollTo(0, position(start, end, elapsed, duration));

        if (elapsed > duration) {
            if (typeof callback === 'function') {
                callback(el);
            }
        } else {
            requestAnimationFrame(step);
        }
    }
    step();
}

document.getElementById('btn').
    addEventListener('click', function() {
    smoothScroll(document.body, 500, function(el) {
        console.log(el);
    });
});
