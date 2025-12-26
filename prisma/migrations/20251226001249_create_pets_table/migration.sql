/*
  Warnings:

  - You are about to drop the `cache` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `cache_locks` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `failed_jobs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `job_batches` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `jobs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `migrations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `password_reset_tokens` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `permissions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `personal_access_tokens` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `role_permissions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `roles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `sessions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_permissions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_roles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "role_permissions" DROP CONSTRAINT "role_permissions_permission_id_fkey";

-- DropForeignKey
ALTER TABLE "role_permissions" DROP CONSTRAINT "role_permissions_role_id_fkey";

-- DropForeignKey
ALTER TABLE "user_permissions" DROP CONSTRAINT "user_permissions_permission_id_fkey";

-- DropForeignKey
ALTER TABLE "user_permissions" DROP CONSTRAINT "user_permissions_user_id_fkey";

-- DropForeignKey
ALTER TABLE "user_roles" DROP CONSTRAINT "user_roles_role_id_fkey";

-- DropForeignKey
ALTER TABLE "user_roles" DROP CONSTRAINT "user_roles_user_id_fkey";

-- DropTable
DROP TABLE "cache";

-- DropTable
DROP TABLE "cache_locks";

-- DropTable
DROP TABLE "failed_jobs";

-- DropTable
DROP TABLE "job_batches";

-- DropTable
DROP TABLE "jobs";

-- DropTable
DROP TABLE "migrations";

-- DropTable
DROP TABLE "password_reset_tokens";

-- DropTable
DROP TABLE "permissions";

-- DropTable
DROP TABLE "personal_access_tokens";

-- DropTable
DROP TABLE "role_permissions";

-- DropTable
DROP TABLE "roles";

-- DropTable
DROP TABLE "sessions";

-- DropTable
DROP TABLE "user_permissions";

-- DropTable
DROP TABLE "user_roles";

-- DropTable
DROP TABLE "users";
