import "dotenv/config";
import { defineConfig } from "prisma/config";
import { env } from "./src/config/env";

export default defineConfig({
  schema: "prisma/models",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: { url: env.DATABASE_URL },
});
