CREATE TABLE "tenants" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"name" text NOT NULL,
	"neon_project_id" text NOT NULL,
	"connection_string" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tenants_tenant_id_unique" UNIQUE("tenant_id"),
	CONSTRAINT "tenants_neon_project_id_unique" UNIQUE("neon_project_id")
);
