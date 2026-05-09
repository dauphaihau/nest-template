## Local Postgres

The repository includes a local Postgres service in [`infra/docker-compose.yml`](/Volumes/Local/dev/pj-personal/templates/api/nest-template/infra/docker-compose.yml).

Start the database:

```bash
docker compose -f ../../infra/docker-compose.yml up -d
```

Configure app environment:

```bash
cp .env.example .env
```

Default database settings:

- `API_PREFIX=api`
- `CORS_ALLOWED_ORIGINS=http://localhost:3001`
- `DB_HOST=127.0.0.1`
- `DB_PORT=5432`
- `DB_USER=postgres`
- `DB_PASSWORD=postgres`
- `DB_NAME=app`
- `BCRYPT_SALT_ROUNDS=12`
- `MAIL_DRIVER=logger`
- `MAIL_DEFAULT_FROM_EMAIL=noreply@example.com`
- `MAIL_DEFAULT_FROM_NAME=Nest Template`
- `RESEND_API_KEY=re_xxx` when `MAIL_DRIVER=resend`
- `STORAGE_DRIVER=local`
- `STORAGE_LOCAL_ROOT=./storage`
- `STORAGE_PUBLIC_BASE_URL=http://localhost:3000/storage` when you want public URLs

The Nest template uses MikroORM with PostgreSQL and reads its connection settings from the same env file.

`CORS_ALLOWED_ORIGINS` is a comma-separated allowlist used to enable CORS at bootstrap time, for example `http://localhost:3001,http://localhost:5173`.

`API_PREFIX` defines the global route prefix for HTTP endpoints. With the default value, auth routes are exposed under `/api/auth/*` and the health check is available at `/api/health`.

## Auth Module

The template includes a JWT-based auth module with RBAC in [src/modules/domains/auth](/Volumes/Local/dev/pj-personal/templates/api/nest-template/packages/template/src/modules/domains/auth).

## Mail Module

The template includes a reusable mail infrastructure module in [src/modules/infra/mail](/Volumes/Local/dev/pj-personal/templates/api/nest-template/packages/template/src/modules/infra/mail).

Supported mail drivers:

- `logger`
- `resend`

`RESEND_API_KEY` is required only when `MAIL_DRIVER=resend`.

## Storage Module

The template includes a reusable storage infrastructure module in [src/modules/infra/storage](/Volumes/Local/dev/pj-personal/templates/api/nest-template/packages/template/src/modules/infra/storage).

Supported storage drivers:

- `local`

`STORAGE_LOCAL_ROOT` controls where files are written on disk.

`STORAGE_PUBLIC_BASE_URL` is optional and is used to build stable public URLs for stored objects.

Auth/RBAC tables:

- `users`
- `user_credentials`
- `user_sessions`
- `password_reset_tokens`
- `email_verification_tokens`
- `roles`
- `permissions`
- `user_roles`
- `role_permissions`

Migration commands:

```bash
pnpm run db:migration:up
pnpm run db:migration:down
pnpm run db:migration:create
pnpm run db:seed
```

Seeded baseline data:

- roles: `admin`, `member`
- permissions: `auth.me.read`, `auth.session.manage`, `users.read`, `users.manage`, `roles.read`, `roles.manage`
- users:
  - `admin@example.com` / `password123`
  - `member@example.com` / `password123`

Default auth endpoints:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/health`

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Architecture

This template follows a pragmatic backend architecture that keeps business logic explicit and easy to evolve:

- Modular monolith: organize the codebase by domain modules while keeping deployment and runtime simple as a single application.
- Repository pattern: isolate persistence concerns behind repository interfaces so domain and use case code do not depend on database details.
- Clean Architecture: separate controller, application, domain, and infrastructure concerns to keep dependencies moving inward.
- Use case pattern: model each business action as a dedicated use case so application behavior stays focused, testable, and discoverable.
- Controller thin: keep controllers limited to transport concerns such as request mapping, validation handoff, and response formatting.
- Listen/Event pattern: publish domain or application events and react through listeners to decouple side effects from the main execution flow.

## Project setup

```bash
$ pnpm install
```

## Compile and run the project

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Run tests

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ pnpm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
