window.onload=function(){
	var doc=document;
		var layer=doc.getElementById('layer');     //透明区域
		var smallDiv=doc.getElementById('smallPic');
		var bigDiv=doc.getElementById('bigPic');
		var bPic=doc.getElementById('big');   //大图
		//var mark=doc.getElementById('mark');

		smallDiv.onmouseover=function(){
			layer.style.display='block';
			bigDiv.style.display='block';

			this.onmousemove=function(et){
				//鼠标移动白色区域跟着移动
				var ev=ev||event;
				//获得鼠标位置
				var clientX=ev.clientX;
				var clientY=ev.clientY;
				//透明区域中心在鼠标位置
				var left=clientX-smallDiv.offsetLeft;
				var top=clientY-smallDiv.offsetTop;

				var x=left-layer.offsetWidth/2;
				var y=top-layer.offsetHeight/2;
				//边界处
				if(x<3){
					x=3;
				}else if(x>=smallDiv.offsetWidth-layer.offsetWidth){
					x=smallDiv.offsetWidth-layer.offsetWidth;
				}

				if(y<3){
					y=3;
				}else if(y>smallDiv.offsetHeight-layer.offsetHeight){
					y=smallDiv.offsetHeight-layer.offsetHeight;
				}

				layer.style.left=x+'px';
				layer.style.top=y+'px';

				
				//显示大图  白块所在top,left/总共能移动的距离
				var percentX=layer.offsetLeft/(smallDiv.offsetWidth-layer.offsetWidth);
				var percentY=layer.offsetTop/(smallDiv.offsetHeight-layer.offsetHeight)	;

				//大图能移动的距离
				var bigDisX=parseInt(getByStyle(bPic,'width'))-bigDiv.offsetWidth;	
				var bigDisY=parseInt(getByStyle(bPic,'height'))-bigDiv.offsetHeight;

				bPic.style.left=-bigDisX*percentX+'px';
				bPic.style.top=-bigDisY*percentY+'px';	


				document.title=bigDisX+'--'+bigDisY;
			}
		}

		smallDiv.onmouseout=function(){
			layer.style.display='none';
			bigDiv.style.display='none';
		}

		function getByStyle(obj,name){
		if(obj.currentStyle){
			return obj.currentStyle[name];
		}else{
			return getComputedStyle(obj,null)[name];
		}
	}
}