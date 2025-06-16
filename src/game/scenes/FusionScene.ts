import Phaser from 'phaser';

// Online placeholders — you can swap these out later
const ATOM_IMAGE =
  'https://raw.githubusercontent.com/photonstorm/phaser3-examples/master/public/assets/particles/red.png';
const PARTICLE_IMAGE =
  'https://raw.githubusercontent.com/photonstorm/phaser3-examples/master/public/assets/particles/blue.png';

export default class FusionScene extends Phaser.Scene {
  player!: Phaser.Physics.Arcade.Image;
  particles!: Phaser.Physics.Arcade.Group;

  mass: number = 1.00784; // Start at Hydrogen's atomic mass
  readonly MASS_UNIT = 1.00784;
  fusionThreshold: number = 10;

  cursors!: Record<'up' | 'down' | 'left' | 'right', Phaser.Input.Keyboard.Key>;

  preload() {
    this.load.image('atom', ATOM_IMAGE);
    this.load.image('particle', PARTICLE_IMAGE);
  }

  create() {
    // Create player
    this.player = this.physics.add
      .image(400, 300, 'atom')
      .setDisplaySize(64, 64)
      .setCollideWorldBounds(true);

    // Create scattered particles
    this.particles = this.physics.add.group({
      key: 'particle',
      repeat: 10,
      setXY: { x: 50, y: 50, stepX: 60 },
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

    // Set up smooth WASD controls
    this.cursors = this.input.keyboard.addKeys({
        up: 'W',
        down: 'S',
        left: 'A',
        right: 'D',
      }) as Record<'up' | 'down' | 'left' | 'right', Phaser.Input.Keyboard.Key>;
      

    // Notify the app that the scene is ready
    this.game.events.emit('fusionSceneReady', this.scene.key);

    // Debug info
    console.debug('FusionScene initialized');
    console.debug('Player created at', this.player.x, this.player.y);
    console.debug('Particles:', this.particles.getChildren().length);
  }

  absorb = (
    player: Phaser.GameObjects.GameObject,
    particle: Phaser.GameObjects.GameObject
  ) => {
    particle.destroy();

    this.mass += this.MASS_UNIT;
    this.game.events.emit('massUpdated', this.mass);

    if (this.mass >= this.fusionThreshold) {
      this.mass = this.MASS_UNIT; // Reset for demo; later evolve atom
      this.events.emit('fusionTriggered');
    }
  };

  update() {
    if (!this.player.body) return;

    const speed = 200;
    let vx = 0;
    let vy = 0;

    if (this.cursors.up.isDown) vy = -speed;
    else if (this.cursors.down.isDown) vy = speed;

    if (this.cursors.left.isDown) vx = -speed;
    else if (this.cursors.right.isDown) vx = speed;

    // Normalize diagonal speed
    if (vx !== 0 && vy !== 0) {
      const factor = Math.SQRT1_2;
      vx *= factor;
      vy *= factor;
    }

    this.player.setVelocity(vx, vy);
  }
}
