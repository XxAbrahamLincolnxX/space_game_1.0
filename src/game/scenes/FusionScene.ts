import Phaser from 'phaser';

const ATOM_IMAGE = 'atom';
const PARTICLE_IMAGE = 'particle';

export default class FusionScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Image;
  private particles!: Phaser.Physics.Arcade.Group;
  private cursors!: Record<'up' | 'down' | 'left' | 'right', Phaser.Input.Keyboard.Key>;
  private mass: number = 1.00784;
  private readonly MASS_UNIT = 1.00784;
  private fusionThreshold: number = 10;
  private fusionReady: boolean = true;

  preload() {
    this.load.image(ATOM_IMAGE, 'assets/atom.png');
    this.load.image(PARTICLE_IMAGE, 'assets/particle.png');
  }

  create() {
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;

    // Create player (atom) at center
    this.player = this.physics.add.image(centerX, centerY, ATOM_IMAGE)
      .setDisplaySize(48, 48) // shrink visually
      .setCollideWorldBounds(true)
      .setDamping(true)
      .setDrag(0.95)
      .setMaxVelocity(200);

    // Create particles randomly near center
    this.particles = this.physics.add.group();
    for (let i = 0; i < 10; i++) {
      const offsetX = Phaser.Math.Between(-150, 150);
      const offsetY = Phaser.Math.Between(-150, 150);
      const particle = this.particles.create(centerX + offsetX, centerY + offsetY, PARTICLE_IMAGE) as Phaser.Physics.Arcade.Image;
      particle.setDisplaySize(24, 24)
              .setBounce(1)
              .setCollideWorldBounds(true)
              .setVelocity(
                Phaser.Math.Between(-100, 100),
                Phaser.Math.Between(-100, 100)
              );
    }

    // Handle collisions between atom and particles
    this.physics.add.overlap(
      this.player,
      this.particles,
      this.absorb as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this
    );

    // WASD movement setup
    this.cursors = this.input.keyboard.addKeys({
      up: 'W',
      down: 'S',
      left: 'A',
      right: 'D',
    }) as Record<'up' | 'down' | 'left' | 'right', Phaser.Input.Keyboard.Key>;

    this.game.events.emit('fusionSceneReady', this.scene.key);
  }

  absorb = (
    player: Phaser.GameObjects.GameObject,
    particle: Phaser.GameObjects.GameObject
  ) => {
    particle.destroy();
    this.mass += this.MASS_UNIT;
    this.game.events.emit('massUpdated', this.mass);

    if (this.mass >= this.fusionThreshold && this.fusionReady) {
      this.fusionReady = false;
      this.events.emit('fusionTriggered');
    }
  };

  resetFusion() {
    this.fusionReady = true;
  }

  update() {
    if (!this.player?.body) return;

    const speed = 200;
    let vx = 0;
    let vy = 0;

    if (this.cursors.up.isDown) vy = -speed;
    else if (this.cursors.down.isDown) vy = speed;

    if (this.cursors.left.isDown) vx = -speed;
    else if (this.cursors.right.isDown) vx = speed;

    // Normalize diagonal motion
    if (vx !== 0 && vy !== 0) {
      const factor = Math.SQRT1_2;
      vx *= factor;
      vy *= factor;
    }

    this.player.setVelocity(vx, vy);
  }
}
