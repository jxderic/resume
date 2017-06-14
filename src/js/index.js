// Zepto
var $ = require('./components/zepto/zepto');
require('./components/zepto/event');
require('./components/zepto/ajax');
require('./components/zepto/form');
require('./components/zepto/ie');
require('./components/zepto/touch');

module.exports = $; 

// 引入Swiper

var Swiper = require('./components/swiper/swiper.min.js');
var swiperAnimate = require('./components/swiper/swiper.animate1.0.2.min.js');

var swiper = new Swiper ('.swiper-container', {
  onInit: function(swiper){ //Swiper2.x的初始化是onFirstInit
    swiperAnimate.swiperAnimateCache(swiper); //隐藏动画元素 
    swiperAnimate.swiperAnimate(swiper); //初始化完成开始动画
  }, 
  onSlideChangeEnd: function(swiper){ 
    swiperAnimate.swiperAnimate(swiper); //每个slide切换结束时也运行当前slide动画
  }
}) 

// 音乐播放器
var music = document.getElementById("music");
var audio = document.getElementsByTagName("audio")[0];

audio.addEventListener('ended', function () {  
    music.childNodes[1].setAttribute("class","music_disc");
}, false);


music.addEventListener("touchstart", function() {
    if (audio.paused) {
        audio.play();
        this.childNodes[1].setAttribute("class","music_disc music_play");
    } else {
        audio.pause();
        this.childNodes[1].setAttribute("class","music_disc");
    };
}, false);

var wx = require('./components/weixin/jweixin.js');

var IScroll = require('./components/iscroll/iscroll');
var myScroll;

function scan(){
    wx.scanQRCode({
        needResult: 0, // 默认为0，扫描结果由微信处理，1则直接返回扫描结果，
        scanType: ["qrCode","barCode"], // 可以指定扫二维码还是一维码，默认二者都有
        success: function (res) {
        var result = res.resultStr; // 当needResult 为 1 时，扫码返回的结果
    }
    });
}
function location(){
    wx.openLocation({
        latitude: 0, // 纬度，浮点数，范围为90 ~ -90
        longitude: 0, // 经度，浮点数，范围为180 ~ -180。
        name: '', // 位置名
        address: '', // 地址详情说明
        scale: 1, // 地图缩放级别,整形值,范围从1~28。默认为最大
        infoUrl: '' // 在查看位置界面底部显示的超链接,可点击跳转
    });
}
// ref https://github.com/WICG/EventListenerOptions/pull/30
function isPassive() {
    var supportsPassiveOption = false;
    try {
        addEventListener("test", null, Object.defineProperty({}, 'passive', {
            get: function () {
                supportsPassiveOption = true;
            }
        }));
    } catch(e) {}
    return supportsPassiveOption;
}

$("#mainContainer").hide();
$(".show").hide();  		  
// jquery/zepto
$("#enter").tap(function(){
    $(".show").hide();
    $("#mainContainer").show();

    $.ajax({
        url:'http://www.jxderic.online/weixinphp/getsign.php',
        type:'POST',
        data:{
            url:window.location.href
        },
        dataType:'json',
        success:function(res){
            wx.config({
                debug: true,
                appId: res.appId,
                timestamp: res.timestamp,
                nonceStr: res.nonceStr,
                signature: res.signature,
                jsApiList: [
                  // 所有要调用的 API 都要加到这个列表中
                  'scanQRCode','openLocation'
                ]
            });
            wx.ready(function(){
                $("#scan").tap(function(){
                    scan();
                })
                $("#location").tap(function(){
                    location();
                })
            });
        }
    })

    $.ajax({
        type:'GET',
        url:'./api/skill.php',
        dataType:'json',
        success:function(data){
            var html = "";
            for(var i=0;i<data.length;i++){
                html += '<li class="skill"><div class="icon"><img src="'+data[i].src+'" alt="html5"></div><div class="content"><p class="category">'+data[i].category+'</p><p class="name">'+data[i].name+'</p><div class="level">'+data[i].star+'<span>'+data[i].level+'</span></div></li>';
            }
            $("#scroller ul").html(html);
            $('#scroller').find('i').addClass('iconfont icon-unie61a');
            $('.skill').each(function(){
                if($(this).find('span').html()=='了解'){
                    $(this).find('i:nth-child(-n+3)').css({'color':'orange'});
                }else if($(this).find('span').html()=='熟悉'){
                    $(this).find('i:nth-child(-n+4)').css({'color':'orange'});
                }else if($(this).find('span').html()=='精通'){
                    $(this).find('i:nth-child(-n+5)').css({'color':'orange'});
                }
            }) 
            myScroll.refresh();  
        }
    })
})

myScroll = new IScroll('#wrapper', { useTransition: false });

document.addEventListener('touchmove', function (e) { e.preventDefault(); }, isPassive() ? {
    capture: false,
    passive: false
} : false);


$('.resume').find('li').on('tap',function(){
    $(this).addClass('active').siblings('li').removeClass('active');
})

$("#footer li").tap(function(){
    var apiTarget = $(this).attr('id');
    
    var apiUrl = "./api/" + apiTarget + ".php";

    $.ajax({
        type:'GET',
        url:apiUrl,
        dataType:'json',
        success:function(data){
            var html = "";
            for(var i=0;i<data.length;i++){
                if(apiTarget=='skill'){
                    html += '<li class="skill"><div class="icon"><img src="'+data[i].src+'" alt="html5"></div><div class="content"><p class="category">'+data[i].category+'</p><p class="name">'+data[i].name+'</p><div class="level">'+data[i].star+'<span>'+data[i].level+'</span></div></li>';
                    $('#header h2').html('技能');
                }else if(apiTarget=='project'){
                    html += '<li class="project"><div class="title"><h2>'+data[i].name+'</h2><p>'+data[i].category+'</p></div><div class="project_img"><img src="'+data[i].image+'"></div><div class="description">'+data[i].description+'</div><div class="detail">'+data[i].detail+'</div><div class="project_footer"><div class="tech"><span class="iconfont icon-skill"></span><span class="iconfont icon-skill"></span><span class="iconfont icon-skill"></span></div><div class="link"><a target="_blank" href="'+data[i].url+'">Try it</a></div></div></li>';
                    $('#header h2').html('项目');
                }else if(apiTarget=='work'){
                    html += '<li class="experience"><div class="title"><h2>'+data[i].name+'</h2><time>'+data[i].time+'</time></div><div class="experience_img"><img src="'+data[i].image+'"></div><div class="posts"><p>'+data[i].posts+'</p></div><div class="url"><a target="_blank" href="'+data[i].url+'">点击进入官网</a></div></li>';
                    $('#header h2').html('经历');
                }else if(apiTarget=='me'){
                    html += '<li class="me"><h2>个人概况</h2><div class="introduce"><div class="head"><img src="'+data[i].head+'" alt="head"></div><div class="info"><p class="name">'+data[i].name+'</p><p class="sex">'+data[i].sex+'</p><p class="home">'+data[i].home+'</p><p class="age">'+data[i].age+'</p><p class="phone">'+data[i].phone+'</p><p class="email">'+data[i].email+'</p></div></div><div class="edu"><div class="edu_left"><p class="education">'+data[i].education+'</p><p class="shool">'+data[i].shool+'</p></div><div class="edu_right"><p class="graduate">'+data[i].graduate+'</p><p class="major">'+data[i].major+'</p></div></div><div class="work"><p class="intension">'+data[i].intension+'</p><p class="work_exp">'+data[i].work_exp+'</p></div><h2>技术探索</h2><div class="study"><p class="study1">'+data[i].study1+'</p></div><h2>自我评价</h2><div class="self-assessment"><p>'+data[i].self+'</p></div><h2>博客、简历地址</h2><div class="url"><a target="_blank" href="http://blog.jxderic.xyz/">个人博客：http://blog.jxderic.xyz/</a><a target="_blank" href="https://github.com/jxderic">Github地址：https://github.com/jxderic</a><a target="_blank" href="https://yanshuo.io">个人简历地址：</a></div></li>';
                    $('#header h2').html('我');
                }
            }
            $("#scroller ul").html(html);

            if(apiTarget=='skill'){
                $('#scroller').find('i').addClass('iconfont icon-unie61a');
                $('.skill').each(function(){
                    if($(this).find('span').html()=='了解'){
                        $(this).find('i:nth-child(-n+3)').css({'color':'orange'});
                    }else if($(this).find('span').html()=='熟悉'){
                        $(this).find('i:nth-child(-n+4)').css({'color':'orange'});
                    }else if($(this).find('span').html()=='精通'){
                        $(this).find('i:nth-child(-n+5)').css({'color':'orange'});
                    }
                })
            } 

            myScroll.refresh(); 
        }
    })

})



var interval  = setInterval(function(){
    if(document.readyState === 'complete'){
        clearInterval(interval);
        $("#loading").hide();
        $(".show").show();
        swiper.updateContainerSize(); // 万分重要
        swiper.updateSlidesSize(); // 万分重要
    }else{
        $("#loading").show();
    }
})