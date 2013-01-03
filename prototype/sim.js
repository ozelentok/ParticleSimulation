var GS = {};

GS.World = function (canvas) {
	this.ctx = canvas.getContext('2d');
	this.ctx.strokeStyle = 'black';
};
GS.World.prototype.start = function () {
	this.initWorld();
	var self = this;
	setInterval(function () {
		self.draw();
		self.runPhysics();
	}, GS.Const.FPS);
};
GS.World.prototype.initWorld = function () {
	this.previousTime = Date.now();
	this.ctx.canvas.width = GS.Const.width;
	this.ctx.canvas.height = GS.Const.height;
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
	particles[0].mass = 200;
	return particles;
};

GS.World.prototype.runPhysics = function () {
	this.calcSmallForces()
	this.accelerateAndMove();
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
		this.particles[i].advance();
	}
}
GS.World.prototype.drawBackground = function () {
	this.ctx.fillStyle = GS.Colors.bgFillStyle;
	this.ctx.fillRect(0, 0, GS.Const.width, GS.Const.height);
};

GS.World.prototype.drawParticles = function () {
	this.ctx.fillStyle = GS.Colors.waterFillStyle;
	for (var i = 0; i < this.particles.length; i += 1) {
		this.ctx.beginPath();
		this.ctx.arc(this.particles[i].x, this.particles[i].y,
				this.particles[i].rad, 0, 2*Math.PI, true);
		this.ctx.fill();
		this.ctx.stroke();
	}
};
GS.World.prototype.draw = function () {
	this.drawBackground();
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
GS.Particle.prototype.advance = function () {
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
	this.fx = 0;
	this.fy = 0;



	if (this.x - this.rad <= 0) {
		this.x = this.rad;
		if (this.vx <= 0) {
			this.vx *= -0.5;
		}
	} else if (this.x + this.rad >= GS.Const.width) {
		this.x = GS.Const.width - this.rad;
		if (this.vx >= 0) {
			this.vx *= -0.5;
		}
	}

	if (this.y - this.rad <= 0) {
		this.y = this.rad;
		if (this.vy <= 0) {
			this.vy *= -0.5;
		}
	} else if (this.y + this.rad >= GS.Const.height) {
		this.y = GS.Const.height - this.rad;
		if (this.vy >= 0) {
			this.vy *= -0.5;
		}
	}
	
};

GS.Const = {
	width: $(window).width(),
	height: $(window).height(),
	
	maxRadious: 20,
	minRadious: 15,
	particleAmount: 50,
	particleMaxSpeed: 2,
	speedLimit: 2,
	FPS: 1000 / 60,		
};
GS.Colors = {
	waterFillStyle: '#0af',
	bgFillStyle: '#333',
};

$(document).ready(function () {
	var world = new GS.World($('#gameview')[0]);
	world.start();
});

