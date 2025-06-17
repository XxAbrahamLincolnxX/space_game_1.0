import Phaser from 'phaser';
import FusionScene from './scenes/FusionScene';

new Phaser.Game({
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: true,
    }
  },
  scene: [FusionScene]
});
