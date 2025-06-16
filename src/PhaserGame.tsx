import Phaser from 'phaser';
import { useEffect } from 'react';
import FusionScene from './game/scenes/FusionScene';

export function PhaserGame() {
  useEffect(() => {
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      backgroundColor: '#000000',
      physics: {
        default: 'arcade',
        arcade: {
          debug: false,
        },
      },
      scene: [FusionScene], // ✅ This should NOT include MainMenu
      parent: 'phaser-container',
    };

    const game = new Phaser.Game(config);
    return () => game.destroy(true);
  }, []);

  return <div id="phaser-container" />;
}
