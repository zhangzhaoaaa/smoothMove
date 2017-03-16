var data = [
    {
        image: 'http://imagesrcdola.b0.upaiyun.com/0/20141222121421_798.jpg',
        name: '画圆圈',
        label: '创意游戏',
        desc: '动手画个圆，你行吗？'
    },
    {
        image: 'http://imagesrcdola.b0.upaiyun.com/0/20150611143728_164.png',
        name: '英雄难过棍子关',
        label: '创意游戏',
        desc: '动手画个圆，你行吗？'
    },
    {
        image: 'http://imagesrcdola.b0.upaiyun.com/0/20150403115426_276.jpg',
        name: '胸口碎大石',
        label: '创意游戏',
        desc: '动手画个圆，你行吗？'
    },
    {
        image: 'http://imagesrcdola.b0.upaiyun.com/0/20150611160815_643.jpg',
        name: '酒后别开车',
        label: '创意游戏',
        desc: '动手画个圆，你行吗？'
    },
    {
        image: 'http://imagesrcdola.b0.upaiyun.com/0/20150715225730_758.jpg',
        name: '是男人就去优衣库',
        label: '创意游戏',
        desc: '动手画个圆，你行吗？'
    }
]

function getData() {
    return Array.from(new Array(5)).map(function () {
        var item = data[Math.floor(Math.random() * 5)]
        return ' <li><p>'+item.name+'</p>' +
                    '<span>'+item.label+'</span>' +
                    '<p>'+item.desc+'</p> </li>'
    }).join('')
}
var count = 0
/*var scrollload = new ScrollLoad(document.querySelector('.container'), function(sl){
    setTimeout(function () {
        if (count++ < 5) {
            document.querySelector('.list').insertAdjacentHTML('beforeend', getData())
            sl.unLock()
        } else {
            sl.noData()
        }
    }, 500)
})*/
var scrollload = new InfiniteScroll(document.querySelector('.container'), function(sl){
    setTimeout(function () {
        if (count++ < 5) {
            document.querySelector('.list').insertAdjacentHTML('beforeend', getData())
            sl.unLock()
        } else {
            sl.noData()
        }
    }, 500)
})
