import { Problem } from '../domain/Problem.ts';
import { IProblemRepository } from './IProblemRepository.ts';

export class InMemoryProblemRepository implements IProblemRepository {
  private readonly problems: Map<string, Problem> = new Map();

  constructor() {
    this.seedProblems();
  }

  public async getAll(): Promise<Problem[]> {
    return Array.from(this.problems.values());
  }

  public async getById(id: string): Promise<Problem | null> {
    return this.problems.get(id) || null;
  }

  public async save(problem: Problem): Promise<void> {
    this.problems.set(problem.id, problem);
  }

  private seedProblems(): void {
    // Problem 1: Parking Lot System
    const parkingLot = new Problem(
      'prob-parking-lot',
      'Design a Multi-Floor Parking Lot System',
      'Medium',
      `Design an automated low-level system for a multi-floor parking lot. 
The system must manage multiple vehicle types (Motorcycle, Car, Truck), allocate parking spots dynamically across multiple levels, issue tickets at entry gates, process payments at exit gates, and support customizable fee calculation strategies.`,
      ['ParkingSpot', 'Vehicle', 'Ticket', 'ParkingFloor', 'PaymentStrategy', 'ParkingLotController'],
      [
        'Support multiple vehicle types with appropriate spot sizing (Compact, Large, Handicapped, TwoWheeler)',
        'Issue a unique parking ticket on vehicle entry with timestamp and assigned spot',
        'Calculate fees upon exit using extensible pricing rules (e.g. hourly, vehicle-type multiplier, flat day rate)',
        'Thread-safe spot reservation to prevent double-booking under concurrent entry gates',
        'Clear separation of spot assignment algorithm via Strategy Pattern',
      ],
      [
        { id: 'rub-req', name: 'Requirement Coverage', description: 'Models spot types, tickets, gates, and vehicle hierarchy.', weight: 0.25 },
        { id: 'rub-srp', name: 'Single Responsibility', description: 'Parking lot does not handle both billing and spot allocation.', weight: 0.2 },
        { id: 'rub-dip', name: 'Coupling & Abstraction', description: 'Uses interfaces for FeeCalculationStrategy and SpotAssignmentStrategy.', weight: 0.25 },
        { id: 'rub-ext', name: 'Extensibility', description: 'Easily add VIP pricing, EV charging spots, or multi-gate routing.', weight: 0.15 },
        { id: 'rub-rsn', name: 'Trade-off Reasoning', description: 'Explains concurrency locking, spot search trade-offs, and design patterns.', weight: 0.15 },
      ],
      {
        skeleton: `// Starter Template: Multi-Floor Parking Lot
export enum VehicleType {
  MOTORCYCLE,
  CAR,
  TRUCK
}

export enum SpotType {
  COMPACT,
  LARGE,
  HANDICAPPED,
  MOTORCYCLE
}

export interface IPaymentStrategy {
  calculateFee(hours: number, vehicleType: VehicleType): number;
}

export interface ISpotAllocationStrategy {
  findSpot(floor: ParkingFloor, vehicleType: VehicleType): ParkingSpot | null;
}

export class Vehicle {
  constructor(
    public readonly licensePlate: string,
    public readonly type: VehicleType
  ) {}
}

export class ParkingSpot {
  constructor(
    public readonly id: string,
    public readonly spotType: SpotType,
    private isOccupied: boolean = false
  ) {}

  public park(vehicle: Vehicle): boolean {
    // TODO: implement
    return true;
  }

  public vacate(): void {
    this.isOccupied = false;
  }
}

export class Ticket {
  constructor(
    public readonly ticketNumber: string,
    public readonly vehicle: Vehicle,
    public readonly spot: ParkingSpot,
    public readonly issuedAt: Date
  ) {}
}

export class ParkingFloor {
  constructor(
    public readonly floorNumber: number,
    private spots: ParkingSpot[]
  ) {}
}

export class ParkingLotController {
  constructor(
    private floors: ParkingFloor[],
    private allocationStrategy: ISpotAllocationStrategy,
    private paymentStrategy: IPaymentStrategy
  ) {}

  public processEntry(vehicle: Vehicle): Ticket | null {
    // TODO: implement
    return null;
  }

  public processExit(ticket: Ticket): number {
    // TODO: implement
    return 0;
  }
}`,
        rationale: `### Design Assumptions & Decisions
- Spot assignment is decoupled using the Strategy Pattern (\`ISpotAllocationStrategy\`) so nearest-to-entrance or best-fit algorithms can be swapped dynamically.
- Payment calculation is abstracted through \`IPaymentStrategy\` to support hourly, weekend surcharges, or flat rate tiers without altering the exit controller.
- Concurrency: When multiple entry gates attempt to book spots simultaneously, fine-grained row-level or spot-level locks should be used instead of locking the entire floor.`,
        diagramMermaid: `classDiagram
    ParkingLotController --> ISpotAllocationStrategy
    ParkingLotController --> IPaymentStrategy
    ParkingLotController --> ParkingFloor
    ParkingFloor *-- ParkingSpot
    Ticket --> ParkingSpot
    Ticket --> Vehicle
    Vehicle --> VehicleType
    ParkingSpot --> SpotType`,
      }
    );

    // Problem 2: Elevator Control System
    const elevatorSystem = new Problem(
      'prob-elevator-system',
      'Design an Elevator Dispatcher & Control System',
      'Medium',
      `Design an object-oriented elevator system for a high-rise building with N elevator cars and M floors.
The system must handle internal floor button presses inside cars, external hall calls (Up/Down) on floors, optimize car dispatching using scheduling algorithms (SCAN / LOOK), and handle state transitions safely.`,
      ['ElevatorCar', 'ElevatorController', 'IDispatchStrategy', 'HallButton', 'ElevatorState', 'FloorRequest'],
      [
        'Support multiple elevator cars operating concurrently',
        'Separate internal car requests from external floor hall calls',
        'Model elevator states cleanly (IDLE, MOVING_UP, MOVING_DOWN, MAINTENANCE, DOORS_OPEN)',
        'Extensible dispatch strategy (e.g. FCFS, Shortest Seek Time, LOOK/SCAN)',
        'Safety edge cases (overload sensor, emergency stop)',
      ],
      [
        { id: 'rub-req', name: 'Requirement Coverage', description: 'Models cars, dispatchers, hall buttons, and state transitions.', weight: 0.25 },
        { id: 'rub-srp', name: 'Single Responsibility', description: 'Car motion control is separated from global dispatch scheduling.', weight: 0.2 },
        { id: 'rub-dip', name: 'Coupling & Abstraction', description: 'ElevatorController depends on IDispatchStrategy interface.', weight: 0.25 },
        { id: 'rub-ext', name: 'Extensibility', description: 'Supports adding priority VIP cars, energy-saving dispatch, or emergency modes.', weight: 0.15 },
        { id: 'rub-rsn', name: 'Trade-off Reasoning', description: 'Justifies dispatch algorithm choice and starvation prevention.', weight: 0.15 },
      ],
      {
        skeleton: `// Starter Template: Elevator Control System
export enum Direction {
  UP,
  DOWN,
  NONE
}

export enum ElevatorState {
  IDLE,
  MOVING_UP,
  MOVING_DOWN,
  DOORS_OPEN,
  MAINTENANCE
}

export interface IDispatchStrategy {
  selectBestCar(cars: ElevatorCar[], floor: number, direction: Direction): ElevatorCar;
}

export class FloorRequest {
  constructor(
    public readonly floor: number,
    public readonly direction: Direction,
    public readonly timestamp: Date = new Date()
  ) {}
}

export class ElevatorCar {
  public currentState: ElevatorState = ElevatorState.IDLE;
  public currentFloor: number = 1;

  constructor(
    public readonly id: string,
    public readonly capacityKg: number
  ) {}

  public moveStep(): void {
    // TODO: move up/down
  }

  public openDoors(): void {
    this.currentState = ElevatorState.DOORS_OPEN;
  }
}

export class HallButton {
  constructor(
    public readonly floor: number,
    public readonly direction: Direction
  ) {}
}

export class ElevatorController {
  constructor(
    private cars: ElevatorCar[],
    private dispatchStrategy: IDispatchStrategy
  ) {}

  public handleExternalCall(request: FloorRequest): void {
    const car = this.dispatchStrategy.selectBestCar(this.cars, request.floor, request.direction);
    // TODO: assign request to chosen car
  }

  public handleInternalCall(carId: string, destinationFloor: number): void {
    // TODO: enqueue destination
  }
}`,
        rationale: `### Design Assumptions & Decisions
- Separation of Concerns: The ElevatorCar is responsible for motor movements, door states, and internal safety; the ElevatorController is responsible for supervisory scheduling.
- The dispatch policy is encapsulated inside \`IDispatchStrategy\` using the Strategy Pattern to allow switching from simple FCFS to SCAN / LOOK or peak-hour morning clustering without touching car mechanics.
- Starvation prevention: Using a bidirectional sweep (LOOK algorithm) ensures passengers on lower floors are not starved during heavy morning rushes.`,
        diagramMermaid: `classDiagram
    ElevatorController --> IDispatchStrategy
    ElevatorController --> ElevatorCar
    ElevatorCar --> ElevatorState
    HallButton --> Direction
    ElevatorController ..> FloorRequest`,
      }
    );

    // Problem 3: In-Memory Rate Limiter
    const rateLimiter = new Problem(
      'prob-rate-limiter',
      'Design an In-Memory Rate Limiter Component',
      'Medium',
      `Design a reusable in-memory API rate limiter component for multi-tier clients (e.g. Free: 10 req/min, Premium: 100 req/min).
The system must support pluggable rate limiting algorithms (Token Bucket, Sliding Window Log), provide thread-safe checks, and return remaining quota metadata.`,
      ['IRateLimitStrategy', 'RateLimiter', 'TokenBucketStrategy', 'ClientTier', 'RateLimitRule'],
      [
        'Support client identification by IP, API Key, or User ID',
        'Implement or abstract rate limiting algorithms (e.g. Token Bucket, Sliding Window)',
        'Configure distinct limits and refill rates per tier',
        'Thread safety for high-throughput concurrent requests',
        'Informative response with allowed/rejected status and retry-after duration',
      ],
      [
        { id: 'rub-req', name: 'Requirement Coverage', description: 'Models client tokens, rules, tiers, and strategy contracts.', weight: 0.25 },
        { id: 'rub-srp', name: 'Single Responsibility', description: 'Rule storage is decoupled from window counting algorithms.', weight: 0.2 },
        { id: 'rub-dip', name: 'Coupling & Abstraction', description: 'Client code uses IRateLimitStrategy instead of hardcoded logic.', weight: 0.25 },
        { id: 'rub-ext', name: 'Extensibility', description: 'Allows easy addition of distributed Redis adapters or burst tokens.', weight: 0.15 },
        { id: 'rub-rsn', name: 'Trade-off Reasoning', description: 'Compares memory footprint of Token Bucket vs Sliding Window Log.', weight: 0.15 },
      ],
      {
        skeleton: `// Starter Template: In-Memory Rate Limiter
export enum ClientTier {
  FREE,
  STANDARD,
  PREMIUM
}

export interface RateLimitResult {
  allowed: boolean;
  remainingTokens: number;
  retryAfterMs?: number;
}

export interface IRateLimitStrategy {
  allowRequest(clientId: string, maxRequests: number, windowSeconds: number): RateLimitResult;
}

export class RateLimitRule {
  constructor(
    public readonly tier: ClientTier,
    public readonly maxRequests: number,
    public readonly windowSeconds: number
  ) {}
}

export class TokenBucketStrategy implements IRateLimitStrategy {
  private buckets: Map<string, { tokens: number; lastRefill: number }> = new Map();

  public allowRequest(clientId: string, maxRequests: number, windowSeconds: number): RateLimitResult {
    // TODO: implement token bucket math
    return { allowed: true, remainingTokens: maxRequests - 1 };
  }
}

export class RateLimiter {
  private rules: Map<ClientTier, RateLimitRule> = new Map();

  constructor(private strategy: IRateLimitStrategy) {}

  public registerRule(rule: RateLimitRule): void {
    this.rules.set(rule.tier, rule);
  }

  public checkLimit(clientId: string, tier: ClientTier): RateLimitResult {
    const rule = this.rules.get(tier) || new RateLimitRule(tier, 10, 60);
    return this.strategy.allowRequest(clientId, rule.maxRequests, rule.windowSeconds);
  }
}`,
        rationale: `### Design Assumptions & Decisions
- Strategy Pattern: Rate limiting algorithms (Token Bucket, Leaky Bucket, Sliding Window Log) implement \`IRateLimitStrategy\`. Token bucket offers $O(1)$ memory per user, whereas Sliding Window Log provides exact precision at the cost of $O(K)$ timestamp storage.
- Extensibility: \`RateLimiter\` accepts any strategy and maps tiers dynamically. Future distributed implementations can wrap Redis atomic scripts without modifying the interface.
- Thread Safety: In production, per-key mutex locks or atomic CAS operations ensure atomic check-and-decrement.`,
        diagramMermaid: `classDiagram
    RateLimiter --> IRateLimitStrategy
    RateLimiter --> RateLimitRule
    TokenBucketStrategy ..|> IRateLimitStrategy
    RateLimitRule --> ClientTier`,
      }
    );

    this.problems.set(parkingLot.id, parkingLot);
    this.problems.set(elevatorSystem.id, elevatorSystem);
    this.problems.set(rateLimiter.id, rateLimiter);
  }
}
