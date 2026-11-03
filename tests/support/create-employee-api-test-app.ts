import { FakeEmployeeRepository } from "@tests/support/fake-employee.repository";
import Fastify from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";
import { AuthorizeEmployeeManagementUseCase } from "@/modules/employees/application/authorize-employee-management/authorize-employee-management.usecase";
import { CreateEmployeeUseCase } from "@/modules/employees/application/create-employee/create-employee.usecase";
import { DeleteEmployeeUseCase } from "@/modules/employees/application/delete-employee/delete-employee.usecase";
import { EmployeeRole } from "@/modules/employees/application/employee-role";
import { GetEmployeeUseCase } from "@/modules/employees/application/get-employee/get-employee.usecase";
import { ListEmployeesUseCase } from "@/modules/employees/application/list-employees/list-employees.usecase";
import { UpdateEmployeeUseCase } from "@/modules/employees/application/update-employee/update-employee.usecase";
import { employeeRoutes } from "@/modules/employees/interface/http/employees.routes";
import { UnauthorizedError } from "@/shared/domain/errors";
import { errorHandlerPlugin } from "@/shared/interface/errors/error-handler.plugin";
import openApiPlugin from "@/shared/interface/plugins/openapi.plugin";

export const employeeTestIds = {
  admin: "00000000-0000-4000-8000-000000000001",
  attendant: "00000000-0000-4000-8000-000000000002",
  mechanic: "00000000-0000-4000-8000-000000000003",
};

export async function createEmployeeApiTestApp() {
  const app = Fastify().withTypeProvider<ZodTypeProvider>();
  const repository = new FakeEmployeeRepository();

  repository.seed({
    id: employeeTestIds.admin,
    name: "Admin de Teste",
    email: "admin@example.com",
    role: EmployeeRole.ADMIN,
  });
  repository.seed({
    id: employeeTestIds.attendant,
    name: "Atendente de Teste",
    email: "attendant@example.com",
    role: EmployeeRole.ATTENDANT,
  });
  repository.seed({
    id: employeeTestIds.mechanic,
    name: "Mecânico de Teste",
    email: "mechanic@example.com",
    role: EmployeeRole.MECHANIC,
  });

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  app.decorate("authenticate", async (request) => {
    const token = request.headers.authorization?.replace(/^Bearer /, "");
    const actorByToken = {
      admin: { sub: employeeTestIds.admin, role: EmployeeRole.ADMIN },
      attendant: { sub: employeeTestIds.attendant, role: EmployeeRole.ATTENDANT },
      mechanic: { sub: employeeTestIds.mechanic, role: EmployeeRole.MECHANIC },
      "admin-claim-attendant": {
        sub: employeeTestIds.attendant,
        role: EmployeeRole.ADMIN,
      },
    }[token ?? ""];

    if (!actorByToken) {
      throw new UnauthorizedError();
    }

    request.user = actorByToken;
  });

  await app.register(errorHandlerPlugin);
  await app.register(openApiPlugin);
  await app.register(
    employeeRoutes({
      authorize: new AuthorizeEmployeeManagementUseCase(repository),
      create: new CreateEmployeeUseCase(repository, {
        hash: async (password) => `test-hash:${password}`,
      }),
      delete: new DeleteEmployeeUseCase(repository),
      get: new GetEmployeeUseCase(repository),
      list: new ListEmployeesUseCase(repository),
      update: new UpdateEmployeeUseCase(repository),
    }),
  );
  await app.ready();

  return { app, repository };
}
