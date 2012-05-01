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
		pos: new Vec2(0,20),
	});
	
	var explosionSprite = new RendererCanvas2d.DrawableSprite({
		src:'img/explosion128blue.png',
		globalCompositeOperation: 'lighter',
	});
	
	var blockSprite = new RendererCanvas2d.DrawableSprite({
		src:'img/block.png',
	});
	var blockSpriteYellow = new RendererCanvas2d.DrawableSprite({
		src:'img/blockyellow.png',
	});
	
	var MissileExplosion = Ent.extend({
		init: function(opt){
			this._super(opt);
			this.drawable = explosionSprite.clone();
			this.transform.rotation = Math.random() * 6.28;
		},
		onFirstUpdate:function(){
			this.destroy(0.4);
		},
		onUpdate: function(){
			this.drawable.alpha = Math.max(0,1-(5*(this.main.time - this.startTime)));
			this.transform.scaleFac(1.05);
		},
	});
	
	
	var Missile = Ent.extend({
		init: function(opt){
			this._super(opt);
			this.dir = opt.dir || new Vec2(1,0);
			this.heritSpeed = opt.heritSpeed || new Vec2(); 
			this.speed = opt.speed || 1000;
			this.speedVec = this.dir.scale(this.speed).add(this.heritSpeed);
			this.drawable = opt.drawable || missileSprite;
			this.transform.setRotationDeg( this.speedVec.angleDeg() + 90);
			this.radius = opt.radius || 5;
			this.collisionBehaviour = 'emit';
			this.bound = BRect.newCentered(0,0,this.radius*2,this.radius*2);
		},
		onFirstUpdate:function(){
			this.destroy(0.7);
		},
		onUpdate: function(){
			this.transform.translate(this.speedVec.scale(this.main.deltaTime));
			this.transform.setScaleFac(Math.max(0.3, Math.min(0.7, 20*(this.main.time - this.startTime) )));
		},
		onDestroy: function(){
			this.main.scene.addEnt(new MissileExplosion({pos:this.transform.pos}) );
		},
		onDrawGlobal: function(){
	//		draw.centeredRect(this.transform.pos, new Vec2(this.radius*2, this.radius*2), '#F00');
		},
		onCollisionEmit: function(ent){
			this.destroy();
		},
	});
	
	var Block = Ent.extend({
		init: function(opt){
			this._super(opt);
			this.drawable = opt.sprite || Math.random() < 0.5 ? blockSprite : blockSpriteYellow;
			this.width = 110;
			this.collisionBehaviour = 'receive';
			this.bound = BRect.newCentered(0,0,this.width,this.width);
		},
		onDrawGlobal: function(){
			//draw.centeredRect(this.transform.pos, new Vec2(this.width,this.width), '#F00');
		},
	});

    var PlayerCamera = Camera.extend({
        init: function(player){
            this.player = player;
            this.transform.setPos(player.transform.pos);
        },
        onUpdate: function(){
            var center = new Vec2( 
                    window.innerWidth/2,
                    window.innerHeight/2
            );
            var dpos = this.player.transform.pos.sub(this.transform.pos);
            dpos = dpos.scale(1*this.main.deltaTime);
            this.transform.translate(dpos);
        },
    });
	
	
	var PlayerShip = Ent.extend({
		init: function(opt){
			this._super(opt);
			console.log('init');
			
			this.moveSpeed   = new Vec2();
			this.moveDir     = new Vec2();
			this.aimdir       = new Vec2();
			this.maxSpeed    = 500;
			this.acceleration = 100000;
			this.color        = '#F00';
			this.radius       = 20;
			
			this.shipSprite   = shipSprite.clone();
			this.shipSpriteFiring = shipSpriteFiring.clone();
			this.drawable     = this.shipSprite;  
			
			
			this.lastFireTime = 0;
			this.fireInterval = 0.1;
            this.fireSequence = 0;
            this.clipSize     = 5;
            this.reloadTime   = 2;
			this.collisionBehaviour = 'emit';
			this.bound = BRect.newCentered(0,0,this.radius*2, this.radius*2);
			this.colVec = new Vec2();


		},
        onFirstUpdate: function(){
            this.main.scene.camera = new PlayerCamera(this);
        },
	
		onUpdate: function(){
			var input = this.main.input;
			this.aimdir = main.scene.camera.getMouseWorldPos().sub(this.transform.pos).normalize();
			
			//console.log('moveSpeed:', this.moveSpeed, this.get('moveSpeed') );
			
			if(input.isKeyDown('a')){
				//console.log('A : left');
				this.moveDir.x = -1;
			}else if(input.isKeyDown('d')){
				//console.log('D : right');
				this.moveDir.x = 1;
			}else{
				this.moveDir.x = 0;
			}
			if(input.isKeyDown('w')){
			
				//console.log('W : up');
				this.moveDir.y = -1;
			}else if(input.isKeyDown('s')){
				
				//console.log('S : down');
				this.moveDir.y = 1;
			}else{
				this.moveDir.y = 0;
			}
			if(this.moveDir.x === 0){
				this.moveSpeed.x = 0;
			}else{
				if(this.moveDir.x * this.moveSpeed.x < 0){
					this.moveSpeed.x = 0;
				}
				this.moveSpeed.x += (this.moveDir.x * this.acceleration) * this.main.deltaTime;
				
				if(Math.abs( this.moveSpeed.x ) > this.maxSpeed){
					this.moveSpeed.x = this.moveDir.x * this.maxSpeed;
				}
			}
			if(this.moveDir.y === 0){
				this.moveSpeed.y = 0;
			}else{
				if(this.moveDir.y * this.moveSpeed.y < 0){
					this.moveSpeed.y = 0;
				}
				this.moveSpeed.y += (this.moveDir.y * this.acceleration) * this.main.deltaTime;
				
				if(Math.abs( this.moveSpeed.y ) > this.maxSpeed){
					this.moveSpeed.y = this.moveDir.y * this.maxSpeed;
				}
					
			}
			
			if(input.isKeyDown('mouse0') && this.main.time > this.lastFireTime + this.fireInterval){
                if(this.main.time > this.lastFireTime + this.fireInterval*1.5){
                    this.fireSequence = 0;
                }
				this.lastFireTime = this.main.time;
                if(this.fireSequence < this.clipSize){
                    this.main.scene.addEnt(new Missile({ 
                        pos: this.transform.pos.add(this.aimdir.scale(40)), 
                        dir: this.aimdir,
                        heritSpeed: this.moveSpeed.scale(0.5),
                    }));
                }
                if(this.fireSequence >= this.clipSize + this.reloadTime){
                    this.fireSequence = 0;
                }else{
                    this.fireSequence++;
                }
			}
			if( this.main.time - this.lastFireTime < 0.05 ){
				this.drawable = this.shipSpriteFiring;
			}else{
				this.drawable = this.shipSprite;
			}
			
			if(this.moveSpeed.len() > this.maxSpeed){
				this.moveSpeed = this.moveSpeed.setLen(this.maxSpeed);
			}
			
			this.transform.translate(this.moveSpeed.scale(this.main.deltaTime));
			
			this.transform.setRotationDeg(this.aimdir.angleDeg() + 90);
		},
		onDrawGlobal: function(){
			//draw.centeredRect(this.transform.pos, new Vec2(this.radius*2,this.radius*2), '#F00');
			//draw.lineAt(this.transform.pos, this.colVec, 'green');
			//this.colVec = new Vec2();
		},
		onCollisionEmit: function(ent){
			this.colVec = this.collisionAxis(ent);
			this.transform.translate(this.colVec.neg());
			//console.log('collided with:',ent);
		},
	});
	
	var ShivrzScene = Scene.extend({
		onSceneStart: function(){
			this.lastTime = -1;
			this.addEnt(new PlayerShip({
                pos: new Vec2(
                    window.innerWidth/2,
                    window.innerHeight/2
                ),
            }));
			
			for(var i = 0; i < 20; i++){
				this.addEnt(new Block({
					pos: new Vec2(
						100 + Math.random()*(window.innerWidth - 200) ,
						100 + Math.random()*(window.innerHeight - 200)
					).round() 
				}));
			}
		},
		onFrameStart: function(){
			context.canvas.width = window.innerWidth;
			context.canvas.height = window.innerHeight;
		},
		onFrameEnd: function(){
		},
	});


	

	
	window.main   = new Main({
		fps: 60,
		input: new Input('body'),
		scene: new ShivrzScene({
			renderer: new RendererCanvas2d({
				canvas:window.canvas,
				background: '#333',
				//globalCompositeOperation: 'lighter'
			}),
		}),
	});
	

	window.main.run();
};
