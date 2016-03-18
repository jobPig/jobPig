function $(id){
				return document.getElementById(id);
			}

			function addEvent(target,type,handler){
				if(target.addEventListener){
					target.addEventListener(type,handler,false);
				}else{
					target.attachEvent("on"+type,function(event){
						//把处理程序作为事件目标的方法调用
						//传递事件对象
						return handler.call(target,event);
					});
				} 
			}

			function hasClass(obj,className){
				return obj.className.match(new RegExp('(\\s|^)'+className+'(\\s|$)'));
			}

			function getClassName(className,parent){
				var attr=[];
				var all=parent.getElementsByTagName("*");
				for(var i=0;i<all.length;i++){
					if(hasClass(all[i],className)){
						attr.push(all[i]);
					}
				}
				return attr;
			}


			function removeClass(obj,className){
				
				if(hasClass(obj,className)){
					var reg=new RegExp('(\\s|^)'+className+'(\\s|$)');
					obj.className=obj.className.replace(reg,' ');
				}
			}

			function taggleClass(obj,className){
				if(hasClass(obj,className)){
					removeClass(obj,className);
				}else{
					addClassName(obj,className);
				}
			}
			function addClassName(obj,className){
				if(!hasClass(obj,className)){
					obj.className+=" "+className;
				}
			}

			function hide(bar,dot,ecg){
				removeClass(bar,"selected");
				removeClass(dot,"selected");
				removeClass(ecg,"selected");
			}


	window.onload=function(){
		var visualizer=new Visualizer();
		visualizer.init();

		//点击play和stop按钮切换
		var musicControl=$("musicControl"); 
		addEvent(musicControl,"click",function(event){
			if(hasClass(musicControl,"glyphicon-play")){
				removeClass(musicControl,"glyphicon-play");
				addClassName(musicControl,"glyphicon-pause");
				//停止音乐
				visualizer.stopSound();
			}else{
				removeClass(musicControl,"glyphicon-pause");
				addClassName(musicControl,"glyphicon-play");
				visualizer.playSound();
			}
		});

		//点状效果
		var dot=$("dot");  //点状图
		var bar=$("bar");   //柱状图
		var ecg=$("ecg");   //心电图
		addEvent(dot,"click",function(event){
			hide(bar,dot,ecg);
			addClassName(this,"selected");
			//点状图
			if(visualizer.audioBufferSouceNode){
				//把图标转为暂停
				removeClass(musicControl,"glyphicon-play");
				addClassName(musicControl,"glyphicon-pause");

				visualizer.stopSound();
				visualizer.playSound();
			}
console.log("dot visualizer.audioBufferSouceNode:"+visualizer.audioBufferSouceNode)				
		});
		//柱状图效果
		addEvent(bar,"click",function(event){
			hide(bar,dot,ecg);
			addClassName(this,"selected");
console.log("bar visualizer.audioBufferSouceNode:"+visualizer.audioBufferSouceNode)			
			if(visualizer.audioBufferSouceNode){
				//把图标转为暂停
				removeClass(musicControl,"glyphicon-play");
				addClassName(musicControl,"glyphicon-pause");

				visualizer.stopSound();
				visualizer.playSound();
			}
		});
		//心电图效果
		addEvent(ecg,"click",function(event){
			hide(bar,dot,ecg);
			addClassName(this,"selected");
			if(visualizer.audioBufferSouceNode){
				//把图标转为暂停
				removeClass(musicControl,"glyphicon-play");
				addClassName(musicControl,"glyphicon-pause");

				visualizer.stopSound();
				visualizer.playSound();
			}
		});

		
	}	


			

			var Visualizer=function(){
				this.file=null,  //要处理的文件
				this.fileName=null,  //文件名
				this.audioContext=null,  //进行音频处理的上下文
				this.source=null,
				// this.start="start",
				// this.stop="stop",
				this.audioBufferSouceNode=null,
				this.animatationFrame=null,
				this.canvas=$("canvas"),
				this.cWidth=this.canvas.width,
				this.cHeight=this.canvas.height-2

				// this.info=document.getElementById("info").innerHTML

			};

			Visualizer.prototype={
				init:function(){
					this._prepareAPI();
					this._addEventListener();

				},
				stopSound:function(){

					//停止播放音乐
					if(this.audioBufferSouceNode){
						if(!this.audioBufferSouceNode.stop){
							this.audioBufferSouceNode.stop=this.audioBufferSouceNode.noteOff;    //立即停止
						}
						this.audioBufferSouceNode.stop(0);
console.log("stop");						
					}

				},
				
				playSound:function(){
					//开始播放音乐
					this._start();
					
				},
				_prepareAPI:function(){
					//统一前缀，方便调用
					window.AudioContext=window.AudioContext||window.webkitAudioContext||window.mozAudioContext||window.msAudioContext;
					window.requestAnimationFrame=window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.msRequestAnimationFrame

					try{
						this.audioContext=new AudioContext();
					}catch(e){
						console.log('Your browser does not support AudioContext');
		
					}
				},
				_visualize:function(audioContext,buffer){
					//结束上次的动画
 window.cancelAnimationFrame(this.animatationFrame);	
					 this.audioBufferSouceNode=audioContext.createBufferSource();
					//创建分析器
					var analyser=audioContext.createAnalyser();
					//将source于分析器连接
					this.audioBufferSouceNode.connect(analyser);
					//将分析器与destination连接
					analyser.connect(audioContext.destination);
					//将解码得到的buffer数据赋值给source
					this.audioBufferSouceNode.buffer=buffer;
					//播放,参数为开始时间
					if(!this.audioBufferSouceNode.start){
						//老的浏览器
						this.audioBufferSouceNode.start=this.audioBufferSouceNode.noteOn;
						// audioBufferSouceNode.stop=audioBufferSouceNode.noteOff;
						
					}
					this.audioBufferSouceNode.start(0);
					

					//在canvas上画图像
					//判断选择的是哪种效果
					var effect=getClassName("btn",document);
					var impact=null;
					for(var i=0;i<effect.length;i++){
						if(hasClass(effect[i],"selected")){
							impact=effect[i].innerHTML;
						}
					}
				
					if(impact=="Bar"){
						this._drawSpectrum(analyser);
					}else if(impact=="Dot"){
						this._drawDots(analyser);
					}else{
						this._drawECG(analyser);	
					}

					// this._drawSpectrum(analyser);
// this._drawDots(analyser);
// this._drawECG(analyser);					
				},
				_drawSpectrum:function(analyser){
					
					var	meterWidth=10,  //meter的宽度
						gap=2,  //meter之间的gap
						capHeight=2,
						capStyle='#fff',
						meterNum=this.cWidth/(meterWidth+gap),  
						capYPositionArray=[],
					cxt=this.canvas.getContext("2d"),
					gradient=cxt.createLinearGradient(0,0,0,300);
					gradient.addColorStop(1,"#0f0");
					gradient.addColorStop(0.5,"#ff0");
					gradient.addColorStop(0,"#f00");
					//清理屏幕
					cxt.clearRect(0,0,this.cWidth,this.cHeight+2);	
					var that=this;
					var drawMeter=function(){
						var array=new Uint8Array(analyser.frequencyBinCount);  
						var step=Math.round(array.length/meterNum);  //步长 
						analyser.getByteFrequencyData(array);
						cxt.clearRect(0,0,that.cWidth,that.cHeight+2);
						for(var i=0;i<meterNum;i++){
							var value=array[i+step];
							// if(capYPositionArray.length<Math.round(meterNum)){
							// 	capYPositionArray.push(value);
							// }
							cxt.fillStyle=gradient;
							cxt.fillRect(i*(meterWidth+gap) /*meterWidth+gap*/ , that.cHeight - value  /*2 is the gap between meter and cap*/,meterWidth,that.cHeight)
						}
						this.animatationFrame=requestAnimationFrame(drawMeter);

					}
					this.animatationFrame=requestAnimationFrame(drawMeter);
				},
				_addEventListener:function(){
					//上传文件onchange
					var audioInput=$("uploadedFile"),
						that=this;
					addEvent(audioInput,"change",function(e){
						var e=e||event;
//停止正在播放的音乐
if(this.audioBufferSouceNode){
					
	window.cancelAnimationFrame(this.animatationFrame);
}



						if(this.files.length>=0){
							that.file=this.files[0];
							that.fileName=that.file.name;
console.log("file:"+that.fileName);							
							//判断选择文件是否是音乐文件
							var suffix=that.fileName.split(".")[1];
							
							if(suffix.match(/(mp3|wav|ra)/g)){
								$("file-name").innerHTML=that.fileName;
								that._start();
								
							}else{
								alert("please input music file");
							}
						}
						
					})
				},
				_start:function(){
					var that=this,
						file=this.file,
						fr=new FileReader();
						fr.onload=function(e){
							//文件加载结束
							var fileResult=e.target.result;
							var audioContext=that.audioContext;
							if(audioContext==null){
								return;
							}
							audioContext.decodeAudioData(fileResult,function(buffer){
								that._visualize(audioContext,buffer);

							},function(e){
								//失败后
								console.log(e);
							});
					
						}

					fr.readAsArrayBuffer(file);	
				},
				_drawDots:function(analyser){
					//点状图

					var	dots=[],        //存放点位置的坐标
						dotNum=10;      //点的个数
					var dot=function(x,y,radius,color){
						this.x=x;
						this.y=y;
						this.radius=radius;
						this.color=color;
					}	
					var cxt=this.canvas.getContext("2d");
					cxt.clearRect(0,0,this.cWidth,this.cHeight+2);

					var x=0,y=0,radius=0,getColor={},color=0,smallDot;
					//create dots
					for(var i=0;i<dotNum;i++){
						 x=Math.random()*this.cWidth;
						 y=Math.random()*this.cHeight;
						 radius=Math.random()*50+10;
						 getColor=this._changeColor();
						 color='rgba('+getColor.r+','+getColor.g+','+getColor.b+','+getColor.a+')';
						 smallDot=new dot(x,y,radius,color);
						dots.push(smallDot);
					}
					var that=this;
					// console.log(dots);

					//animate 执行动画
					var drawAnimate=function(){
						var array=new Uint8Array(analyser.frequencyBinCount);  
						var step=Math.round(array.length/dotNum);  //步长 
						analyser.getByteFrequencyData(array);
						cxt.clearRect(0,0,that.cWidth,that.cHeight+2);
						for(var i=0;i<dotNum;i++){
							var value=array[i+step];
							cxt.save();
							cxt.beginPath();
							cxt.arc(dots[i].x,dots[i].y,value*0.8,0,2*Math.PI);
							cxt.fillStyle=dots[i].color;
							cxt.fill();
							cxt.closePath();
							cxt.restore();
							
							
						}
						this.animatationFrame=requestAnimationFrame(drawAnimate);
						// setInterval(function(){
						// 	drawAnimate();
						// },300);
					}
					this.animatationFrame=requestAnimationFrame(drawAnimate);
					// drawAnimate();
				},
				_changeColor:function(){
					var color={};
					color.r=parseInt(Math.random()*255);
					color.g=parseInt(Math.random()*255);
					color.b=parseInt(Math.random()*255);
					color.a=Math.random();
					return color;

				},
				_drawECG:function(analyser){
					//心电图
					
					var	cxt=this.canvas.getContext("2d");
						that=this;
					//清理屏幕	
					cxt.clearRect(0,0,this.cWidth,this.cHeight+2);
					
					var drawEcg=function(){
						var array=new Uint8Array(analyser.frequencyBinCount); 
						var step=Math.round(that.cWidth/array.length);  //步长 
						analyser.getByteFrequencyData(array);
						cxt.clearRect(0,0,that.cWidth,that.cHeight+2);  
						//获得平均值（大于平均值的在下方，小于的在上方）
						var average=that.getAverage(array);  
						//定位起点在中间
						
						cxt.strokeStyle="#000";
						cxt.beginPath();
						for(var i=0;i<array.length;i+=2){
							var value=array[i];
							cxt.moveTo(step*i,value-average+that.cHeight/2);
							cxt.lineTo(step*(i+1),value-average+that.cHeight/2);
							
							
						}
						cxt.lineWidth=2;
						cxt.stroke();
						cxt.closePath();
						this.animatationFrame=requestAnimationFrame(drawEcg);

					}
					this.animatationFrame=requestAnimationFrame(drawEcg);
					
					
			},
			getAverage:function(array){
				var len=array.length,
				    sum=0;
				for(var i=0;i<len;i++){
					sum+=array[i];
				}
				return sum/len;
			}
		}	

			function loadSound(url){
				//加载定义音频文件的函数
				var request=new XMLHttpRequest(); //建立请求
				request.open('GET',url,true);  //配置好请求类型，文件路径等
				request.responseText='arraybuffer';  //配置数据返回类型
				//一旦获取完成，对音频进行进一步操作，比如解码
				request.onload=function(){
					var arraybuffer=request.response;
				}
				request.send();
			}