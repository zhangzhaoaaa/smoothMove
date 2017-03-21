
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

let page = 1
const scrollload = new Scrollload({
    // 你也可以关闭下拉刷新
    enablePullRefresh: true,
    pullRefresh: function (sl) {
        $.ajax({
            type: 'GET',
            url: 'https://fa-ge.github.io/Scrollload/gamelist.json?page='+Math.floor(Math.random() * 100),
            dataType: 'json',
            success: function(data){
                $(sl.contentDom).prepend(getData(data))

                // 处理完业务逻辑后必须要调用refreshComplete
                sl.refreshComplete()
            }
        })
    },
    noMoreDataHtml: `
            <div style="line-height: 50px;text-align: center;font-size: 12px">
                <span>真的拉不出新东西了~</span><a class="clickHandler" style="color: red;font-size: 16px">点我重新刷新</a>
            </div>
`,
})



