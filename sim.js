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
	this.prevTime = Date.now();
	window.requestAnimFrame = (function() {
		return window.requestAnimationFrame    || 
				window.webkitRequestAnimationFrame || 
				window.mozRequestAnimationFrame    || 
				window.oRequestAnimationFrame      || 
				window.msRequestAnimationFrame     || 
				function(callback){
					window.setTimeout(callback, GS.Const.FrameRate);
				};
	})();
	requestAnimFrame(this.tick.bind(this));
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
	$('#particleRadio').prop('checked', true);
	$('#particleRadio').click(function(e) {
		self.starCreateMode = false;
	});
	$('#starRadio').prop('checked', false);
	$('#starRadio').click(function(e) {
		self.starCreateMode = true;
	});

	$('#polarityBox').prop('checked', false);
	$('#polarityBox').click(function() {
		if(this.checked) {
			GS.Const.polarity = -1;
		} else {
			GS.Const.polarity = 1;
		}
	});
	$('#timeSpeedBox').val(GS.Const.timeSpeed *  1000);
	$('#timeSpeedBox').change(function() {
		GS.Const.timeSpeed = (parseFloat($('#timeSpeedBox').val()) / 1000) || GS.Const.timeSpeed;
		$('#timeSpeedBox').val(GS.Const.timeSpeed * 1000);
	});

	$('#gravityBox').val(GS.Const.gravityConst);
	$('#gravityBox').change(function() {
		GS.Const.gravityConst = parseFloat($('#gravityBox').val()) || GS.Const.gravityConst;
		$('#gravityBox').val(GS.Const.gravityConst);
	});

	$('#particleMassBox').val(GS.Const.particleMass);
	$('#particleMassBox').change(function() {
		GS.Const.particleMass = parseFloat($('#particleMassBox').val()) || GS.Const.particleMass;
		$('#particleMassBox').val(GS.Const.particleMass);
	});

	$('#starMassBox').val(GS.Const.starMass);
	$('#starMassBox').change(function() {
		GS.Const.starMass = parseFloat($('#starMassBox').val()) || GS.Const.starMass;
		$('#starMassBox').val(GS.Const.starMass);
	});
	self.$canvas.bind('click', function (e) {
		if(self.starCreateMode) {
			self.createStar(e.pageX, e.pageY);
		} else {
			self.createParticle(e.pageX, e.pageY);
		}
	});

}
GS.World.prototype.tick = function () {	
	requestAnimFrame(this.tick.bind(this));
	this.draw();
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
			//var angle = Math.atan2(dy, dx);
			var d = Math.sqrt(dPowed);
			if(d === 0) {
				continue;
			}	
			var force = GS.Const.polarity * GS.Const.gravityConst * star.mass * particle.mass / dPowed;
			//var fx = force * Math.cos(angle;
			//var fy = force * Math.sin(angle);
			var fx = force * dx / d;
			var fy = force * dy / d;
			particle.fx -= fx;
			particle.fy -= fy;
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
			//var angle = Math.atan2(dy, dx);
			var d = Math.sqrt(dPowed);
			if(d === 0) {
				continue;
			}
			var force = GS.Const.polarity * GS.Const.gravityConst * otherParticle.mass * mainParticle.mass / dPowed;
			//var fx = force * Math.cos(angle);
			//var fy = force * Math.sin(angle);
			var fx = force * dx / d;
			var fy = force * dy / d;
			otherParticle.fx -= fx;
			otherParticle.fy -= fy;
			mainParticle.fx += fx;
			mainParticle.fy += fy;
		}
	}
}
GS.World.prototype.accelerateAndMove = function () {
	this.currentTime = Date.now();
	var dt = (this.currentTime - this.prevTime) * GS.Const.timeSpeed;
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

GS.Particle.prototype.normalizeSpeed = function() {
	var speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
	if(speed > GS.Const.speedLimit) {
		var ratio = GS.Const.speedLimit / speed;
		this.vx *= ratio;
		this.vy *= ratio;
	}
};

GS.Particle.prototype.checkWallsCollision = function() {
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
		if(this.vy < 0) {
			this.vy = -this.vy / 2;
		}
	} else if (this.y + this.rad >= GS.Const.height) {
		this.y = GS.Const.height - this.rad;
		if(this.vy > 0) {
			this.vy = -this.vy / 2;
		}
	}
};
GS.Particle.prototype.advance = function(dt)  {
	var vxNew = this.vx + dt * this.fx / this.mass;
	var vyNew = this.vy + dt * this.fy / this.mass;
	this.vx = vxNew;
	this.vy = vyNew;
	this.normalizeSpeed();
	this.x += this.vx * dt;
	this.y += this.vy * dt;
	this.fx = 0;
	this.fy = 0;

	this.checkWallsCollision();
};


GS.Const = {
	width: $(window).width(),
	height: $(window).height(),
	
	particleRad: 5,
	particleMass: 2,
	starRad: 10,
	starMass: 7,
	gravityConst: 250,
	polarity: 1,
	timeSpeed: 0.025,
	speedLimit: 18,
	FrameRate: 1000 / 60,	
};
GS.Const.lowerSpeedLimit = -GS.Const.upperSpeedLimit;
GS.Colors = {
	particleFillStyle:'rgba(128,128,255,1)',
	bgFillStyle: 'rgba(40,40,40,0.6)',
	starFillStyle: 'rgb(200, 80, 0)',
};
GS.Sidebar = function($sidebar) {
	var self = this;
	this.$sidebar = $sidebar;
	this.isClosed = false;
	this.moving = false;
	this.$sidebar.bind('dblclick touchmove', function() {
		if(self.moving)
			return;
		self.moving = true;
		if(self.isClosed) {
			self.open();
			self.isClosed = false;
		} else { 
			self.close();
			self.isClosed = true;
		}
	});
	this.$sidebar.find('label').bind('dblclick touchmove', function(e) {
		e.stopPropagation();
	});
}
GS.Sidebar.prototype.close = function () {
	var self = this;
	this.$sidebar.animate({
		left:-270
	}, 400, 'linear', function () {
		self.moving = false;
	});
}
GS.Sidebar.prototype.open = function() {
	var self = this;
	this.$sidebar.animate({
		left:0
	}, 400, 'linear',function() {
		self.moving = false;
	});
}

$(document).ready(function () {
	$('#main').css('width', $(window).width() + 'px');
	var world = new GS.World($('#gameview'));
	var sidebar = new GS.Sidebar($('#sidebar'));
	world.start();
});

