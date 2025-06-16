import Phaser from 'phaser';
import { useEffect } from 'react';
import FusionScene from './game/scenes/FusionScene';

interface PhaserGameProps {
  onFusion: () => void;
}

export function PhaserGame({ onFusion }: PhaserGameProps) {
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
      scene: [FusionScene],
      parent: 'phaser-container',
    };

    const game = new Phaser.Game(config);

    // ✅ Safe: Listen for when the FusionScene is ready, then hook into its events
    const handleSceneReady = (sceneKey: string) => {
      const fusionScene = game.scene.getScene(sceneKey);
      fusionScene.events.on('fusionTriggered', onFusion);
    };

    game.events.on('fusionSceneReady', handleSceneReady);

    return () => {
      game.events.off('fusionSceneReady', handleSceneReady);
      game.destroy(true);
    };
  }, [onFusion]);

  return <div id="phaser-container" />;
}
