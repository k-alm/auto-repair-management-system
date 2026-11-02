export interface ExecutionPeriod {
  startedAt: Date | null;
  finishedAt: Date | null;
}

export interface ExecutionTimeRepository {
  findCompletedPeriods(): Promise<ExecutionPeriod[]>;
}
