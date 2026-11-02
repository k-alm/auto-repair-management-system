import type {
  TrackedWorkOrder,
  TrackingRepository,
} from "@/modules/public-tracking/domain/tracking.repository";

export class FakeTrackingRepository implements TrackingRepository {
  trackedOrder: TrackedWorkOrder | null = null;
  authorization: { id: string; tokenHash: string; now: Date } | null = null;

  async findAuthorized(input: { id: string; tokenHash: string; now: Date }) {
    this.authorization = input;
    return this.trackedOrder;
  }
}
