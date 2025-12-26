-- CreateTable
CREATE TABLE "pets" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "species" VARCHAR(100) NOT NULL,
    "age" SMALLINT NOT NULL,
    "created_at" TIMESTAMP(0),
    "updated_at" TIMESTAMP(0),

    CONSTRAINT "pets_pkey" PRIMARY KEY ("id")
);
