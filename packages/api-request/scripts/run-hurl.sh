#!/usr/bin/env bash

set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
package_dir="$(cd "$script_dir/.." && pwd)"

base_url="${API_BASE_URL:-http://127.0.0.1:3000/api}"
graphql_url="${GRAPHQL_URL:-http://127.0.0.1:3000/graphql}"
hurl_bin="${HURL_BIN:-hurl}"

command="${1:-}"
if [[ -z "$command" ]]; then
  echo "missing command" >&2
  exit 1
fi
shift

email=""
password="password123"
display_name="Demo User"
refresh_token=""
access_token=""
verbose="false"
file=""
collect_display_name="false"
register_email_prefix=""
missing_user_email=""
register_ip="203.0.113.10"
login_ip="203.0.113.11"
refresh_ip="203.0.113.12"
invalid_refresh_token="invalid-refresh-token-value-1234567890"
user_id=""
user_register_ip=""
api_mode="rest"

for arg in "$@"; do
  case "$arg" in
    --email=*|email=*)
      email="${arg#*=}"
      collect_display_name="false"
      ;;
    --password=*|password=*)
      password="${arg#*=}"
      collect_display_name="false"
      ;;
    --display-name=*|display_name=*|display-name=*)
      display_name="${arg#*=}"
      collect_display_name="true"
      ;;
    --display-name|display_name|display-name)
      display_name=""
      collect_display_name="true"
      ;;
    --refresh-token=*|refresh_token=*|refresh-token=*)
      refresh_token="${arg#*=}"
      collect_display_name="false"
      ;;
    --access-token=*|access_token=*|access-token=*)
      access_token="${arg#*=}"
      collect_display_name="false"
      ;;
    --user-id=*|user_id=*|user-id=*)
      user_id="${arg#*=}"
      collect_display_name="false"
      ;;
    --api=*|api=*)
      api_mode="${arg#*=}"
      collect_display_name="false"
      ;;
    --file=*|file=*)
      file="${arg#*=}"
      collect_display_name="false"
      ;;
    --verbose|--very-verbose)
      verbose="true"
      collect_display_name="false"
      ;;
    --*)
      collect_display_name="false"
      ;;
    *)
      if [[ "$collect_display_name" == "true" ]]; then
        if [[ -n "$display_name" ]]; then
          display_name="$display_name $arg"
        else
          display_name="$arg"
        fi
      fi
      ;;
  esac
done

run_hurl() {
  local hurl_file="$1"
  shift
  local cmd=("$hurl_bin")

  if [[ "$verbose" == "true" ]]; then
    cmd+=(--very-verbose)
  fi

  cmd+=(
    --variable "base_url=$base_url"
    --variable "graphql_url=$graphql_url"
    "$@"
    "$hurl_file"
  )

  (
    cd "$package_dir"
    "${cmd[@]}"
  )
}

ensure_rate_limit_variables() {
  if [[ -z "$register_email_prefix" ]]; then
    register_email_prefix="rate-limit-$(uuidgen | tr 'A-Z' 'a-z')"
  fi

  if [[ -z "$missing_user_email" ]]; then
    missing_user_email="missing-$(uuidgen | tr 'A-Z' 'a-z')@example.com"
  fi
}

ensure_user_graphql_variables() {
  if [[ -z "$user_register_ip" ]]; then
    user_register_ip="198.51.100.$(( (RANDOM % 200) + 1 ))"
  fi
}

case "$command" in
  run)
    if [[ -z "$file" ]]; then
      echo "missing --file=<path>" >&2
      exit 1
    fi
    run_hurl "$file"
    ;;
  health)
    run_hurl "api/health/health.hurl"
    ;;
  test-all)
    if [[ -z "$email" ]]; then
      email="demo+$(uuidgen | tr 'A-Z' 'a-z')@example.com"
    fi
    run_hurl \
      "api/auth/flows/full-auth-lifecycle.hurl" \
      --variable "email=$email" \
      --variable "password=$password" \
      --variable "display_name=$display_name"
    ;;
  test-rate-limit)
    ensure_rate_limit_variables
    run_hurl \
      "api/auth/flows/rate-limit.hurl" \
      --variable "password=$password" \
      --variable "register_email_prefix=$register_email_prefix" \
      --variable "missing_user_email=$missing_user_email" \
      --variable "register_ip=$register_ip" \
      --variable "login_ip=$login_ip" \
      --variable "refresh_ip=$refresh_ip" \
      --variable "invalid_refresh_token=$invalid_refresh_token"
    ;;
  register)
    if [[ -z "$email" ]]; then
      email="demo+$(uuidgen | tr 'A-Z' 'a-z')@example.com"
    fi
    run_hurl \
      "api/auth/register.hurl" \
      --variable "email=$email" \
      --variable "password=$password" \
      --variable "display_name=$display_name"
    ;;
  login)
    if [[ -z "$email" ]]; then
      email="admin@example.com"
    fi
    run_hurl \
      "api/auth/login.hurl" \
      --variable "email=$email" \
      --variable "password=$password"
    ;;
  refresh)
    if [[ -z "$refresh_token" ]]; then
      echo "missing --refresh-token=<token>" >&2
      exit 1
    fi
    run_hurl "api/auth/refresh.hurl" --variable "refresh_token=$refresh_token"
    ;;
  logout)
    if [[ -z "$access_token" ]]; then
      echo "missing --access-token=<token>" >&2
      exit 1
    fi
    run_hurl "api/auth/logout.hurl" --variable "access_token=$access_token"
    ;;
  me)
    if [[ -z "$access_token" ]]; then
      echo "missing --access-token=<token>" >&2
      exit 1
    fi
    run_hurl "api/auth/me.hurl" --variable "access_token=$access_token"
    ;;
  user-test-all)
    if [[ -z "$email" ]]; then
      email="demo+$(uuidgen | tr 'A-Z' 'a-z')@example.com"
    fi
    ensure_user_graphql_variables
    run_hurl \
      "api/user/graphql/flows/user-queries.hurl" \
      --variable "email=$email" \
      --variable "password=$password" \
      --variable "display_name=$display_name" \
      --variable "register_ip=$user_register_ip"
    ;;
  user-by-id)
    if [[ -z "$access_token" ]]; then
      echo "missing --access-token=<token>" >&2
      exit 1
    fi
    if [[ -z "$user_id" ]]; then
      echo "missing --user-id=<id>" >&2
      exit 1
    fi
    if [[ "$api_mode" == "graphql" ]]; then
      run_hurl \
        "api/user/graphql/user.hurl" \
        --variable "access_token=$access_token" \
        --variable "user_id=$user_id"
    else
      run_hurl \
        "api/user/rest/user.hurl" \
        --variable "access_token=$access_token" \
        --variable "user_id=$user_id"
    fi
    ;;
  user-rest-by-id)
    if [[ -z "$access_token" ]]; then
      echo "missing --access-token=<token>" >&2
      exit 1
    fi
    if [[ -z "$user_id" ]]; then
      echo "missing --user-id=<id>" >&2
      exit 1
    fi
    run_hurl \
      "api/user/rest/user.hurl" \
      --variable "access_token=$access_token" \
      --variable "user_id=$user_id"
    ;;
  create-user)
    if [[ -z "$access_token" ]]; then
      echo "missing --access-token=<token>" >&2
      exit 1
    fi
    if [[ -z "$email" ]]; then
      email="user+$(uuidgen | tr 'A-Z' 'a-z')@example.com"
    fi
    if [[ "$api_mode" == "graphql" ]]; then
      run_hurl \
        "api/user/graphql/create-user.hurl" \
        --variable "access_token=$access_token" \
        --variable "email=$email" \
        --variable "password=$password" \
        --variable "display_name=$display_name"
    else
      run_hurl \
        "api/user/rest/create-user.hurl" \
        --variable "access_token=$access_token" \
        --variable "email=$email" \
        --variable "password=$password" \
        --variable "display_name=$display_name"
    fi
    ;;
  users)
    if [[ -z "$access_token" ]]; then
      echo "missing --access-token=<token>" >&2
      exit 1
    fi
    if [[ "$api_mode" == "graphql" ]]; then
      run_hurl "api/user/graphql/users.hurl" --variable "access_token=$access_token"
    else
      run_hurl "api/user/rest/users.hurl" --variable "access_token=$access_token"
    fi
    ;;
  users-rest)
    if [[ -z "$access_token" ]]; then
      echo "missing --access-token=<token>" >&2
      exit 1
    fi
    run_hurl "api/user/rest/users.hurl" --variable "access_token=$access_token"
    ;;
  *)
    echo "unknown command: $command" >&2
    exit 1
    ;;
esac
