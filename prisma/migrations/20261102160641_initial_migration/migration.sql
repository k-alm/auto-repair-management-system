-- CreateTable
CREATE TABLE "parts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "stock_quantity" INTEGER NOT NULL DEFAULT 0,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quotes" (
    "id" TEXT NOT NULL,
    "work_order_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "total" DECIMAL(10,2) NOT NULL,
    "responded_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quotes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "services" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "document" TEXT NOT NULL,
    "email" TEXT,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employees" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicles" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "plate" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_orders" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "vehicle_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'RECEIVED',
    "started_at" TIMESTAMP(3),
    "finished_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "work_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_order_services" (
    "work_order_id" TEXT NOT NULL,
    "service_id" TEXT NOT NULL,
    "unit_price" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "work_order_services_pkey" PRIMARY KEY ("work_order_id","service_id")
);

-- CreateTable
CREATE TABLE "work_order_parts" (
    "work_order_id" TEXT NOT NULL,
    "part_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_price" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "work_order_parts_pkey" PRIMARY KEY ("work_order_id","part_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "quotes_work_order_id_key" ON "quotes"("work_order_id");

-- CreateIndex
CREATE UNIQUE INDEX "customers_document_key" ON "customers"("document");

-- CreateIndex
CREATE UNIQUE INDEX "employees_email_key" ON "employees"("email");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_plate_key" ON "vehicles"("plate");

-- CreateIndex
CREATE INDEX "vehicles_customer_id_idx" ON "vehicles"("customer_id");

-- CreateIndex
CREATE INDEX "work_orders_customer_id_idx" ON "work_orders"("customer_id");

-- CreateIndex
CREATE INDEX "work_orders_vehicle_id_idx" ON "work_orders"("vehicle_id");

-- CreateIndex
CREATE INDEX "work_orders_status_idx" ON "work_orders"("status");

-- CreateIndex
CREATE INDEX "work_order_services_service_id_idx" ON "work_order_services"("service_id");

-- CreateIndex
CREATE INDEX "work_order_parts_part_id_idx" ON "work_order_parts"("part_id");

-- AddForeignKey
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_work_order_id_fkey" FOREIGN KEY ("work_order_id") REFERENCES "work_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_order_services" ADD CONSTRAINT "work_order_services_work_order_id_fkey" FOREIGN KEY ("work_order_id") REFERENCES "work_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_order_services" ADD CONSTRAINT "work_order_services_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_order_parts" ADD CONSTRAINT "work_order_parts_work_order_id_fkey" FOREIGN KEY ("work_order_id") REFERENCES "work_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_order_parts" ADD CONSTRAINT "work_order_parts_part_id_fkey" FOREIGN KEY ("part_id") REFERENCES "parts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
