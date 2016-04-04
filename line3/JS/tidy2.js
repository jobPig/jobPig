$(function(){
var gameMove=function(){
	this.SCORE=0;
	this.preCheck=null;      ////前一个点击的位置
	this.line=new lineToLine();
	this.ROW=this.line.gameRow;
	this.COL=this.line.gameCol;
	this.startDate=new Date().getTime();      //开始时时间
	this.guanQia=1;
	this.timeDraw=new timeDraw();    //倒计时
}

gameMove.prototype={
	init:function(){
		// 初始化界面
		this.timeDraw.draw();
		this.line.init();
		//解析URL获得guanQia值
		var href=window.location.href;  
		var arr=this.parseHref(href);
		this.guanQia=parseInt(arr["guanQia"])||1;

		var that=this;
		$("#now-level").css("background-image","url(images/number"+this.guanQia+".png)");
		$("#back-btn2").on("click",function(e){
			//清除计时
			
			$(".askPanel").css("display","block");
			$("#yes").on("click",function(e){
				$(".askPanel").css("display","none");
				window.location.href="link-link3.html";
				that.timeDraw.stop();
			});
			$("#no").on("click",function(e){
				$(".askPanel").css("display","none");
				
				
			})
			
		});
		//点击事件
		this.spanClick();
		//计时（当超过总时间显示失败页面）
		var count=0;
		var countTime=setInterval(function(){
			
			if(count>=that.timeDraw.timeSum*60){
console.log("到时间  失败...");		
				$(".resultPanel").css("display","block");
				var endDate=new Date().getTime();
				var timeDiffer=endDate-this.startDate;

				that.successOrfail(false,that.guanQia,that.SCORE,that.timeDraw.timeSum*60*1000);
				clearInterval(countTime);
				count=0;
				// that.timeDraw.stop();
				var _that=that;
				//点击 消失
				$(document).on("click",function(e){
					var _this=_that;
					$(".resultPanel").css("display","none");
					$(".askPanel").css("display","block");
					$("#ask-word").html("leave??");
					$("#yes").html("YES");
					$("#no").html("NO");
					$("#yes").on("click",function(e){
						$(".askPanel").css("display","none");
						window.location.href="link-link3.html";
					});
					$("#no").on("click",function(e){

						$(".askPanel").css("display","none");
						// 初始化界面
						_this.timeDraw.draw();
						_this.line.init();
						
						
					})
					
				})
			}
			count++;
		},1000);
	},
	parseHref:function(href){
    	var arr=href.split("?")[1];
    	var result={};
    	if(arr){
    		var keyValue=arr.split("=");
    		if(keyValue){
    			var key=keyValue[0];
    			var value=keyValue[1];
    			result[key]=value;
    		}
    	}
    	return result;
    },
    // 主界面点击消除方块
    spanClick:function(){
    	var spans=$(".piece");
    	var that=this;
    	spans.on("click",function(e){
				var target=e.target.parentNode;
				var row=target.row;      //点击目标的行
				var col=target.col;      //点击目标的列
				var src=that.line.iconDiv[row][col].src;        //获取点击目标的src值  
$(target).addClass("selected");			
				if(!that.preCheck){    
					//第一次点击没有点击数
					that.preCheck=target;   
				}else{   
					//第二次点击
					//判断是否是同一张图片
					if(!that.isPosition(that.preCheck,target)){
						//判断图片是否一样
						if(src==that.line.iconDiv[that.preCheck.row][that.preCheck.col].src){
							//图片一致
							console.log("same picture:"+src);
console.log(that.line.iconDiv)							
							if(that.hasPath(that.line.iconDiv,target,that.preCheck)){
								//如果图片可以抵消
								//两图片可以抵消							
								
								that.line.iconDiv[row][col].src=-1;
								that.line.iconDiv[that.preCheck.row][that.preCheck.col].src=-1;	
								$(target).css("display","none");
								$(that.preCheck).css("display","none");
								that.preCheck=null;	
								
							}else{
								//两图片不能抵消
								$(that.preCheck).removeClass("selected");	
								that.preCheck=target;

							}
					

						}else{
							//图片不一致
							$(that.preCheck).removeClass("selected");	
							that.preCheck=target;

						}
					}
					
				
				}
				
			});
    },
	//判断两次点击是否点击的是同一个位置
	isPosition:function(obj1,obj2){
		if(obj1.row==obj2.row&&obj1.col==obj2.col){
			return true;
		}
		return false;
	},
	hasPath:function(iconDiv,obj1,obj2){
				
			//两张图片相同
			var path=this.searchPath(iconDiv,obj1.row,obj1.col,obj2.row,obj2.col);
			//0转弯得到的空路径集合和结果集
			var road0=path.road;
			var turn0=path.result; 
			console.log('1个转弯结果集为：'+turn0.length);
			//1次拐角的空路径和结果集\
			var road1=[];
			var turn1=[];
			for(var i=0;i<road0.length;i++){
				var path1=this.searchPath(iconDiv,road0[i].row,road0[i].col,obj2.row,obj2.col);
				road1=road1.concat(path1.road);
				turn1=turn1.concat(path1.result);
			}
			

       		//console.log('1个转弯空路径为：'+road1.length);
			//printArr(road1);

			console.log('1个转弯结果集为：'+turn1.length);
			var newRoad1=this.distinct(road1,road0);  
			//console.log('去重后1个转弯空路径为：'+newRoad1.length);
			//printArr(newRoad1);

			//2次拐角的结果集和空路径
			var road2=[];
			var turn2=[];
			for(var i=0;i<road1.length;i++){
				var path2=this.searchPath(iconDiv,road1[i].row,road1[i].col,obj2.row,obj2.col);
				road2=road2.concat(path2.road);
				turn2=turn2.concat(path2.result);
			}
			console.log('2个转弯空路径为：'+road1.length);
			//printArr(road1);
			console.log('2个转弯结果集为：'+turn2.length);
			//去重
			var newRoad2=this.distinct(road2,road0.concat(newRoad1));
			//console.log('去重后2个转弯空路径为：'+newRoad2.length);
				//printArr(newRoad2);

			//判断是否可以联通
			console.log('clear:'+obj1.row+'行'+obj1.col+'列,元素为:'+iconDiv[obj1.row][obj1.col].src);
			if(turn0.length>0||turn1.length>0||turn2.length>0){
				this.SCORE+=2*10;
				//分数同步到界面
				var result=this.format(this.SCORE,4);
console.log('可以联通,score:'+result);
				this.dataToPic(result);
				//判断是否已经成功(即总分为10*10*10)
				if(this.SCORE>=1000){
					//成功  结果页面显示
					var endDate=new Date().getTime();
					var timeDiffer=endDate-this.startDate;
console.log("时间差："+timeDiffer);	
					this.successOrfail(true,this.guanQia,this.SCORE,timeDiffer);
					//把记录存入localstorage
					var recode=localStorage.getItem("guanQia");
console.log("记录:"+recode);		
					recode=JSON.parse(recode);				
					if(recode[this.guanQia]){
						//存在该关卡记录(若最小时间大于此次记录事件 则换)
						if(recode[this.guanQia].time>(timeDiffer/1000)/60){
							recode[this.guanQia].time=((timeDiffer/1000)/60).toFixed(2);
						}
					}else{
						recode[this.guanQia]={
							passlevel:this.guanQia,
							maxRecode:this.SCORE,
							time:((timeDiffer/1000)/60).toFixed(2)
						}
					}
					recode=JSON.stringify(recode);
					localStorage.setItem("guanQia",recode);
console.log("记录recode更新:"+localStorage.getItem("guanQia"));

					//点击 消失
					var _that=this;
					$(document).on("click",function(e){
						$(".resultPanel").css("display","none");
						$(".askPanel").css("display","block");
						$("#ask-word").html("leave or move on??");
						$("#yes").html("leave");
						$("#no").html("go on");
						$("#yes").on("click",function(e){
							$(".askPanel").css("display","none");
							window.location.href="link-link3.html";
						});
						$("#no").on("click",function(e){
							
							// 初始化界面
							window.location.href="startPlay.html?guanQia="+(_that.guanQia+1);
							
						})
						
					})					
				}
				//求最短路径
				//消除（把psrc置为-1）
// clearObj(iconDiv,obj1,obj2);
				return true;
			}else{
				console.log('不可以联通');
				return false;
			}

		
	},
	format:function(num,fill){
		var len=(num+'').length;
		return (Array(fill>len?fill-len+1||0:0).join(0)+num);
		
	},
		//找路径
		//零个转弯,下标为-1的放进数组中
		

		//结果集:reault0,result1,result2(零个拐角，1个，两个),会有重合，最后要去除重复值

	searchPath:function(iconDiv,r1,c1,r2,c2){
		var roadZero=[];
		var results=[];          //[{arr:  step:3 },{},{}]
		var i=0;
		var j=0;
		//向左
		var countLeft=0;

		for(i=r1,j=c1-1;j>=0;j--)
		{
			if(iconDiv[i][j].src==-1){console.log('向左'+i+'行'+j+'列是-1');
				countLeft++;
				roadZero.push(iconDiv[i][j]);
			}else{
				//该区域不是空的，退出循环
				if(i==r2&&j==c2){
					//要找的结果,放进结果集合里
					var resultobj={};      //{arr:  ,step:3}
					resultobj.arr=iconDiv[i][j];
					resultobj.step=countLeft;        //步数

					results.push(resultobj);
					console.log('向左'+i+'行'+j+'列不是-1,是结果'+iconDiv[i][j].src);
				}
				console.log('向左'+i+'行'+j+'列不是-1,是'+iconDiv[i][j].src);
				
				break;
			}
		}
		//向右
		var countRight=0;
		for(i=r1,j=c1+1;j<this.COL+2;j++){
			if(iconDiv[i][j].src==-1){console.log('向右'+i+'行'+j+'列是-1');
				countRight++;
				roadZero.push(iconDiv[i][j]);
			}else{

				//该区域不是空的，退出循环
				if(i==r2&&j==c2){
					//要找的结果,放进结果集合里
					var resultobj={};      //{arr:  ,step:3}
					resultobj.arr=iconDiv[i][j];
					resultobj.step=countRight;        //步数

					results.push(resultobj);
					console.log('向右'+i+'行'+j+'列不是-1,是结果'+iconDiv[i][j].src);
				}
				console.log('向右'+i+'行'+j+'列不是-1,是'+iconDiv[i][j].src);
				console.log('i='+i+',j='+j+',r2='+r2+',c2='+c2+',i==r2&&j==c2是否为真：'+(i==r2&&j==c2));
				break;
			}

		}
		//向上
		var countUp=0;
		for(i=r1-1,j=c1;i>=0;i--){
			if(iconDiv[i][j].src==-1){console.log('向上'+i+'行'+j+'列是-1');
				countUp++;
				roadZero.push(iconDiv[i][j]);
			}else{
				//该区域不是空的，退出循环
				if(i==r2&&j==c2){
					//要找的结果,放进结果集合里
					var resultobj={};      //{arr:  ,step:3}
					resultobj.arr=iconDiv[i][j];
					resultobj.step=countUp;        //步数

					results.push(resultobj);
					console.log('向上'+i+'行'+j+'列不是-1,是结果'+iconDiv[i][j].src);
				}
				console.log('向上'+i+'行'+j+'列不是-1,是'+iconDiv[i][j].src);
				break;
			}

		}


		//向下
		var countDown=0;
		for(i=r1+1,j=c1;i<this.ROW+2;i++){
			if(iconDiv[i][j].src==-1){console.log('向下'+i+'行'+j+'列是-1');
				countDown++;
				roadZero.push(iconDiv[i][j]);
			}else{
				//该区域不是空的，退出循环
				if(i==r2&&j==c2){
					//要找的结果,放进结果集合里
					var resultobj={};      //{arr:  ,step:3}
					resultobj.arr=iconDiv[i][j];
					resultobj.step=countDown;        //步数

					results.push(resultobj);
					console.log('向下'+i+'行'+j+'列不是-1,是结果'+iconDiv[i][j].src);
				}
				console.log('向下'+i+'行'+j+'列不是-1,是'+iconDiv[i][j].src);
				break;
			}

		}

			return {
				result:results,
				road:roadZero
			};
	},
	//数组去重,自身去重，若含有上级元素也去掉
	distinct:function(arr,parent){
		var newArr=[];
		//根据行排序
		arr.sort(function(obj1,obj2){
			if(obj1.row==obj2.row){
				return obj1.col-obj2.col;
			}else{
				return obj1.row-obj2.row;
			}
		});
		
		var j=-1;
		for(var i=0;i<arr.length;i++){
			if(!this.isInParent(arr[i],parent)){
				if(newArr.length==0){
					newArr.push(arr[i]);
					j=0;
				}
				  if(newArr[j].row!=arr[i].row||newArr[j].col!=arr[i].col){
					//不相等就添加至newarr中
				    newArr.push(arr[i]);
				    j++;
				}

			}
			
		}
		return newArr;
	},
	isInParent:function(obj,parent){
		for(var i=0;i<parent.length;i++){
			if(this.isPosition(parent[i],obj)){
				//相同
				return true;
			}
		}
		return false;
	},
	//把数据转成图片
	dataToPic:function(data){
	   var thousand=data.substr(0,1);
	   var hundred=data.substr(1,1);
	   var ten=data.substr(2,1);
	   var unit=data.substr(3,1);
	   $("#thousand").css("background-image","url(images/number"+thousand+".png)");
	   $("#hundred").css("background-image","url(images/number"+hundred+".png)");
	   $("#ten").css("background-image","url(images/number"+ten+".png)");
	   $("#unit").css("background-image","url(images/number"+unit+".png)"); 
	},
	//成功后显示结果页面
	successOrfail:function(issuccess,level,score,time){
		//time为毫秒  score为int
		$(".resultPanel").css("display","block");
		if(issuccess){
			//成功
			$("#result_pos").css("background-image","url(images/gamepic/gsuccess.png)");
		}else{
			$("#result_pos").css("background-image","url(images/gamepic/gfail.png)");
		}
		
		$("#resultLevel").css("background-image","url(images/gamepic/gnum"+level+".png)");
		score=this.format(score,4);
		$("#thousand_result").css("background-image","url(images/gamepic/gnum"+score.substr(0,1)+".png)");
		$("#hundred_result").css("background-image","url(images/gamepic/gnum"+score.substr(1,1)+".png)");
		$("#ten_result").css("background-image","url(images/gamepic/gnum"+score.substr(2,1)+".png)");
		$("#unit_result").css("background-image","url(images/gamepic/gnum"+score.substr(3,1)+".png)");
		var a=(time/1000)/60;
		var min=Math.floor(a);
		var sec=parseInt((a-min)*60)||0;
		$("#time_min").css("background-image","url(images/gamepic/gnum"+min+".png)");
		$("#time_sec1").css("background-image","url(images/gamepic/gnum"+parseInt(sec/10)+".png)");
		$("#time_sec2").css("background-image","url(images/gamepic/gnum"+sec%10+".png)");
		//停止时间运动
		this.timeDraw.stop();
	}
}


//界面初始化
var lineToLine=function(){
			this.gameRow=10;   //行列
			this.gameCol=10;
			this.iconArr=[];     //存放图片的列表
			this.iconDiv=[];    //存放图片div的列表 格式[{x: 0,y:0 ,src:iconArr[0]},{},{}...]
			this.woodWidth=50;
			this.picSum=10;      //可被分配的图片数量


}
//图片的构造函数
function pic(row,col,src){
	this.row=row;
	this.col=col;
	this.src=src;
}
lineToLine.prototype={
	init:function(){
		this.clearGame();
		this.drawGame();
	},
	createIconArr:function(){
		//生成图片列表，图片个数需要双数（方法，每次随机生成一张图，个数*2）
		var cycle=parseInt((this.gameRow*this.gameCol)/2);  //循环次数
		var img;
		for(var i=0;i<cycle;i++){
			img=Math.floor(Math.random()*this.picSum)+1;
			this.iconArr.push(img);
			this.iconArr.push(img);
		}
		this.iconArr=this.shuffle(this.iconArr);
	},
	shuffle:function(aArr){
		//随机打乱数组
		var iLength=aArr.length;
		 var i=iLength;
		 var mTemp,iRandom;
		 while(i--){
		 	iRandom=Math.floor(Math.random()*iLength);
		 	if(i!==iRandom){
		 		mTemp=aArr[i];
		 		aArr[i]=aArr[iRandom];
		 		aArr[iRandom]=mTemp;
		 	}
		 }  
		 return aArr;
	},
	map:function(){                         //建地图iconDiv
		   this.createIconArr();             //初始化iconArr 即创建双数的图片数组
		   this.iconDiv=new Array(); 
		   var oPic=""; 
		   var count=0;         
		   for(var i=0;i<this.gameRow+2;i++)
		   {
			this.iconDiv[i]=new Array();
			for(var j=0;j<this.gameCol+2;j++){
				if(i==0||j==0||i==(this.gameRow+1)||j==(this.gameCol+1)){
					//边界 最外圈为-1
					oPic=new pic(i,j,-1);
					
				}else{  
					// var text=Math.floor(Math.random()*this.picSum)+1;
					oPic=new pic(i,j,this.iconArr[count++]);
				}
				this.iconDiv[i][j]=oPic;
			}
		   }
			
	},
	drawGame:function(){
		//根据iconDiv把图片绘制在panel上
		//创建图标iconarr
		this.map();
		for(var i=1;i<=this.gameRow;i++){
			for(var j=1;j<=this.gameCol;j++){
				var oDiv=document.createElement('span');
				oDiv.className='piece';
				var pic=document.createElement('img');
				pic.src='images/'+this.iconDiv[i][j].src+'.png';
				oDiv.row=i;
				oDiv.col=j;
				oDiv.style.left=(j-1)*48+"px";
				oDiv.style.top=(i-1)*36+"px";
				oDiv.appendChild(pic);
				gameCanvas.appendChild(oDiv);
			}
		}
	},
	clearGame:function(){console.log("clear game;")
		//清除界面
		this.iconArr=[];
		this.iconDiv=[];
		$("#gameCanvas").html("");
	}


}


//时间计时
var timeDraw=function(){
	this.canvas=document.getElementById("canvas");
	this.cxt=this.canvas.getContext("2d");
	this.width=this.canvas.width;
	this.height=this.canvas.height;
	this.percent=0;
	this.lineWidth=8;
	this.circle={
		x:this.width/2,
		y:this.height/2,
		r:this.width>this.height?this.height/2-this.lineWidth/2:this.width/2-this.lineWidth/2
	};
	this.timer=null;
	this.timeSum=5;    //整个游戏总时间

}
timeDraw.prototype={
	drawPanel:function(){
		this.cxt.save();
		this.cxt.fillStyle="rgba(155, 187, 89, 0.1)";
		this.cxt.rect(0,0,this.width,this.height);
		this.cxt.fill();
		this.cxt.restore();
	},
	animation:function(percent){
		this.cxt.clearRect(0,0,this.width,this.height);
		this.drawPanel();
		this.cxt.lineWidth=this.lineWidth;
		this.cxt.beginPath();
		this.cxt.strokeStyle="#abc";
		this.cxt.arc(this.circle.x,this.circle.y,this.circle.r,0,Math.PI*2,false);
		this.cxt.stroke();
		this.cxt.closePath();


		this.cxt.beginPath();
		// var canvasGradient=this.cxt.createRadialGradient(this.circle.x,this.circle.y,0,this.circle.x,this.circle.y,this.circle.r);
		var canvasGradient=this.cxt.createLinearGradient(0,0,this.width,this.height);
		canvasGradient.addColorStop(0,"red");
		canvasGradient.addColorStop(0.6,"yellow");
		canvasGradient.addColorStop(1,"blue");
		this.cxt.strokeStyle=canvasGradient;
		this.cxt.arc(this.circle.x,this.circle.y,this.circle.r,-Math.PI/2,2*Math.PI*percent-Math.PI/2,false);
		this.cxt.stroke();
		//text 60%

		this.cxt.font="20px Georgia";
		var text=parseInt(percent*100)+"%";
		var wText=this.cxt.measureText(text).width;
		this.cxt.fillStyle="#fff";
		this.cxt.fillText(text,this.circle.x-wText/2,this.circle.y+5);
		this.cxt.closePath();
	},
	draw:function(){
		//总时间为5min
		var that=this;
		this.timer=setInterval(function(){
			if(that.percent>=1){
				that.stop();
				// clearInterval(that.timer);
				//计时 五分钟结束后出现结果页面(失败)
				// $(".resultPanel").css("display","block");
				
			}
			that.animation(that.percent);
			that.percent+=1/(that.timeSum*60);
		},1000);
	},
	stop:function(){
		//停止时间转动
		clearInterval(this.timer);
		this.timer=null;
		this.percent=0;
	}
}


	var gameMove=new gameMove();
	gameMove.init();

	
})