import Phaser from 'phaser';

const ATOM_IMAGE = 'public/assets/atom.png';
const PARTICLE_IMAGE = 'public/assets/particle.png';

export default class FusionScene extends Phaser.Scene {
  player!: Phaser.Physics.Arcade.Image;
  particles!: Phaser.Physics.Arcade.Group;

  mass: number = 1.00784;
  readonly MASS_UNIT = 1.00784;
  fusionThreshold: number = 10;

  cursors!: Record<'up' | 'down' | 'left' | 'right', Phaser.Input.Keyboard.Key>;

  preload() {
    this.load.image('atom', ATOM_IMAGE);
    this.load.image('particle', PARTICLE_IMAGE);
  }

  create() {
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;

    // Create and center the atom
    this.player = this.physics.add.image(centerX, centerY, 'atom');
    this.player.setCollideWorldBounds(true);

    // Create particles near the center
    this.particles = this.physics.add.group();

    for (let i = 0; i < 5; i++) {
      const offsetX = Phaser.Math.Between(-50, 50);
      const offsetY = Phaser.Math.Between(-50, 50);
      const particle = this.particles.create(centerX + offsetX, centerY + offsetY, 'particle') as Phaser.Physics.Arcade.Image;

      particle.setBounce(1);
      particle.setVelocity(
        Phaser.Math.Between(-100, 100),
        Phaser.Math.Between(-100, 100)
      );
      particle.setCollideWorldBounds(true);
      particle.setDisplaySize(24, 24);
    }

    // Handle overlap between player and particles
    this.physics.add.overlap(
      this.player,
      this.particles,
      this.absorb as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this
    );

    // WASD controls
    this.cursors = this.input.keyboard.addKeys({
      up: 'W',
      down: 'S',
      left: 'A',
      right: 'D',
    }) as Record<'up' | 'down' | 'left' | 'right', Phaser.Input.Keyboard.Key>;

    this.game.events.emit('fusionSceneReady', this.scene.key);

    // Debugging
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
      this.mass = this.MASS_UNIT;
      this.events.emit('fusionTriggered');
    }
  };

  update() {
    if (!this.player?.body) return;

    const speed = 200;
    let vx = 0;
    let vy = 0;

    if (this.cursors.up.isDown) vy = -speed;
    else if (this.cursors.down.isDown) vy = speed;

    if (this.cursors.left.isDown) vx = -speed;
    else if (this.cursors.right.isDown) vx = speed;

    if (vx !== 0 && vy !== 0) {
      const factor = Math.SQRT1_2;
      vx *= factor;
      vy *= factor;
    }

    this.player.setVelocity(vx, vy);
  }
}
