import { NETWORK_SIMULATION } from "../constants";

export class NetworkSimulator {
  /**
   * Simulates network delay for realistic API behavior
   * @param minMs Minimum delay in milliseconds
   * @param maxMs Maximum delay in milliseconds
   */
  static async delay(
    minMs: number = NETWORK_SIMULATION.MIN_DELAY_MS,
    maxMs: number = NETWORK_SIMULATION.MIN_DELAY_MS,
  ): Promise<void> {
    const delay = minMs + Math.random() * (maxMs - minMs);
    return new Promise((resolve) => setTimeout(resolve, delay));
  }
}
