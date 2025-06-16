import Phaser from 'phaser';

const ATOM_IMAGE = 'https://raw.githubusercontent.com/photonstorm/phaser3-examples/master/public/assets/particles/red.png';
const PARTICLE_IMAGE = 'https://raw.githubusercontent.com/photonstorm/phaser3-examples/master/public/assets/particles/blue.png';


export default class FusionScene extends Phaser.Scene {
  player!: Phaser.Physics.Arcade.Image;
  particles!: Phaser.Physics.Arcade.Group;
  mass: number = 0;
  fusionThreshold: number = 10;


  preload() {
    this.load.image('atom', ATOM_IMAGE);
    this.load.image('particle', PARTICLE_IMAGE);    
  }
  

  create() {
    // Use Arcade physics explicitly
    this.player = this.physics.add.image(400, 300, 'atom')
      .setDisplaySize(64, 64)
      .setCollideWorldBounds(true);

    // Setup particles with physics
    this.particles = this.physics.add.group({
      key: 'particle',
      repeat: 10,
      setXY: { x: 50, y: 50, stepX: 60 }
    });

    this.particles.children.iterate((child) => {
      const particle = child as Phaser.Physics.Arcade.Image;
      particle.setBounce(1);
      particle.setVelocity(
        Phaser.Math.Between(-100, 100),
        Phaser.Math.Between(-100, 100)
      );
      particle.setCollideWorldBounds(true);
      particle.setDisplaySize(24, 24);
      return true; // Fixes TS error about return type
    });

    // Add overlap with proper type annotations
    this.physics.add.overlap(
      this.player,
      this.particles,
      this.absorb as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this
    );

    // WASD movement
    this.input.keyboard?.on('keydown-W', () => this.player.setVelocityY(-200));
    this.input.keyboard?.on('keydown-S', () => this.player.setVelocityY(200));
    this.input.keyboard?.on('keydown-A', () => this.player.setVelocityX(-200));
    this.input.keyboard?.on('keydown-D', () => this.player.setVelocityX(200));

    this.scene.get('FusionScene').events.once('create', () => {
        this.events.emit('sceneReady');
      });

        // 🔥 Let parent know we're ready (safe to access `events`)
    this.game.events.emit('fusionSceneReady', this.scene.key);
      
  }

  absorb = (
    player: Phaser.GameObjects.GameObject,
    particle: Phaser.GameObjects.GameObject
  ) => {
    particle.destroy();
    this.mass += 1;
    this.events.emit('massUpdated', this.mass);
  
    if (this.mass >= this.fusionThreshold) {
      this.mass = 0;
      this.events.emit('fusionTriggered');
    }
  };
  

  update() {
    if (!this.player.body) return;
    this.player.setVelocity(
      this.player.body.velocity.x * 0.9,
      this.player.body.velocity.y * 0.9
    );
  }
}
