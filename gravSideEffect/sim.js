var GS = {};

GS.World = function (canvas) {
	this.ctx = canvas.getContext('2d');
	this.ctx.globalCompositeOperation = 'lighter';
	this.ctx.strokeStyle = 'black';
};
GS.World.prototype.start = function () {
	this.initWorld();
	var $canvasElem = $('#gameview');
	var self = this;

	$canvasElem.mousedown(function(event) {
		$canvasElem.mousemove(function(event) {
			self.center.x = event.pageX;
			self.center.y = event.pageY;
		});
	});
	$canvasElem.mouseup(function(event) {
		$canvasElem.unbind('mousemove');
	});
	$canvasElem.bind('touchmove', function (event) {
		var touch = event.originalEvent.touches[0] || event.originalEvent.changedTouches[0];
		event.preventDefault();
		self.center.x = touch.pageX - self.ctx.canvas.offsetLeft;
		self.center.y = touch.pageY - self.ctx.canvas.offsetTop
	});
	this.drawBackground();
	setInterval(function () {
		self.draw();
		self.runPhysics();
	}, GS.Const.FPS);
};
GS.World.prototype.initWorld = function () {
	this.ctx.canvas.width = GS.Const.width;
	this.ctx.canvas.height = GS.Const.height;
	this.center = { x: GS.Const.width / 2, y: GS.Const.height / 2, rad: 10, mass: 4000 };
	this.particles = this.generateParticles(GS.Const.particleAmount);
};

GS.World.prototype.generateParticles = function (length) {
	var particles = [];
	var xMul = GS.Const.width;
	var yMul = GS.Const.height;
	var massMul = GS.Const.massMax;
	var radMul = GS.Const.maxRadious - GS.Const.minRadious;
	var speedMul = GS.Const.particleMaxSpeed;
	for (var i = 0; i < length; i++) {
		particles.push(new GS.Particle({
			x: Math.round(Math.random() * xMul),
			y: Math.round(Math.random() * yMul),
			rad: Math.round(Math.random() * radMul + GS.Const.minRadious),
			vx: Math.round(Math.random() * speedMul),
			vy: Math.round(Math.random() * speedMul),
		}));
		particles[i].mass = particles[i].rad;
	}
	return particles;
};

GS.World.prototype.runPhysics = function () {
	this.calcForces();
	this.calcSmallForces();
	this.accelerateAndMove();
}
GS.World.prototype.calcForces = function () {
	var current;
	var GravityMass = this.center.mass;
	for (var i = 0; i < this.particles.length; i += 1) {
		current = this.particles[i];
		var dx = current.x - this.center.x;
		var dy = current.y - this.center.y;
		var dPowed = Math.pow(dx * dx + dy * dy, 0.8);
		var force = GravityMass / dPowed;
		var angle = Math.abs(Math.atan(dy/dx));
		var fx = force * Math.cos(angle);
		var fy = force * Math.sin(angle);
		if (current.x < this.center.x) {
			current.fx = fx;
		} else {
			current.fx = -fx;
		}

		if (current.y > this.center.y) {
			current.fy = -fy;
		} else {
			current.fy = fy;
		}
	}
}
GS.World.prototype.calcSmallForces = function () {
	var current;
	var other;
	for (var i = 0; i < this.particles.length - 1; i += 1) {
		current = this.particles[i];
		var GravityMass = current.mass;
		for (var j = i + 1; j < this.particles.length; j += 1) {
			other = this.particles[j];
			var dx = current.x - other.x;
			var dy = current.y - other.y;
			var dPowed = Math.pow(dx * dx + dy * dy, 0.8);
			var force = GravityMass / dPowed;
			var angle = Math.abs(Math.atan(dy/dx));
			var fx = force * Math.cos(angle);
			var fy = force * Math.sin(angle);
			if (current.x < other.x) {
				current.fx += fx;
				other.fx -= fx;
			} else {
				current.fx -= fx;
				other.fx += fx
			}

			if (current.y > other.y) {
				current.fy -= fy;
				other.fy += fy;
			} else {
				current.fy += fy;
				other.fy -= fy;
			}
		}
	}
}
GS.World.prototype.accelerateAndMove = function () {
	for (var i = 0; i < this.particles.length; i += 1) {
		var current = this.particles[i];
		current.advance();
/*
		if(Math.pow(current.x - this.center.x, 2) +
			Math.pow(current.y - this.center.y, 2) <=
			this.center.rad * this.center.rad) {

			this.center.mass += current.mass * 10;
			this.center.rad += 0.8;
			this.particles.splice(i, 1);
			GS.Colors.starFillStyle = this.colorLuminance(GS.Colors.starFillStyle, -0.04);
			i -= 1;
		}
*/
	}
}
GS.World.prototype.drawBackground = function () {
	this.ctx.fillStyle = GS.Colors.bgFillStyle;
	this.ctx.fillRect(0, 0, GS.Const.width, GS.Const.height);
};
GS.World.prototype.colorLuminance = function (hex, lum) {
	// validate hex string
	hex = String(hex).replace(/[^0-9a-f]/gi, '');
	if (hex.length < 6) {
		hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
	}
	lum = lum || 0;
	// convert to decimal and change luminosity
	var rgb = "#", c, i;
	for (i = 0; i < 3; i++) {
		c = parseInt(hex.substr(i*2,2), 16);
		c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
		rgb += ("00"+c).substr(c.length);
	}
	return rgb;
}
GS.World.prototype.drawParticles = function () {
	this.ctx.fillStyle = GS.Colors.starFillStyle;
	this.ctx.beginPath();
	this.ctx.arc(this.center.x, this.center.y, this.center.rad, 0, 2*Math.PI, true);
	this.ctx.fill();
	this.ctx.fillStyle = GS.Colors.particleFillStyle;
	for (var i = 0; i < this.particles.length; i += 1) {
		this.ctx.beginPath();
		this.ctx.arc(this.particles[i].x, this.particles[i].y,
				this.particles[i].rad, 0, 2*Math.PI, true);
		this.ctx.fill();
		this.ctx.stroke();
	}
};
GS.World.prototype.draw = function () {
	this.drawParticles();
};

GS.Particle = function (options) {
	this.rad = options.rad || 1;
	this.mass = options.mass || 1;
	this.x = options.x || 0;
	this.y = options.y || 0;
	this.vx = options.vx || 0;
	this.vy = options.vy || 0;
	this.fx = 0;
	this.fy = 0;
};
GS.Particle.prototype.advance = function()  {
	this.vx += this.fx / this.mass;
	this.vy += this.fy / this.mass;
	if (this.vx >= GS.Const.speedLimit) {
		this.vx = GS.Const.speedLimit;
	} else if (this.vx <= -GS.Const.speedLimit) {
		this.vx = -GS.Const.speedLimit;
	}
	if (this.vy >= GS.Const.speedLimit) {
		this.vy = GS.Const.speedLimit;
	} else if (this.vy <= -GS.Const.speedLimit) {
		this.vy = -GS.Const.speedLimit;
	}
	this.x += this.vx;
	this.y += this.vy;

/*
	if (this.x - this.rad <= 0) {
		this.x = GS.Const.width - this.rad;
		this.vx = 0;
	} else if (this.x + this.rad >= GS.Const.width) {
		this.x = this.rad;
		this.vx = 0;
	}

	if (this.y - this.rad <= 0) {
		this.y = GS.Const.height - this.rad;
		this.vy = 0;
	} else if (this.y + this.rad >= GS.Const.height) {
		this.y = this.rad;
		this.vy = 0;
	}
*/	
};

GS.Const = {
	width: $(window).width(),
	height: $(window).height(),
	
	maxRadious: 7,
	minRadious: 3,
	particleAmount: 5,
	particleMaxSpeed: 2,
	speedLimit: 20,
	FPS: 1000 / 60,	
};
GS.Colors = {
	particleFillStyle:'rgba(128,128,255,1)',
	bgFillStyle: 'rgba(40,40,40,0.6)',
	starFillStyle: '#FF0'
};

$(document).ready(function () {
	world = new GS.World($('#gameview')[0]);
	world.start();
});

