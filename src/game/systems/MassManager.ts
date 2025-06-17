// Handles current mass + gain

// src/systems/MassManager.ts

export default class MassManager {
    private mass: number;
  
    constructor(initialMass = 1.00784) {
      this.mass = initialMass;
    }
  
    getMass(): number {
      return this.mass;
    }
  
    getMassInLog(): number {
      return Math.log10(this.mass);
    }
  
    addMass(delta: number) {
      this.mass += delta;
    }
  
    resetMass() {
      this.mass = 1.00784;
    }
  }
  