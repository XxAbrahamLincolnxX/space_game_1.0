import Phaser from 'phaser';
import { useEffect, useRef } from 'react';
import FusionScene from './game/scenes/FusionScene';

interface PhaserGameProps {
  onFusion: () => void;
  onMassChange: (mass: number) => void;
}

export function PhaserGame({ onFusion, onMassChange }: PhaserGameProps) {
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (gameRef.current) return; // ✅ Prevent re-creation of the game

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: '#000000',
      parent: 'phaser-container',
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      physics: {
        default: 'arcade',
        arcade: {
          debug: false,
        },
      },
      scene: [FusionScene],
    };

    const game = new Phaser.Game(config);
    gameRef.current = game;

    const handleSceneReady = (sceneKey: string) => {
      const scene = game.scene.getScene(sceneKey);
      scene.events.on('fusionTriggered', onFusion);
    };

    game.events.on('fusionSceneReady', handleSceneReady);
    game.events.on('massUpdated', onMassChange);

    return () => {
      // Optional: you can destroy here if you want a hard reset on unmount
      // game.destroy(true);
    };
  }, [onFusion, onMassChange]);

  return null; // No JSX needed — canvas is in #phaser-container
}
