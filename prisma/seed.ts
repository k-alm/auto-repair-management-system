import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { z } from "zod";

const { DATABASE_URL } = z.object({ DATABASE_URL: z.url() }).parse(process.env);
const adminConfig = z
  .object({
    ADMIN_EMAIL: z.email(),
    ADMIN_PASSWORD: z.string().min(12),
  })
  .parse(process.env);

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: DATABASE_URL }),
});

try {
  const passwordHash = await bcrypt.hash(adminConfig.ADMIN_PASSWORD, 12);
  await prisma.employee.upsert({
    where: { email: adminConfig.ADMIN_EMAIL.toLowerCase() },
    create: {
      name: "Administrador",
      email: adminConfig.ADMIN_EMAIL.toLowerCase(),
      role: "ADMIN",
      passwordHash,
    },
    update: { role: "ADMIN", deletedAt: null },
  });
  process.stdout.write("Funcionário administrador criado ou verificado.\n");
} finally {
  await prisma.$disconnect();
}
