import Phaser from 'phaser';
import MassManager from '../systems/MassManager';

const ATOM_IMAGE = 'atom';
const PARTICLE_IMAGE = 'particle';

export default class FusionScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Image;
  private particles!: Phaser.Physics.Arcade.Group;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: {
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
  };
  private massManager!: MassManager;
  private massText!: Phaser.GameObjects.Text;

  preload() {
    this.load.image(ATOM_IMAGE, 'assets/atom.png');
    this.load.image(PARTICLE_IMAGE, 'assets/particle.png');
  }

  create() {
    this.massManager = new MassManager();

    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;

    // Create player
    this.player = this.physics.add.image(centerX, centerY, ATOM_IMAGE)
      .setScale(0.2)
      .setCollideWorldBounds(true);

    // Correct circular physics body after scaling
    const atomRadius = (this.textures.get(ATOM_IMAGE).getSourceImage().width * 0.2) / 2;
    this.player.setCircle(atomRadius, this.player.width / 2 - atomRadius, this.player.height / 2 - atomRadius);
    (this.player.body as Phaser.Physics.Arcade.Body).debugShowBody = true;

    this.cursors = this.input.keyboard.createCursorKeys();

    this.wasd = {
      up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    };

    // Particle Group
    this.particles = this.physics.add.group({
      key: PARTICLE_IMAGE,
      repeat: 10,
      setXY: { x: 100, y: 100, stepX: 80, stepY: 60 }
    });

    this.particles.children.iterate(child => {
      const p = child as Phaser.Physics.Arcade.Image & { massValue?: number };
      p.massValue = Phaser.Math.FloatBetween(1e8, 1e10);
      p.setScale(0.05);

      const textureWidth = this.textures.get(PARTICLE_IMAGE).getSourceImage().width;
      const particleRadius = (textureWidth * 0.05) / 2;
      p.setCircle(particleRadius, p.width / 2 - particleRadius, p.height / 2 - particleRadius);

      p.setVelocity(Phaser.Math.Between(-30, 30), Phaser.Math.Between(-30, 30));
      p.setBounce(1);
      p.setCollideWorldBounds(true);

      (p.body as Phaser.Physics.Arcade.Body).debugShowBody = true;
    });

    this.physics.add.overlap(this.player, this.particles, this.absorbParticle, undefined, this);

    // Mass HUD
    this.massText = this.add.text(10, 10, '', {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#ffffff',
      backgroundColor: 'rgba(0,0,0,0.4)',
      padding: { x: 8, y: 4 }
    });

    this.updateMassText();
  }

  update() {
    const speed = 200;
    this.player.setVelocity(0);

    const left = this.cursors.left.isDown || this.wasd.left.isDown;
    const right = this.cursors.right.isDown || this.wasd.right.isDown;
    const up = this.cursors.up.isDown || this.wasd.up.isDown;
    const down = this.cursors.down.isDown || this.wasd.down.isDown;

    if (left) this.player.setVelocityX(-speed);
    else if (right) this.player.setVelocityX(speed);
    if (up) this.player.setVelocityY(-speed);
    else if (down) this.player.setVelocityY(speed);
  }

  private absorbParticle(player: Phaser.GameObjects.GameObject, particle: Phaser.GameObjects.GameObject) {
    const p = particle as Phaser.Physics.Arcade.Image & { massValue?: number };

    console.log('Absorbing particle:', p.massValue); // debug
    const gain = (p.massValue || 1e9) * 1.00784;

    this.massManager.addMass(gain);
    this.updateMassText();

    p.destroy();
  }

  private updateMassText() {
    const mass = this.massManager.getMass();
    this.massText.setText(`Mass: ${mass.toPrecision(6)} u`);
  }
}
