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

		window.onload=function(){
			var upload=$("uploadedFile"),
				canvas=$("canvas"),
				render=$("render"),
				cxt=canvas.getContext("2d"),
				cxt2=render.getContext("2d"),
				cWidth=canvas.width,
				cHeight=canvas.height,
				imgWidth=0,
				imgHeight=0,
				dataType="",
				file=null,
				left=-1,
				arrData=[],     //存放像素的数组
				metaData=[],     //图像原数据
				resultSets={};      //存放所有效果{gray:arrData1,..:arrData2,..}    


		//点击事件
			var black_white=$("white"),
				gray=$("gray"),
				retro=$("retro");

			//点击按钮后重置画面
			function reset(dataType){
				var dataRender="";
				if(file){  
					cxt2.clearRect(0,0,cWidth,cHeight);
					if(resultSets[dataType]){        
						//arrdata已经存在
						dataRender=resultSets[dataType];   
					}else{            
						dataRender=renderPic(arrData);    
					}
					
					cxt2.putImageData(dataRender,0,0);
					// debugger;
				}
			}	
				
			addEvent(black_white,"click",function(e){ 
				dataType="bAndw";
				addClassName(black_white,"selected");
				removeClass(gray,"selected");
				removeClass(retro,"selected");

				reset(dataType);
			});
			addEvent(gray,"click",function(e){ 
				dataType="grayPic";
				addClassName(gray,"selected");
				removeClass(black_white,"selected");
				removeClass(retro,"selected");
				reset("grayPic");
			});	
			addEvent(retro,"click",function(e){  
				dataType="retroPic";
				addClassName(retro,"selected");
				removeClass(black_white,"selected");
				removeClass(gray,"selected");
				reset(dataType);
			});		

			addEvent(upload,"change",function(e){
				var e=e||event;
				//清空arrdata数组
				resultSets={};
				if(this.files.length>0){  
					file=this.files[0];
					$("file-name").innerHTML=file.name;
					var suffix=file.name.split(".")[1];
					if(!file.type.match("image\/*")){
						alert("图片格式无效");
						return;
					}else{ 
						//解析图片
						resolutePic();
	
					}
				}
			});	
				//对图像进行处理
				function resolutePic(){
					if(window.FileReader){
								var reader=new FileReader();  
								reader.onload=function(e){ 
									var image=new Image();
									image.onload=function(){   
										// imgWidth=cWidth>this.width?this.width:cWidth;
										// imgHeight=cHeight>this.height?imgHeight:this.height;
										if(this.width>this.height){
											imgWidth=this.width*cHeight/this.height;
											imgHeight=cHeight;
										}else{
											imgWidth=cWidth;
											imgHeight=this.height*cWidth/this.width;
										}
										left=cWidth>imgWidth?(cWidth-imgWidth)/2:0;  
										cxt.drawImage(this,left,0,imgWidth,imgHeight);

										//canvas2中处理的图像展示
										dataType=dataType==""?"bAndw":dataType;
										metaData=cxt.getImageData(0,0,cWidth,cHeight);
										arrData=cxt.getImageData(0,0,cWidth,cHeight);  
										var dataRender=renderPic(arrData);    
										
										cxt2.putImageData(dataRender,0,0);
									}
									image.src=e.target.result;
									cxt.drawImage(image,0,0,50,50);
								}
								reader.readAsDataURL(file);
							}
				}

				function renderPic(arrData){  
					// var newData=getGrey(arrData);
					var newData="";
					if(dataType=="bAndw"){
						//黑白图
						 newData=getBinary(arrData); 
						//存入json resultSets
						pushJson("bAndw",newData);   
					}else if(dataType=="grayPic"){
						//灰度图
						 newData=getGrey(arrData);   
						//存入json resultSets
						pushJson("grayPic",newData);  
					}else if(dataType=="retroPic"){
						newData=getBlur(arrData);
						//存入json resultSets
						pushJson("retroPic",newData);
					}

					return newData;
				}
				//存入json
				function pushJson(type,data){
					if(!resultSets[type]){
						//不存在就放入
						resultSets[type]=data;
					}
				}

				//灰度图处理
				function getGrey(arrData){
					//深度拷贝
					var newData=new ImageData(arrData.width,arrData.height);
					newData.data.set(arrData.data);
					var average=0;
					for(var i=0;i<newData.data.length;i+=4){
						average=(newData.data[i]+newData.data[i+1]+newData.data[i+2])/3;
						newData.data[i]=average;
						newData.data[i+1]=average;
						newData.data[i+2]=average;
					}
					return newData;
				}

				//二值图处理
				function getBinary(arrData){
					//深度拷贝
					var newData=new ImageData(arrData.width,arrData.height);
					newData.data.set(arrData.data);

					var arrObj={};  //{255:3} 灰度值为255的个数有3个
					//平均值
					average=getAverage(newData.data,arrObj);
					//当中间值是定值
					var bestValue=getBestValue(arrObj,newData,average);
					// console.log(bestValue);

					var middle=bestValue;
					for(var i=0;i<arrData.data.length;i+=4){
						if(newData.data[i]>middle){
							//大于中间值，该像素点设置成白色
							newData.data[i]=255;
							newData.data[i+1]=255;
							newData.data[i+2]=255;
						}else{
							newData.data[i]=0;
							newData.data[i+1]=0;
							newData.data[i+2]=0;
						}
					}
					return newData;
				}
				//获得像素平均灰度值
				function getAverage(arrData,arrObj){
					var average=0;
					
					var sum=0;
					var middle=-1;
					for(var i=0;i<arrData.length;i+=4){
						middle=Math.floor((arrData[i]+arrData[i+1]+arrData[i+2])/3);
						arrData[i]=middle;
						arrData[i+1]=middle;
						arrData[i+1]=middle;
						
						if(!arrObj[middle]){
							//不存在放进去

							arrObj[middle]=1;
						}else{
							arrObj[middle]++;
						}
					}

					//求平均值u=∑i*n(i)/(M*N);
					for(var mid in arrObj){
						sum+=arrObj[mid]*mid;
					}
					average=sum/(arrData.length/4);
					return average;
				}

				//记t为目标与背景的分割阈值，记目标像素（灰度大于t）占图像的比例为w1，记目标像素的平均灰度为u1：
				//值为t在arrObj中的下标值
				//    w1= W1/(M*N）,其中的W1是灰度值大于t的统计数
		   		// u1= ∑i*n(i)/W1, i>t.
				function getThreshold(arrObj,t,arrData){
					var W1=0;              //W1为灰度值大于t的统计数
					var W2=0;              //W1为灰度值小于t的统计数
					var u1,u2;
					var w1,w2;        //所占比例
					var pixelNum=arrData.data.length/4;   //像素总数
					var sum1=0,sum2=0;  //目标点和背景色的像素总数
					for(var pixel in arrObj){
						if(pixel>t){
							W1+=arrObj[pixel];
							sum1+=arrObj[pixel]*pixel;
						}else{
							W2+=arrObj[pixel];
							sum2+=arrObj[pixel]*pixel;
						}
					}

					w1=W1/pixelNum;
					w2=W2/pixelNum;
					u1=sum1/W1;
					u2=sum2/W2;

					return {
						w1:w1,
						w2:w2,
						u1:u1,
						u2:u2
					};
				}

				//求解最佳阀值t是类差别最大
		    	//遍历2°中的t，使得G=w1*(u1-u)*(u1-u)+w2*(u2-u)*(u2-u)最大.
		    	//G最大时，即得到了最佳阈值，与上式子等价的还有：G=(u1-u)*(u1-u)*(u2-u)*(u2-u)；

		    	function getBestValue(arrObj,arrData,average){
		    		var bestValue=-1;
		    		var tResult;
		    		var G=-1;
		    		var minValue=999;

		    		for(var pixel in arrObj){
		    			 tResult=getThreshold(arrObj,pixel,arrData);
		    			 G=tResult.w1*(tResult.u1-average)*(tResult.u1-average)+tResult.w2*(tResult.u2-average)*(tResult.u2-average);
		    			 if(G<minValue){
		    			 	minValue=G;
		    			 	bestValue=pixel;
		    			 }
		    			 // debugger;
		    		}
		    		return bestValue;
		    	}



		    //3. 模糊效果
				//高斯算法
			//计算权重(radius为0至255之间的数，越大越模糊,获得结果的个数为2*n+1)
			function weight(n,radius){
				var radius2=2*radius*radius;
				var prefix=1/(Math.sqrt(2*Math.PI)*radius);
				var result=0;
				var resultArr=[];
				for(var i=-n;i<=n;i++){
					result=Math.exp(-(i*i)/radius2)*prefix;
					resultArr.push(result);
				}
				return resultArr;
			}
			//求得9个点的权重总和，若要计算9个点的加权平均，还必须让它们的权重之和等于1，所以这9个点还需要除以它们的和
			function getAverage2(resultArr){
				var length=resultArr.length;
				var sum=0;
				for(var i=0;i<length;i++){
					sum+=resultArr[i];
				}
				for(var j=0;j<length;j++){
					resultArr[j]=resultArr[j]/sum;
				}
				return resultArr;
			}

			//计算高斯模糊
			//权重矩阵X像素矩阵，再将9个值加起来就是中间的高斯值
			function getGauss(resultArr,pixelSmall){
				var	length=resultArr.length,
					media=0,
					result=0;    //中间的高斯值
				for(var i=0;i<length;i++){
					media=resultArr[i]*pixelSmall[i];
					// guassArr.push(media);
					result+=media;
				}	
				// result/=length;
				return result;
			}

			//获得一个点周围8个点以及自身的值数组
			function getSeries(pixelArr,pos,col){
				var arr=[];
				arr.push(pixelArr[pos-4*col-4]);
				arr.push(pixelArr[pos-4*col]);
				arr.push(pixelArr[pos-4*col+4]);
				arr.push(pixelArr[pos-4]);
				arr.push(pixelArr[pos]);
				arr.push(pixelArr[pos+4]);
				arr.push(pixelArr[pos+4*col-4]);
				arr.push(pixelArr[pos+4*col]);
				arr.push(pixelArr[pos+col*4+4]);

				return arr;
			}

			function getBlur(arrData){
				//深度拷贝
				var newData=new ImageData(arrData.width,arrData.height);
				newData.data.set(arrData.data);

				//求每个点的高斯值（除去周围一圈）
				var row=arrData.height;       
				    col=arrData.width,
				 	position=0,
				 	dealResult=[],
				 	position=0,
				 	rData=[],
				//权重矩阵
					resultArr=weight(4,250);	
				resultArr=getAverage2(resultArr);
				var result2;
				for(var x=0;x<row;x++){
					for(var y=0;y<col;y++){
						position=col*x+y;   //每个点所处位置(从0开始)
						// r=arrData[4*position];
						// g=arrData[4*position+1];
						// b=arrData[4*position+2];

						if(x==0||y==0||x==row-1||y==col-1){
							dealResult.push(newData.data[position*4]);
							dealResult.push(newData.data[position*4+1]);
							dealResult.push(newData.data[position*4+2]);
							dealResult.push(newData.data[position*4+3]);
						}else{
							//获得周围值数组
							for(var i=0;i<3;i++){
								//r,g,b值
								rData=getSeries(newData.data,4*position+i,col);
								result2=getGauss(resultArr,rData);
								dealResult.push(result2);
							}
							dealResult.push(newData.data[position*4+3]);   //rgba中透明度a
						}

						
						
					}
				}

				for(var i=0;i<newData.data.length;i++){
					newData.data[i]=Math.floor(dealResult[i]);
				}

				return newData;
			}
		
			
		}