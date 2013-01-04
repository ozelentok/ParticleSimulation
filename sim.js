var GS = {};
$('#main').css('width', $(window).width() + 'px');
GS.World = function (canvas) {
	this.ctx = canvas.getContext('2d');
	this.ctx.globalCompositeOperation = 'lighter'; // enable "tails"
	this.ctx.strokeStyle = 'black';
	this.ctx.canvas.width = GS.Const.width;
	this.ctx.canvas.style.width = GS.Const.width + 'px'
	this.ctx.canvas.height = GS.Const.height;
	this.ctx.canvas.style.height = GS.Const.height + 'px';
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
	this.particles = this.generateParticles(8); // moving particles
	this.stars = []; // static particles
	this.drawBackground();
};

GS.World.prototype.runPhysics = function () {
	this.calcStarsForces();
	this.calcParticlesForces();
	this.accelerateAndMove();
};
GS.World.prototype.generateParticles = function (length) {
	var particles = [];
	var xMul = GS.Const.width;
	var yMul = GS.Const.height;
	var massMul = GS.Const.massMax;
	var radMul = GS.Const.maxRadious - GS.Const.minRadious;
	var speedMul = GS.Const.particleMaxSpeed;
	for (var i = 0; i < length; i += 1) {
		particles.push(new GS.Particle({
			x: Math.round(Math.random() * xMul),
			y: Math.round(Math.random() * yMul),
			rad: Math.round(Math.random() * 15 + 5),
			vx: Math.round(Math.random() * 10 - 5),
			vy: Math.round(Math.random() * 10 - 5),
		}));
		particles[i].mass = 100 * particles[i].rad;
	}
	return particles;
};
GS.World.prototype.calcStarsForces = function () {
	for (var i = 0, starsLen = this.stars.length; i < starsLen; i += 1) {
		var star = this.stars[i];
		for(var k = 0, partLen = this.particles.length; k < partLen; k += 1) {
			var particle = this.particles[k];
			var dx = particle.x - star.x;
			var dy = particle.y - star.y;
			var angle = Math.abs(Math.atan(dy/dx));
			var dPowed = dx * dx + dy * dy
			var force = star.mass / dPowed;
			var fx = force * Math.cos(angle);
			var fy = force * Math.sin(angle);
			if (dx > 0) {
				particle.fx -= fx;
			} else {
				particle.fx += fx;
			}
			if (dy > 0) {
				particle.fy -= fy;
			} else {
				particle.fy += fy;
			}
		}
	}
}
GS.World.prototype.calcParticlesForces = function () {
	for (var i = 0, partLen = this.particles.length; i < partLen - 1; i += 1) {
		var mainParticle = this.particles[i];
		for(var k = i + 1; k < partLen; k += 1) {
			var otherParticle = this.particles[k];
			var dx = otherParticle.x - mainParticle.x;
			var dy = otherParticle.y - mainParticle.y;
			var angle = Math.abs(Math.atan(dy/dx));
			var dPowed = dx * dx + dy * dy;
			var force = otherParticle.mass * mainParticle.mass / dPowed;
			var fx = force * Math.cos(angle);
			var fy = force * Math.sin(angle);
			if (dx > 0) {
				otherParticle.fx -= fx;
				mainParticle.fx += fx;
			} else {
				otherParticle.fx += fx;
				mainParticle.fx -= fx;
			}
			if (dy > 0) {
				otherParticle.fy -= fy;
				mainParticle.fy += fx;
			} else {
				otherParticle.fy += fy;
				mainParticle.fy -= fx;
			}
		}
	}
}
GS.World.prototype.accelerateAndMove = function () {
	var currentTime = Date.now();
	for (var i = 0, partLen = this.particles.length; i < partLen; i += 1) {
		this.particles[i].advance();
	}
	this.previousTime = currentTime;
}
GS.World.prototype.drawBackground = function () {
	this.ctx.fillStyle = GS.Colors.bgFillStyle;
	this.ctx.fillRect(0, 0, GS.Const.width, GS.Const.height);
};
GS.World.prototype.drawStarsParticles = function () {
	this.ctx.fillStyle = GS.Colors.starFillStyle;
	for (var i = 0, starsLen = this.stars.length; i < starsLen; i += 1) {
		var star = this.stars[i];
		this.ctx.beginPath();
		this.ctx.arc(star.x, star.y,
				star.rad, 0, 2*Math.PI, true);
		this.ctx.fill();
		this.ctx.stroke();
	}
	this.ctx.fillStyle = GS.Colors.particleFillStyle;
	for (var i = 0, partLen = this.particles.length; i < partLen; i += 1) {
		var particle = this.particles[i];
		this.ctx.beginPath();
		this.ctx.arc(particle.x, particle.y,
				particle.rad, 0, 2*Math.PI, true);
		this.ctx.fill();
		this.ctx.stroke();
	}
};
GS.World.prototype.draw = function () {
	this.drawBackground();
	this.drawStarsParticles();
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
	this.fx = 0;
	this.fy = 0;

	if (this.x - this.rad <= 0) {
		this.x = this.rad;
		this.vx = -this.vx / 2;
	} else if (this.x + this.rad >= GS.Const.width) {
		this.x = GS.Const.width - this.rad;
		this.vx = -this.vx / 2;
	}

	if (this.y - this.rad <= 0) {
		this.y = this.rad;
		this.vy = -this.vy / 2;
	} else if (this.y + this.rad >= GS.Const.height) {
		this.y = GS.Const.height - this.rad;
		this.vy = -this.vy / 2;
	}
};

GS.Const = {
	width: $(window).width() - 250,
	height: $(window).height(),
	
	particleRad: 10,
	starRad: 20,
	speedLimit: 15,
	FPS: 1000 / 40,	
};
GS.Colors = {
	particleFillStyle:'rgba(128,128,255,1)',
	bgFillStyle: 'rgba(40,40,40,0.6)',
	starFillStyle: '#FF0'
};

$(document).ready(function () {
	var world = new GS.World($('#gameview')[0]);
	world.start();
});

