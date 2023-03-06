class JoyStick{
	constructor(options){
		const circle = document.createElement("div");
		if (options.left!==undefined){
			circle.style.cssText = "position:absolute; bottom:35px; width:80px; height:80px; background:rgba(126, 126, 126, 0.5); border:#444 solid medium; border-radius:50%; left:20px;";
		}else if (options.right!==undefined){
			circle.style.cssText = "position:absolute; bottom:35px; width:80px; height:80px; background:rgba(126, 126, 126, 0.5); border:#444 solid medium; border-radius:50%; right:20px;";
		}else{
			circle.style.cssText = "position:absolute; bottom:35px; width:80px; height:80px; background:rgba(126, 126, 126, 0.5); border:#444 solid medium; border-radius:50%; left:50%; transform:translateX(-50%);";
		}
		const thumb = document.createElement("div");
		thumb.style.cssText = "position: absolute; left: 20px; top: 20px; width: 40px; height: 40px; border-radius: 50%; background: #fff;";
		circle.appendChild(thumb);
		document.body.appendChild(circle);
		this.domBg = circle;
		this.domElement = thumb;
		this.maxRadius = options.maxRadius || 40;
		this.maxRadiusSquared = this.maxRadius * this.maxRadius;
		this.onMove = options.onMove;
		this.app = options.app;
		this.origin = { left:this.domElement.offsetLeft, top:this.domElement.offsetTop };
		this.rotationDamping = options.rotationDamping || 0.06;
		this.moveDamping = options.moveDamping || 0.01;
		if (this.domElement!=undefined){
			const joystick = this;
			if ('ontouchstart' in window){
				this.domElement.addEventListener('touchstart', function(evt){ evt.preventDefault(); joystick.tap(evt); });
			}else{
				this.domElement.addEventListener('mousedown', function(evt){ evt.preventDefault(); joystick.tap(evt); });
			}
		}
	}

	set visible( mode ){
		const setting = (mode) ? 'block' : 'none';
		this.domElement.style.display = setting;
		this.domBg.style.display = setting;
	}

	getMousePosition(evt){
		let clientX = evt.targetTouches ? evt.targetTouches[0].pageX : evt.clientX;
		let clientY = evt.targetTouches ? evt.targetTouches[0].pageY : evt.clientY;
		return { x:clientX, y:clientY };
	}

	tap(evt){
		evt = evt || window.event;
		// 获取启动时的鼠标光标位置
		this.offset = this.getMousePosition(evt);
		const joystick = this;
		if ('ontouchstart' in window){
			document.ontouchmove = function(evt){ evt.preventDefault(); joystick.move(evt); };
			document.ontouchend =  function(evt){ evt.preventDefault(); joystick.up(evt); };
		}else{
			document.onmousemove = function(evt){ evt.preventDefault(); joystick.move(evt); };
			document.onmouseup = function(evt){ evt.preventDefault(); joystick.up(evt); };
		}
	}

	move(evt){
		evt = evt || window.event;
		const mouse = this.getMousePosition(evt);
		// 计算新的游标位置
		let left = mouse.x - this.offset.x;
		let top = mouse.y - this.offset.y;
		//this.offset = mouse;

		const sqMag = left*left + top*top;
		if (sqMag>this.maxRadiusSquared){
			//必要时只使用根号
			const magnitude = Math.sqrt(sqMag);
			left /= magnitude;
			top /= magnitude;
			left *= this.maxRadius;
			top *= this.maxRadius;
		}
		// 设置元素的新位置:
		this.domElement.style.top = `${top + this.domElement.clientHeight/2}px`;
		this.domElement.style.left = `${left + this.domElement.clientWidth/2}px`;

		const forward = -(top - this.origin.top + this.domElement.clientHeight/2)/this.maxRadius;
		const turn = (left - this.origin.left + this.domElement.clientWidth/2)/this.maxRadius;

		if (this.onMove!=undefined) this.onMove.call(this.app, forward, turn);
	}

	up(evt){
		if ('ontouchstart' in window){
			document.ontouchmove = null;
			document.touchend = null;
		}else{
			document.onmousemove = null;
			document.onmouseup = null;
		}
		this.domElement.style.top = `${this.origin.top}px`;
		this.domElement.style.left = `${this.origin.left}px`;

		this.onMove.call(this.app, 0, 0);
	}
}

export { JoyStick };