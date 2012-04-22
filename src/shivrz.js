window.onload = function() {

	window.canvas = document.getElementById('test_canvas_1');
	window.context = canvas.getContext('2d');
	
	modula.use();	
		
	var shipSprite = new RendererCanvas2d.DrawableSprite({
		src:'img/ship_yellow.png',
	});
	var shipSpriteFiring = new RendererCanvas2d.DrawableSprite({
		src:'img/ship_yellow_firing.png',
	});
	
	var missileSprite = new RendererCanvas2d.DrawableSprite({
		src:'img/projectile.png',
		globalCompositeOperation: 'lighter',
	});
	
	var explosionSprite = new RendererCanvas2d.DrawableSprite({
		src:'img/explosion128blue.png',
		globalCompositeOperation: 'lighter',
	});
	
	var MissileExplosion = Ent.extend({
		init: function(opt){
			this._super(opt);
			this.drawable = explosionSprite.clone();
			this.transform.rotation = Math.random() * 6.28;
		},
		on_first_update:function(){
			this.destroy(0.4);
		},
		on_update: function(){
			this.drawable.alpha = Math.max(0,1-(5*(this.main.time - this.start_time)));
			this.transform.scale *= 1.05;
		},
	});
	
	var Missile = Ent.extend({
		init: function(opt){
			this._super(opt);
			this.dir = opt.dir || new Vec2(1,0);
			this.herit_speed = opt.herit_speed || new Vec2(); 
			this.speed = opt.speed || 1000;
			this.speed_vec = this.dir.scale(this.speed).add(this.herit_speed);
			this.drawable = opt.drawable || missileSprite;
			this.transform.set_rotation_deg( this.speed_vec.angle_deg() + 90);
		},
		on_first_update:function(){
			this.destroy(0.7);
		},
		on_update: function(){
			this.transform.translate(this.speed_vec.scale(this.main.delta_time));
			this.transform.scale = Math.max(0.3, Math.min(0.7, 20*(this.main.time - this.start_time) ));
		},
		on_destroy: function(){
			this.main.scene.add_ent(new MissileExplosion({pos:this.transform.pos}) );
		},
	});
	
	
	var PlayerShip = Ent.extend({
		init: function(opt){
			this._super(opt);
			console.log('init');
			
			this.move_speed   = new Vec2();
			this.move_dir     = new Vec2();
			this.aimdir       = new Vec2();
			this.max_speed    = 500;
			this.acceleration = 100000;
			this.color        = '#F00';
			this.radius       = 20;
			
			this.shipSprite   = shipSprite.clone();
			this.shipSpriteFiring = shipSpriteFiring.clone();
			this.drawable     = this.shipSprite;  
			
			
			this.last_fire_time = 0;
			this.fire_interval = 0.1;
		},
	
		on_update: function(){
			var input = this.main.input;
			this.aimdir = input.get('mouse_pos').sub(this.transform.pos).normalize();
			
			//console.log('move_speed:', this.move_speed, this.get('move_speed') );
			
			if(input.is_key_down('a')){
				//console.log('A : left');
				this.move_dir.x = -1;
			}else if(input.is_key_down('d')){
				//console.log('D : right');
				this.move_dir.x = 1;
			}else{
				this.move_dir.x = 0;
			}
			if(input.is_key_down('w')){
			
				//console.log('W : up');
				this.move_dir.y = -1;
			}else if(input.is_key_down('s')){
				
				//console.log('S : down');
				this.move_dir.y = 1;
			}else{
				this.move_dir.y = 0;
			}
			if(this.move_dir.x === 0){
				this.move_speed.x = 0;
			}else{
				if(this.move_dir.x * this.move_speed.x < 0){
					this.move_speed.x = 0;
				}
				this.move_speed.x += (this.move_dir.x * this.acceleration) * this.main.delta_time;
				
				if(Math.abs( this.move_speed.x ) > this.max_speed){
					this.move_speed.x = this.move_dir.x * this.max_speed;
				}
			}
			if(this.move_dir.y === 0){
				this.move_speed.y = 0;
			}else{
				if(this.move_dir.y * this.move_speed.y < 0){
					this.move_speed.y = 0;
				}
				this.move_speed.y += (this.move_dir.y * this.acceleration) * this.main.delta_time;
				
				if(Math.abs( this.move_speed.y ) > this.max_speed){
					this.move_speed.y = this.move_dir.y * this.max_speed;
				}
					
			}
			
			if(input.is_key_down('mouse0') && this.main.time > this.last_fire_time + this.fire_interval){
				this.last_fire_time = this.main.time;
				this.main.scene.add_ent(new Missile({ 
					pos: this.transform.pos.add(this.aimdir.scale(40)), 
					dir: this.aimdir,
					herit_speed: this.move_speed.scale(0.5),
				}));
			}
			if( this.main.time - this.last_fire_time < 0.05 ){
				this.drawable = this.shipSpriteFiring;
			}else{
				this.drawable = this.shipSprite;
			}
			
			if(this.move_speed.len() > this.max_speed){
				this.move_speed = this.move_speed.set_len(this.max_speed);
			}
			
			this.transform.translate(this.move_speed.scale(this.main.delta_time));
			
			this.transform.set_rotation_deg(this.aimdir.angle_deg() + 90);
		},
	});
	
	var ShivrzScene = Scene.extend({
		on_scene_start: function(){
			this.last_time = -1;
			this.add_ent(new PlayerShip({}));
		},
		on_frame_start: function(){
			context.canvas.width = window.innerWidth;
			context.canvas.height = window.innerHeight;
		},
		on_frame_end: function(){
		},
	});


	

	
	window.main   = new Main({
		fps: 60,
		input: new Input('body'),
		scene: new ShivrzScene({
			renderer: new RendererCanvas2d({
				canvas:window.canvas,
				background: '#324',
				//globalCompositeOperation: 'lighter'
			}),
		}),
	});
	

	window.main.run();
};
