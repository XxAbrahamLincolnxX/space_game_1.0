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

    // Create particles group
    this.particles = this.physics.add.group();

    // Initial burst near center
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

    // Periodically spawn new drifting particles from offscreen
    this.time.addEvent({
      delay: 100, // every 300ms
      loop: true,
      callback: () => this.spawnEdgeParticle()
    });

    this.game.events.emit('fusionSceneReady', this.scene.key);
  }

  private spawnEdgeParticle() {
    const buffer = 50;
    const w = this.scale.width;
    const h = this.scale.height;

    const side = Phaser.Math.Between(0, 3); // 0=left, 1=top, 2=right, 3=bottom
    let x = 0, y = 0, angle = 0;

    switch (side) {
      case 0: // Left
        x = -buffer;
        y = Phaser.Math.Between(0, h);
        angle = Phaser.Math.FloatBetween(-0.25, 0.25);
        break;
      case 1: // Top
        x = Phaser.Math.Between(0, w);
        y = -buffer;
        angle = Phaser.Math.FloatBetween(0.75, 1.25);
        break;
      case 2: // Right
        x = w + buffer;
        y = Phaser.Math.Between(0, h);
        angle = Phaser.Math.FloatBetween(0.75, 1.25) + Math.PI;
        break;
      case 3: // Bottom
        x = Phaser.Math.Between(0, w);
        y = h + buffer;
        angle = Phaser.Math.FloatBetween(1.75, 2.25);
        break;
    }

    const vx = Math.cos(angle * Math.PI) * 100;
    const vy = Math.sin(angle * Math.PI) * 100;

    const particle = this.particles.create(x, y, PARTICLE_IMAGE) as Phaser.Physics.Arcade.Image;
    particle.setDisplaySize(24, 24)
            .setVelocity(vx, vy)
            .setBounce(0)
            .setCollideWorldBounds(false);

   
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

    const speed = 600;
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
    this.particles.getChildren().forEach((particle) => {
        const p = particle as Phaser.Physics.Arcade.Image;
        const buffer = 50;
      
        if (
          p.x < -buffer || p.x > this.scale.width + buffer ||
          p.y < -buffer || p.y > this.scale.height + buffer
        ) {
          p.destroy();
        }
      });
      

    this.player.setVelocity(vx, vy);
  }
}
