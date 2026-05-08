compose_file := "infra/docker-compose.yml"
template_dir := "packages/template"
api_request_dir := "packages/api-request"

infra-up:
  docker compose -f {{ compose_file }} up -d

infra-down:
  docker compose -f {{ compose_file }} down

template-up environment='':
  env_file="{{ if environment == "" { ".env" } else { ".env." + environment } }}"; \
  cd {{ template_dir }} && \
  test -f "$env_file" && \
  set -a && \
  . "$env_file" && \
  set +a && \
  pnpm start:dev

template-seed environment='':
  env_file="{{ if environment == "" { ".env" } else { ".env." + environment } }}"; \
  cd {{ template_dir }} && \
  test -f "$env_file" && \
  set -a && \
  . "$env_file" && \
  set +a && \
  pnpm db:seed

template-migration-up environment='':
  env_file="{{ if environment == "" { ".env" } else { ".env." + environment } }}"; \
  cd {{ template_dir }} && \
  test -f "$env_file" && \
  set -a && \
  . "$env_file" && \
  set +a && \
  pnpm db:migration:up

template-migration-down environment='':
  env_file="{{ if environment == "" { ".env" } else { ".env." + environment } }}"; \
  cd {{ template_dir }} && \
  test -f "$env_file" && \
  set -a && \
  . "$env_file" && \
  set +a && \
  pnpm db:migration:down

template-migration-create environment='':
  env_file="{{ if environment == "" { ".env" } else { ".env." + environment } }}"; \
  cd {{ template_dir }} && \
  test -f "$env_file" && \
  set -a && \
  . "$env_file" && \
  set +a && \
  pnpm db:migration:create

api-request-run file:
  @cd {{ api_request_dir }} && just run --file="{{ file }}"

api-auth *args:
  @cd {{ api_request_dir }} && just auth {{ args }}
