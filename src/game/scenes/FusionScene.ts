import Phaser from 'phaser';

// Online placeholders — you can swap these out later
const ATOM_IMAGE = 'https://raw.githubusercontent.com/photonstorm/phaser3-examples/master/public/assets/particles/red.png';
const PARTICLE_IMAGE = 'https://raw.githubusercontent.com/photonstorm/phaser3-examples/master/public/assets/particles/blue.png';

export default class FusionScene extends Phaser.Scene {
  player!: Phaser.Physics.Arcade.Image;
  particles!: Phaser.Physics.Arcade.Group;

  mass: number = 1.00784; // Start at Hydrogen's atomic mass
  readonly MASS_UNIT = 1.00784;
  fusionThreshold: number = 10;

  preload() {
    this.load.image('atom', ATOM_IMAGE);
    this.load.image('particle', PARTICLE_IMAGE);
  }

  create() {
    // Create player
    this.player = this.physics.add.image(400, 300, 'atom')
      .setDisplaySize(64, 64)
      .setCollideWorldBounds(true);

    // Create scattered particles
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
      return true;
    });

    // Collision: atom absorbs particles
    this.physics.add.overlap(
      this.player,
      this.particles,
      this.absorb as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this
    );

    // Movement controls (WASD)
    this.input.keyboard?.on('keydown-W', () => this.player.setVelocityY(-200));
    this.input.keyboard?.on('keydown-S', () => this.player.setVelocityY(200));
    this.input.keyboard?.on('keydown-A', () => this.player.setVelocityX(-200));
    this.input.keyboard?.on('keydown-D', () => this.player.setVelocityX(200));

    // Let PhaserGame.tsx know we're ready
    this.game.events.emit('fusionSceneReady', this.scene.key);

    console.debug('Creating player and particles...');
    console.debug('Player created:', this.player);
    console.debug('Particle count:', this.particles.getChildren().length);

  }

  absorb = (
    player: Phaser.GameObjects.GameObject,
    particle: Phaser.GameObjects.GameObject
  ) => {
    particle.destroy();

    this.mass += this.MASS_UNIT;
    this.game.events.emit('massUpdated', this.mass);

    if (this.mass >= this.fusionThreshold) {
      this.mass = this.MASS_UNIT; // Reset for demo; later trigger fusion
      this.events.emit('fusionTriggered');
    }
  };

  update() {
    if (!this.player.body) return;

    // Gradual slowdown
    this.player.setVelocity(
      this.player.body.velocity.x * 0.9,
      this.player.body.velocity.y * 0.9
    );
  }
}
