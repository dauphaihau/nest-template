# Nest Template Workspace

This repository is a single git workspace for the Nest template, local infra, and API request fixtures.

## Layout

- `infra/`
  Local infrastructure, currently PostgreSQL via Docker Compose.
- `packages/mcp/`
  Stdio MCP server that reuses the template auth and health modules.
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

Install template dependencies:

```bash
just template-install
```

Run the template in dev mode:

```bash
just template-up
```

Run the MCP server:

```bash
just mcp-up
```

Launch Codex with this project's MCP only:

```bash
./scripts/codex-with-mcp.sh
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
just api-health
just api-request-run api/auth/register.hurl
just api-auth test-all
just api-auth test-rate-limit
just api-user user-test-all
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
- `packages/mcp/` loads environment variables from `packages/template/.env` by default so it stays aligned with the HTTP template configuration.
- `scripts/codex-with-mcp.sh` injects the `nest-template` MCP server only for Codex sessions started from this repository.
