function Page(_ref) {
    var pageSize = _ref.pageSize,
        pageTotal = _ref.pageTotal,
        curPage = _ref.curPage,
        id = _ref.id,
        getPage = _ref.getPage,
        showPageTotalFlag = _ref.showPageTotalFlag,
        showSkipInputFlag = _ref.showSkipInputFlag,
        pageAmount = _ref.pageAmount,
        dataTotal = _ref.dataTotal;
    if(!pageSize){
        pageSize = 0
    };
    if(!pageSize){
        pageSize = 0
    };
    if(!pageTotal){
        pageTotal = 0
    };
    if(!pageAmount){
        pageAmount = 0
    };
    if(!dataTotal){
        dataTotal = 0
    };
    this.pageSize = pageSize || 5; //分页个数
    this.pageTotal = pageTotal; //总共多少页
    this.pageAmount = pageAmount; //每页多少条
    this.dataTotal = dataTotal; //总共多少数据
    this.curPage = curPage || 1; //初始页码
    this.id = id;
    this.pagination = document.getElementById(this.id);
    this.getPage = getPage;
    this.showPageTotalFlag = showPageTotalFlag || false; //是否显示数据统计
    this.showSkipInputFlag = showSkipInputFlag || false; //是否支持跳转
    if(dataTotal >0 &&pageTotal>0){
        this.init();
    }else{
        console.error("总页数或者总数据参数不对")
    }
};

// 给实例对象添加公共属性和方法
Page.prototype = {
    init: function init() {
        // var pagination = document.getElementById(this.id);
        // pagination.innerHTML = '';
        this.pagination.innerHTML = '';
        var that = this;
        //首页
        that.firstPage();
        //上一页
        that.lastPage();
        //分页
        that.getPages().forEach(function (item) {
            var a = document.createElement('a');
            if (item == that.curPage) {
                a.className = 'active';
            } else {
                a.onclick = function () {
                    that.curPage = parseInt(this.innerHTML);
                    that.init();
                    that.getPage(that.curPage);
                };
            }
            a.innerHTML = item;
            a.href = 'javascript:;';
            that.pagination.appendChild(a);
        });
        //下一页
        that.nextPage();
        //尾页
        that.finalPage();

        //是否支持跳转
        if (that.showSkipInputFlag) {
            that.showSkipInput();
        }
        //是否显示总页数,每页个数,数据
        if (that.showPageTotalFlag) {
            that.showPageTotal();
        }
    },
    //首页
    firstPage: function firstPage() {
        var that = this;
        var a = document.createElement('a');
        a.innerHTML = '首页';
        a.className = 'first';
        a.href = 'javascript:;';
        this.pagination.appendChild(a);
        a.onclick = function () {
            var val = parseInt(1);
            that.curPage = val;
            that.getPage(that.curPage);
            that.init();
        };
    },
    //上一页
    lastPage: function lastPage() {
        var that = this;
        var a = document.createElement('a');
        a.href = 'javascript:;';
        a.innerHTML = '<';
        if (parseInt(that.curPage) > 1) {
            a.onclick = function () {
                that.curPage = parseInt(that.curPage) - 1;
                that.init();
                that.getPage(that.curPage);
            };
        } else {
            a.className = 'disabled';
        }
        this.pagination.appendChild(a);
    },
    //分页
    getPages: function getPages() {
        var pag = [];
        if (this.curPage <= this.pageTotal) {
            if (this.curPage < this.pageSize) {
                //当前页数小于显示条数
                var i = Math.min(this.pageSize, this.pageTotal);
                while (i) {
                    pag.unshift(i--);
                }
            } else {
                //当前页数大于显示条数
                var middle = this.curPage - Math.floor(this.pageSize / 2),
                    //从哪里开始
                    i = this.pageSize;
                if (middle > this.pageTotal - this.pageSize) {
                    middle = this.pageTotal - this.pageSize + 1;
                }
                while (i--) {
                    pag.push(middle++);
                }
            }
        } else {
            console.error('当前页数不能大于总页数');
        }
        if (!this.pageSize) {
            console.error('显示页数不能为空或者0');
        }
        return pag;
    },
    //下一页
    nextPage: function nextPage() {
        var that = this;
        var a = document.createElement('a');
        a.href = 'javascript:;';
        a.innerHTML = '>';
        if (parseInt(that.curPage) < parseInt(that.pageTotal)) {
            a.onclick = function () {
                that.curPage = parseInt(that.curPage) + 1;
                that.init();
                that.getPage(that.curPage);
            };
        } else {
            a.className = 'disabled';
        }
        this.pagination.appendChild(a);
    },
    //尾页
    finalPage: function finalPage() {
        var that = this;
        var a = document.createElement('a');
        a.innerHTML = '尾页';
        a.className = 'last';
        a.href = 'javascript:;';
        this.pagination.appendChild(a);
        a.onclick = function () {
            var yyfinalPage = that.pageTotal;
            var val = parseInt(yyfinalPage);
            that.curPage = val;
            that.getPage(that.curPage);
            that.init();
        };
    },
    //是否支持跳转
    showSkipInput: function showSkipInput() {
        var that = this;
        var p = document.createElement('p');
        p.className = 'totalPage';
        p.className = 'pageRemark';
        var span1 = document.createElement('span');
        span1.innerHTML = '跳转到';
        p.appendChild(span1);
        var input = document.createElement('input');
        input.setAttribute("type","number");
        input.onkeydown = function (e) {
            var oEvent = e || event;
            if (oEvent.keyCode == '13') {
                var val = parseInt(oEvent.target.value);
                if (typeof val === 'number' && val <= that.pageTotal && val>0) {
                    that.curPage = val;
                    that.getPage(that.curPage);
                }else{
                    alert("请输入正确的页数 !")
                }
                that.init();
            }
        };
        p.appendChild(input);
        var span2 = document.createElement('span');
        span2.innerHTML = '页';
        p.appendChild(span2);
        this.pagination.appendChild(p);
    },
    //是否显示总页数,每页个数,数据
    showPageTotal: function showPageTotal() {
        var that = this;
        var p = document.createElement('p');
        p.className = 'pageRemark';
        p.innerHTML = '共<b>'+ that.pageTotal +'</b>页<b> '+ that.dataTotal +'</b>条数据'
        this.pagination.appendChild(p);
    }
};
