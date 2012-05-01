
(function(modula){

	// Multiply a number expressed in radiant by radToDeg to convert it in degrees
	var radToDeg = 57.29577951308232;
	modula.radToDeg = radToDeg;

	// Multiply a number expressed in degrees by degToRad to convert it to radiant
	var degToRad = 0.017453292519943295;
	modula.degToRad = degToRad;

	// The numerical precision used to compare vector equality
	modula.epsilon   = 0.0000001;

	var epsilonEquals = function(a,b){
		return Math.abs(a-b) <= modula.epsilon;
	};

	var Vec2 = modula.Vec2;
	
	function Mat2(){

		//   | xx xy |
		//   | yx yy |
		
		this.xx = 1;
		this.xy = 0;
		this.yx = 0;
		this.yy = 1;

		if (arguments.length === 1){
			var arg = arguments[0];

			this.xx = arg.xx || this.xx;
			this.xy = arg.xy || this.xy;
			this.yx = arg.yx || this.yx;
			this.yy = arg.yy || this.yy;

		} else if (arguments.length === 4){
			this.xx = arguments[0];
			this.xy = arguments[1];
			this.yx = arguments[2];
			this.yy = arguments[3];
		}
	}

	modula.Mat2 = Mat2;

	var proto = Mat2.prototype;

	proto.type	= 'mat';
	proto.dimension = 2;
	proto.fullType = 'mat2';

	Mat2.zero = function(){ return new Mat2(0,0,0,0); };
	Mat2.id   = function(){ return new Mat2(1,0,0,1); };
	Mat2.one  = function(){ return new Mat2(1,1,1,1); };

	proto.equals = function(mat){
		return  this.fullType === mat.fullType && 
			epsilonEquals(this.xx, mat.xx) &&
			epsilonEquals(this.xy, mat.xy) &&
			epsilonEquals(this.yx, mat.yx) &&
			epsilonEquals(this.yy, mat.yy);
	};

	proto.clone = function(){
		var m = new Mat2();
		m.xx = this.xx;
		m.xy = this.xy;
		m.yx = this.yx;
		m.yy = this.yy;
		return m;
	};
	
	proto.scale = function(mat){
		var m = this.clone();
		if(m.xx !== undefined){
			m.xx *= mat.xx;
			m.xy *= mat.xy;
			m.yx *= mat.yx;
			m.yy *= mat.yy;
		}else{
			m.xx *= mat;
			m.xy *= mat;
			m.yx *= mat;
			m.yy *= mat;
		}
		return m;
	};

	proto.add = function(mat){
		var m = this.clone();
		if(m.xx !== undefined){
			m.xx += mat.xx;
			m.xy += mat.xy;
			m.yx += mat.yx;
			m.yy += mat.yy;
		}else{
			m.xx += mat;
			m.xy += mat;
			m.yx += mat;
			m.yy += mat;
		}
		return m;
	};

	proto.sub = function(mat){
		var m = this.clone();
		if(m.xx !== undefined){
			m.xx -= mat.xx;
			m.xy -= mat.xy;
			m.yx -= mat.yx;
			m.yy -= mat.yy;
		}else{
			m.xx -= mat;
			m.xy -= mat;
			m.yx -= mat;
			m.yy -= mat;
		}
		return m;
	};
	
	proto.neg = function(){
		var m = this.clone();
		m.xx = - this.xx;
		m.xy = - this.xy;
		m.yx = - this.yx;
		m.yy = - this.yy;
		return m;
	};

	proto.mult = function(mat){
		var m = this.clone();
		// xx xy
		// yx yy
		m.xx = this.xx * mat.xx + this.xy * mat.yx;
		m.xy = this.xx * mat.xy + this.xy * mat.yy;
		m.yx = this.yx * mat.xx + this.yy * mat.yx;
		m.yy = this.yx * mat.xy + this.yy * mat.yy;
		return m;
	};

	proto.multVec = function(vec){
		var v = new Vec2();
		v.x = this.xx * vec.x + this.xy * vec.y;
		v.y = this.yx * vec.x + this.yy * vec.y;
		return v;
	};

	proto.det = function(){
		return this.xx * this.yy - this.xy * this.yx;
	};

	proto.invert = function(){
		var m = new Mat2();
		var det = this.det();
		if(det){
			det = 1.0 / det;
			m.xx = det * this.yy;
			m.xy = det * -this.xy;
			m.yx = det * -this.yx;
			m.yy = det * this.xx;
		}
		return m;
	};

	Mat2.rotation = function(angle){
		var m = new Mat2();
		var c = Math.cos(angle);
		var s = Math.sin(angle);
		m.xx = c;
		m.xy = -s;
		m.yx = s;
		m.yy = c;
		return m;
	};

	Mat2.rotationDeg = function(angle){
		return Mat2.rotation(angle * modula.degToRad);
	};

	Mat2.scale = function(fac){
		return new Mat2(fac,0,0,fac);
	};

	proto.rotate = function(angle){
		var rot = Mat2.rotation(angle);
		return this.mult(rot);
	};

	proto.rotateDeg = function(angle){
		return this.rotate(angle * modula.degToRad);
	};

	proto.transpose = function(){
		return new Mat2(this.xx,this.yx,this.xy,this.yy);
	};

	proto.diagonal = function(){
		return new Vec2(this.xx,this.yy);
	};

	proto.setDiagonal = function(vec){
		var m = this.clone();
		m.xx = vec.x;
		m.yy = vec.y;
		return m;
	};

	proto.trace = function(){
		return this.xx + this.yy;
	};

	proto.row = function(index){
		if(index === 0){
			return new Vec2(this.xx, this.xy);
		}else if(index === 1){
			return new Vec2(this.yx, this.yy);
		}
	};

	proto.setRow = function(index, vec){
		var m = this.clone();
		if(index === 0){
			m.xx = vec.x;
			m.xy = vec.y;
		}else if(index === 1){
			m.yx = vec.x;
			m.yy = vec.y;
		}
		return m;
	};

	proto.collumn = function(index){
		if(index === 0){
			return new Vec2(this.xx, this.yx);
		}else if(index === 1){
			return new Vec2(this.xy, this.yy);
		}
	};

	proto.setCollumn = function(index, vec){
		var m = this.clone();
		if(index === 0){
			m.xx = vec.x;
			m.yx = vec.y;
		}else if(index === 1){
			m.xy = vec.x;
			m.yy = vec.y;
		}
		return m;
	};

	proto.array = function(){
		return [this.xx, this.xy, this.yx, this.yy];
	};

})(window.modula);


