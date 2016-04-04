function showOrhide(arrNames,className){  
				for(var i=0;i<arrNames.length;i++){
					arrNames[i].css("display","none"); 
				}
				className.css("display","block"); 
			}

			$(function(){
				var start_panel=$(".start-play");    //开始界面
				var pass_panel=$(".pass-panel");    //关卡页面
				var main_panel=$(".main-panel");   //主界面
				var rank_panel=$(".ranking");    //排行榜页面
				var panels=[];
				panels.push(start_panel);
				panels.push(pass_panel);
				panels.push(main_panel);
				panels.push(rank_panel);
				//获得cookie值
				//查看cookie中存放的记录（[{passlevel(关卡): , maxRecord(每一关的最高记录):,最高记录对应时长:,},{}]）
				//若没有数据 初始化下数据
				var data=localStorage.getItem("guanQia"),
				data=JSON.parse(data);
				if(!data){
					var guanQia={
						1:{passlevel:1,maxRecord:1000,time:2},
						2:{passlevel:2,maxRecord:1000,time:3}
					}				
					guanQia=JSON.stringify(guanQia);
					localStorage.setItem("guanQia",guanQia);
				}

				

				$("#gameRecode").on("click",function(e){
					showOrhide(panels,pass_panel);
					//查看cookie中存放的记录（passlevel(关卡):  maxRecord(每一关的最高记录)）
					var passlevel=localStorage.getItem(passlevel)||1;
					$("#now-level").css("background-image","url(images/number"+passlevel+".png)");
					//点击返回按钮 返回主页面
					$("#back-btn").on("click",function(){
						showOrhide(panels,start_panel);

					})
				});

				//点击进入排行榜页面
				$("#gameRank").on("click",function(e){
					showOrhide(panels,rank_panel);
					//查看localstorage中的记录 初始化排行榜界面
					var data=localStorage.getItem("guanQia"),
					    time=0,
					    star=0,
					    str="";
					data=JSON.parse(data);
					for(var i=1;i<=6;i++){
						if(!data[i]){
							//未有历史记录
							time=0;
							star=0;
							str+="<div class=\"rank"+i+" rankshow\"><div class='rankmask'><em class='wordstart'></em></div><span class='pic'></span><div class='guanQia rankblock' ><span>关卡</span><span class='guanqia-time'>"+i+"</span></div><div class='score rankblock' ><span>用时</span><span class='rank-time'>"+time+"</span></div><div class='starper rankblock'><span>星级</span><span class='rankstar'>"+star+"</span></div></div>";
						}else{
							time=data[i].time;
							star=getStar(time);
							str+="<div class=\"rank"+i+" rankshow\"><span class='pic'></span><div class='guanQia rankblock' ><span>关卡</span><span class='guanqia-time'>"+i+"</span></div><div class='score rankblock' ><span>用时</span><span class='rank-time'>"+time+"</span></div><div class='starper rankblock'><span>星级</span><span class='rankstar'>"+star+"</span></div></div>";
						}
						
console.log(i+":time"+time+",star:"+star)
						
						
					}
					$(".rankPanel").html(str);    
				});

				$("#back-btn3").on("click",function(e){
					window.location.href="link-link3.html";
				})

				//点击开始游戏进入主页面
				$("#gameStart").on("click",function(e){
					showOrhide(panels,main_panel);
				})

				//根据cookie值初始化关卡页面
				//时间少于2分钟3颗星  少于4分钟2颗星 其他1颗星
				function getStar(time){
					//获得星星数
					var star=0;
					if(time<=2){
						star=3;
					}else if(time<=4&&time>2){
						star=2;
					}else{
						star=1;
					}
					return star;
				}
				function drawLevel(){
					 
					var data=localStorage.getItem("guanQia"),
						level=0,
						star=0,
						timeLine=0;
					data=JSON.parse(data);
					//初始化界面 把界面置空
					$(".level-list .small-star").removeClass("starfull");
					$(".level-list .maskLayer").css("display","block"); 
					for(var i=0;;i++){
						if(!data[i+1]){
							break;
						}
						level=data[i+1].passlevel;
						timeLine=data[i+1].time;
						maxRecord=data[i+1].maxRecord;
						star=getStar(timeLine);

						var length=$(".level-list>li").length;
						$(".level-list .maskLayer").eq(i).css("display","none"); 
						//点亮星星
						for(var j=0;j<star;j++){
							$(".level-list>li").eq(i).find(".small-star").eq(j).addClass("starfull");
						}
						//点击进去进入相应关卡
						//使用闭包保存变量i
						(function(i){
							$(".level-list>li").eq(i).on("click",function(e){
							     console.log(i);
							     window.location.href="startPlay.html?guanQia="+(i+1);
							})
						})(i)

					}
					
				}
				drawLevel();

				//点击开始游戏按钮  查看localstorage到第几关  直接跳到那一关
				$("#gameStart").on("click",function(){
					var recode=localStorage.getItem("guanQia");
					recode=JSON.parse(recode);
					var maxguanQia=0;
					for(var i=1;i<=6;i++){
						if(!recode[i]){
							maxguanQia=i;
							break;
						}
					}
					window.location.href="startPlay.html?guanQia="+maxguanQia;
				})
			})