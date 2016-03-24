function getByClass(oParent,name){
			var oDiv=oParent.getElementsByTagName('*');
			var result=[];
			for(var i=0;i<oDiv.length;i++){
				if(hasClass(oDiv[i],name)){
					//存在该属性
					result.push(oDiv[i]);
				}
			}
			return result;
		}
		function hasClass(obj,cls){

			return obj.className.match(new RegExp('(\\s|^)'+cls+'(\\s|$)'));
		}

		function addClass(obj,cls){

			if(!hasClass(obj,cls)){
				obj.className+=' '+cls;
			}
		}

		function removeClass(obj,cls){
			
			if(hasClass(obj,cls)){
				var reg=new RegExp('(\\s|^)'+cls+'(\\s|$)');
				obj.className=obj.className.replace(reg,' ');
				
			}
		}

		function taggleClass(obj,cls){
			if(hasClass(obj,cls)){
				removeClass(obj,cls);
			}else{
				addClass(obj,cls);
			}
		}

		function getStyle(obj,attr){
			//获得属性
			if(obj.currentStyle){
				return obj.currentStyle[attr];
			}else{
				return getComputedStyle(obj,false)[attr];
			}
		}
	window.onload=function(){
		var listbtn=document.getElementById("list");
		 maskLayer=getByClass(document,"maskLayer")[0],
		 oUl=document.getElementById("ul-list"),
		 page1=getByClass(document,"page1")[0],
		 page2=getByClass(document,"page2")[0],
		 page3=getByClass(document,"page3")[0],
		 page4=getByClass(document,"page4")[0],
		 user=getByClass(document,"glyphicon-user")[0],
		 motto=getByClass(document,"motto")[0],
		 prompt=getByClass(document,"glyphicon-hand-down")[0],
		 wrapper=getByClass(document,"wrapper")[0],
		 pageNo=1,          //当前展示页
		  timer=null,
		  wrapperLeft=0,
		  wrapperRight=0,
		  mottoTop=-40;
		  pageArr=[];

		  //把page放入pageArr
		  pageArr.push(page1);
		  pageArr.push(page2);
		  pageArr.push(page3);
		  pageArr.push(page4);

		 function location(){
		 	//提示手势和motto坐标定位
			  wrapperLeft=wrapper.offsetLeft;
			  var wrapperWidth=parseInt(getStyle(wrapper,"width"));
			  wrapperRight=wrapperLeft+wrapperWidth;
				
			motto.style.left=wrapperLeft-30+"px";	
			prompt.style.left=wrapperRight-30+"px"; 
			mottoTop=wrapper.offsetTop-50;
		 }
		 location();

		 //窗口大小改变时
		 window.onresize=function(){ console.log("resize")
		 	location();
		 }

		listbtn.onclick=function(e){
			maskLayer.style.visibility="visible";
		}
		user.onmouseover=function(e){
			console.log("hover");
			var top=motto.offsetTop;
			function scrollDown(){
				top++;
				motto.style.top=top+"px";
			}
			 timer=setInterval(function(){
				if(top>=mottoTop){
					clearInterval(timer);
				}else{
					scrollDown();
				}
			},1000/60);
			
		}
		user.onmouseout=function(e){
			clearInterval(timer);
			motto.style.top="-40px";
		}
		maskLayer.onclick=function(e){
			maskLayer.style.visibility="hidden";
			var e=e||event;
			var targetId=e.target.id;
			if(targetId=="basic-info"){
				pageNo=4;
				showOrhide(pageNo);
				
			}else if(targetId=="works"){
				pageNo=1;
				showOrhide(pageNo);
				
			}else if(targetId=="self-ass"){
				pageNo=2;
				showOrhide(pageNo);

			}else if(targetId=="skill"){
				
				pageNo=3;
				showOrhide(pageNo);
			}
			
			
		}

		//page显示隐藏
		function showOrhide(pageNo){
			var content=getByClass(document,"content");
			var length=content.length;
			for(var i=0;i<length;i++){
				pageArr[i].style.display="none";
			}
			pageArr[pageNo-1].style.display="block";

		}

		//键盘事件
		document.onkeydown=function(e){
			var e=e||event;
			var keyCode=e.keyCode;
			if(keyCode==37){
				//向右
				if(pageNo<=1){
					pageNo=4;
				}else{
					pageNo--;
				}

			}else if(keyCode==39){
				//向左
				if(pageNo>=4){
					pageNo=1;
				}else{
					pageNo++;
				}
			}else if(keyCode==38){
				//向上
				if(pageNo<=1){
					pageNo=4;
				}else{
					pageNo--;
				}
			}else if(keyCode==40){
				//向下
				if(pageNo>=4){
					pageNo=1;
				}else{
					pageNo++;
				}
			}

			showOrhide(pageNo);

		}
	}