var GS = {};
GS.World = function ($canvas) {
	this.$canvas = $canvas;
	this.ctx = $canvas[0].getContext('2d');
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
	this.particles = [] // moving particles
	this.stars = []; // static particles
	this.starCreateMode = false;
	this.drawBackground();
	this.attachEvents();
};
GS.World.prototype.attachEvents = function () {
	var self = this;
	$('#particleRadio').click(function() {
		self.starCreateMode = false;
	});
	$('#starRadio').click(function() {
		self.starCreateMode = true;
	})
	self.$canvas.mousedown(function (e) {
		if(self.starCreateMode) {
			self.createStar(e.pageX, e.pageY);
		} else {
			self.createParticle(e.pageX, e.pageY);
		}
	});

}
GS.World.prototype.runPhysics = function () {
	this.calcStarsForces();
	this.calcParticlesForces();
	this.accelerateAndMove();
};
GS.World.prototype.createParticle = function (x, y) {
	this.particles.push(new GS.Particle({
		x: x,
		y: y,
		rad: GS.Const.particleRad,
		mass: GS.Const.particleMass,
	}));
}
GS.World.prototype.createStar = function (x, y) {
	this.stars.push(new GS.Particle({
		x: x,
		y: y,
		rad: GS.Const.starRad,
		mass: GS.Const.starMass,
	}));	
}
GS.World.prototype.calcStarsForces = function () {
	for (var i = 0, starsLen = this.stars.length; i < starsLen; i += 1) {
		var star = this.stars[i];
		for(var k = 0, partLen = this.particles.length; k < partLen; k += 1) {
			var particle = this.particles[k];
			var dx = particle.x - star.x;
			var dy = particle.y - star.y;
			var dPowed = dx * dx + dy * dy;
			if(dPowed > GS.Const.minDistance) {
				var angle = Math.abs(Math.atan(dy/dx));
				var force = GS.Const.gravityConst * star.mass * particle.mass / dPowed;
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
}
GS.World.prototype.calcParticlesForces = function () {
	for (var i = 0, partLen = this.particles.length; i < partLen - 1; i += 1) {
		var mainParticle = this.particles[i];
		for(var k = i + 1; k < partLen; k += 1) {
			var otherParticle = this.particles[k];
			var dx = otherParticle.x - mainParticle.x;
			var dy = otherParticle.y - mainParticle.y;
			var dPowed = dx * dx + dy * dy;
			if(dPowed > GS.Const.minDistance) {	
				var angle = Math.abs(Math.atan(dy/dx));
				var force = GS.Const.gravityConst * otherParticle.mass * mainParticle.mass / dPowed;
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
}
GS.World.prototype.accelerateAndMove = function () {
	this.currentTime = Date.now() / 22;
	var dt = this.currentTime - this.prevTime;
	for (var i = 0, partLen = this.particles.length; i < partLen; i += 1) {
		this.particles[i].advance(dt);
	}
	this.prevTime = this.currentTime;
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
GS.Particle.prototype.advance = function(dt)  {
	var vxNew = this.vx + dt * this.fx / this.mass;
	var vyNew = this.vy + dt * this.fy / this.mass;
	var dtPowed = dt * dt;
	if (vxNew >= GS.Const.speedLimit) {
		vxNew = this.vx;
	if (vyNew >= GS.Const.speedLimit)
		vyNew = this.vy;
	}
	this.x += ((this.vx + vxNew) / 2) * dtPowed;
	this.y += ((this.vx + vyNew) / 2) * dtPowed;
	this.vx = vxNew;
	this.vy = vyNew;
	this.fx = 0;
	this.fy = 0;

	if (this.x - this.rad <= 0) {
		this.x = this.rad;
		if(this.vx < 0) {
			this.vx = -this.vx / 2;
		}
	} else if (this.x + this.rad >= GS.Const.width) {
		this.x = GS.Const.width - this.rad;
		if(this.vx > 0) {
			this.vx = -this.vx / 2;
		}
	}

	if (this.y - this.rad <= 0) {
		this.y = this.rad;
		if(this.vx < 0) {
			this.vy = -this.vy / 2;
		}
	} else if (this.y + this.rad >= GS.Const.height) {
		this.y = GS.Const.height - this.rad;
		if(this.vy > 0) {
			this.vy = -this.vy / 2;
		}
	}
};


GS.Const = {
	width: $(window).width() - 220,
	height: $(window).height(),
	
	minDistance: 120,
	particleRad: 5,
	particleMass: 2,
	starRad: 10,
	starMass: 7,
	gravityConst: 250,
	speedLimit: 10,
	FPS: 1000 / 60,	
};
GS.Colors = {
	particleFillStyle:'rgba(128,128,255,1)',
	bgFillStyle: 'rgba(40,40,40,0.6)',
	starFillStyle: 'rgb(200, 80, 0)',
};

$(document).ready(function () {
	$('#main').css('width', $(window).width() + 'px');
	var world = new GS.World($('#gameview'));
	world.start();
});

