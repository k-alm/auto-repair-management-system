import type { Part, PartProps } from "@/modules/parts/domain/entities/part";
import { Part as PartEntity } from "@/modules/parts/domain/entities/part";
import type { PartPage, PartRepository } from "@/modules/parts/domain/part.repository";
import type { Service, ServiceProps } from "@/modules/services/domain/entities/service";
import { Service as ServiceEntity } from "@/modules/services/domain/entities/service";
import type { ServicePage, ServiceRepository } from "@/modules/services/domain/service.repository";

export class FakeCatalogRepository implements ServiceRepository, PartRepository {
  readonly services = new Map<string, Service>();
  readonly parts = new Map<string, Part>();
  serviceHasUsage = false;
  partHasUsage = false;
  servicePreserved = false;
  partPreserved = false;

  async createService(service: Service) {
    this.services.set(service.props.id, service);
    return service;
  }

  async findService(id: string) {
    return this.services.get(id) ?? null;
  }

  async listServices(input: { skip: number; take: number }): Promise<ServicePage> {
    return {
      items: [...this.services.values()].slice(input.skip, input.skip + input.take),
      total: this.services.size,
    };
  }

  async updateService(id: string, input: Partial<Omit<ServiceProps, "id">>) {
    const service = this.services.get(id);
    if (!service) throw new Error("service missing");
    const updated = ServiceEntity.restore({ ...service.props, ...input });
    this.services.set(id, updated);
    return updated;
  }

  async deleteService(id: string, preserveUsage: boolean) {
    this.servicePreserved = preserveUsage;
    if (preserveUsage) {
      const current = this.services.get(id);
      if (current)
        this.services.set(
          id,
          ServiceEntity.restore({
            ...current.props,
            isActive: false,
          }),
        );
      return;
    }
    this.services.delete(id);
  }

  async existsServiceUsage() {
    return this.serviceHasUsage;
  }

  async existsSku(sku: string, exceptId?: string) {
    return [...this.parts.values()].some(
      (part) => part.props.sku === sku && part.props.id !== exceptId,
    );
  }

  async createPart(part: Part) {
    this.parts.set(part.props.id, part);
    return part;
  }

  async findPart(id: string) {
    return this.parts.get(id) ?? null;
  }

  async listParts(input: { skip: number; take: number }): Promise<PartPage> {
    return {
      items: [...this.parts.values()].slice(input.skip, input.skip + input.take),
      total: this.parts.size,
    };
  }

  async updatePart(id: string, input: Partial<Omit<PartProps, "id">>) {
    const part = this.parts.get(id);
    if (!part) throw new Error("part missing");
    const updated = PartEntity.restore({ ...part.props, ...input });
    this.parts.set(id, updated);
    return updated;
  }

  async deletePart(id: string, preserveUsage: boolean) {
    this.partPreserved = preserveUsage;
    if (preserveUsage) {
      const current = this.parts.get(id);
      if (current)
        this.parts.set(
          id,
          PartEntity.restore({
            ...current.props,
            isActive: false,
          }),
        );
      return;
    }
    this.parts.delete(id);
  }

  async existsPartUsage() {
    return this.partHasUsage;
  }
}
