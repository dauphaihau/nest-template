# Nest Template Workspace

This repository is a single git workspace for the Nest template, local infra, and API request fixtures.

## Layout

- `infra/`
  Local infrastructure, currently PostgreSQL via Docker Compose.
- `packages/template/`
  The NestJS application template with auth, MikroORM, migrations, and tests.
- `packages/api-request/`
  Hurl request files and helper scripts for manual API flow testing.
- `justfile`
  Root task entrypoint for common infra, template, and API request commands.

## Common Commands

Start local PostgreSQL:

```bash
just infra-up
```

Run the template in dev mode:

```bash
just template-up
```

Apply template migrations:

```bash
just template-migration-up
```

Seed template baseline data:

```bash
just template-seed
```

Run API request flows:

```bash
just api-request-run api/auth/register.hurl
just api-auth test-all
```

Run template tests:

```bash
cd packages/template
pnpm test
pnpm test:e2e
```

## Notes

- The root repository owns the full workspace history.
- `packages/template/` is no longer a standalone git repository.
- The auth e2e test suite creates and destroys its own temporary PostgreSQL database per run, but still expects the local PostgreSQL service to be available.
