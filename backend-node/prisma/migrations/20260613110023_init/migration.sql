-- CreateTable
CREATE TABLE "cameras" (
    "camera_id" SERIAL NOT NULL,
    "camera_code" VARCHAR(50) NOT NULL,
    "location" VARCHAR(255) NOT NULL DEFAULT '',
    "ip_address" VARCHAR(100),
    "status" VARCHAR(50) NOT NULL DEFAULT 'active',
    "stream_path" VARCHAR(500),
    "installed_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cameras_pkey" PRIMARY KEY ("camera_id")
);

-- CreateTable
CREATE TABLE "registered_riders" (
    "rider_id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "license_plate" VARCHAR(50) NOT NULL,
    "license_info" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "registered_riders_pkey" PRIMARY KEY ("rider_id")
);

-- CreateTable
CREATE TABLE "violations" (
    "violation_id" SERIAL NOT NULL,
    "plate_number" VARCHAR(50) NOT NULL DEFAULT '',
    "occurred_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "location" VARCHAR(255) NOT NULL DEFAULT '',
    "camera_id" INTEGER,
    "violation_type" VARCHAR(50) NOT NULL DEFAULT 'no_helmet',
    "image_path" VARCHAR(500) NOT NULL DEFAULT '',
    "plate_image_path" VARCHAR(500) NOT NULL DEFAULT '',
    "confidence_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "reviewer" VARCHAR(255) NOT NULL DEFAULT '',
    "review_note" TEXT NOT NULL DEFAULT '',
    "ai_metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "violations_pkey" PRIMARY KEY ("violation_id")
);

-- CreateTable
CREATE TABLE "administrators" (
    "admin_id" SERIAL NOT NULL,
    "username" VARCHAR(100) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "administrators_pkey" PRIMARY KEY ("admin_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cameras_camera_code_key" ON "cameras"("camera_code");

-- CreateIndex
CREATE UNIQUE INDEX "registered_riders_license_plate_key" ON "registered_riders"("license_plate");

-- CreateIndex
CREATE INDEX "violations_occurred_at_idx" ON "violations"("occurred_at" DESC);

-- CreateIndex
CREATE INDEX "violations_location_occurred_at_idx" ON "violations"("location", "occurred_at" DESC);

-- CreateIndex
CREATE INDEX "violations_violation_type_idx" ON "violations"("violation_type");

-- CreateIndex
CREATE INDEX "violations_status_idx" ON "violations"("status");

-- CreateIndex
CREATE INDEX "violations_plate_number_idx" ON "violations"("plate_number");

-- CreateIndex
CREATE INDEX "violations_camera_id_idx" ON "violations"("camera_id");

-- CreateIndex
CREATE UNIQUE INDEX "administrators_username_key" ON "administrators"("username");

-- AddForeignKey
ALTER TABLE "violations" ADD CONSTRAINT "violations_camera_id_fkey" FOREIGN KEY ("camera_id") REFERENCES "cameras"("camera_id") ON DELETE SET NULL ON UPDATE CASCADE;
