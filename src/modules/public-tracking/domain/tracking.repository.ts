export interface TrackedWorkOrder {
  id: string;
  status: string;
  openedAt: Date;
  vehicle: { plate: string; brand: string; model: string; year: number };
  services: string[];
  startedAt: Date | null;
  finishedAt: Date | null;
}

export interface TrackingRepository {
  findAuthorized(input: {
    id: string;
    tokenHash: string;
    now: Date;
  }): Promise<TrackedWorkOrder | null>;
}
