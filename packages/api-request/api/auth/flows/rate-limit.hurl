POST {{base_url}}/auth/register
X-Forwarded-For: {{register_ip}}
Content-Type: application/json

{
  "email": "{{register_email_prefix}}-0@example.com",
  "password": "{{password}}",
  "displayName": "Register Attempt 1"
}

HTTP 201
[Asserts]
jsonpath "$.accessToken" exists
jsonpath "$.user.email" == "{{register_email_prefix}}-0@example.com"

POST {{base_url}}/auth/register
X-Forwarded-For: {{register_ip}}
Content-Type: application/json

{
  "email": "{{register_email_prefix}}-1@example.com",
  "password": "{{password}}",
  "displayName": "Register Attempt 2"
}

HTTP 201
[Asserts]
jsonpath "$.accessToken" exists
jsonpath "$.user.email" == "{{register_email_prefix}}-1@example.com"

POST {{base_url}}/auth/register
X-Forwarded-For: {{register_ip}}
Content-Type: application/json

{
  "email": "{{register_email_prefix}}-2@example.com",
  "password": "{{password}}",
  "displayName": "Register Attempt 3"
}

HTTP 201
[Asserts]
jsonpath "$.accessToken" exists
jsonpath "$.user.email" == "{{register_email_prefix}}-2@example.com"

POST {{base_url}}/auth/register
X-Forwarded-For: {{register_ip}}
Content-Type: application/json

{
  "email": "{{register_email_prefix}}-blocked@example.com",
  "password": "{{password}}",
  "displayName": "Blocked Register Attempt"
}

HTTP 429
[Asserts]
jsonpath "$.statusCode" == 429
jsonpath "$.error" == "ThrottlerException"
jsonpath "$.message" == "Too many requests."

POST {{base_url}}/auth/login
X-Forwarded-For: {{login_ip}}
Content-Type: application/json

{
  "email": "{{missing_user_email}}",
  "password": "{{password}}"
}

HTTP 401

POST {{base_url}}/auth/login
X-Forwarded-For: {{login_ip}}
Content-Type: application/json

{
  "email": "{{missing_user_email}}",
  "password": "{{password}}"
}

HTTP 401

POST {{base_url}}/auth/login
X-Forwarded-For: {{login_ip}}
Content-Type: application/json

{
  "email": "{{missing_user_email}}",
  "password": "{{password}}"
}

HTTP 401

POST {{base_url}}/auth/login
X-Forwarded-For: {{login_ip}}
Content-Type: application/json

{
  "email": "{{missing_user_email}}",
  "password": "{{password}}"
}

HTTP 401

POST {{base_url}}/auth/login
X-Forwarded-For: {{login_ip}}
Content-Type: application/json

{
  "email": "{{missing_user_email}}",
  "password": "{{password}}"
}

HTTP 401

POST {{base_url}}/auth/login
X-Forwarded-For: {{login_ip}}
Content-Type: application/json

{
  "email": "{{missing_user_email}}",
  "password": "{{password}}"
}

HTTP 429
[Asserts]
jsonpath "$.statusCode" == 429
jsonpath "$.error" == "ThrottlerException"
jsonpath "$.message" == "Too many requests."

POST {{base_url}}/auth/refresh
X-Forwarded-For: {{refresh_ip}}
Content-Type: application/json

{
  "refreshToken": "{{invalid_refresh_token}}"
}

HTTP 401

POST {{base_url}}/auth/refresh
X-Forwarded-For: {{refresh_ip}}
Content-Type: application/json

{
  "refreshToken": "{{invalid_refresh_token}}"
}

HTTP 401

POST {{base_url}}/auth/refresh
X-Forwarded-For: {{refresh_ip}}
Content-Type: application/json

{
  "refreshToken": "{{invalid_refresh_token}}"
}

HTTP 401

POST {{base_url}}/auth/refresh
X-Forwarded-For: {{refresh_ip}}
Content-Type: application/json

{
  "refreshToken": "{{invalid_refresh_token}}"
}

HTTP 401

POST {{base_url}}/auth/refresh
X-Forwarded-For: {{refresh_ip}}
Content-Type: application/json

{
  "refreshToken": "{{invalid_refresh_token}}"
}

HTTP 401

POST {{base_url}}/auth/refresh
X-Forwarded-For: {{refresh_ip}}
Content-Type: application/json

{
  "refreshToken": "{{invalid_refresh_token}}"
}

HTTP 401

POST {{base_url}}/auth/refresh
X-Forwarded-For: {{refresh_ip}}
Content-Type: application/json

{
  "refreshToken": "{{invalid_refresh_token}}"
}

HTTP 401

POST {{base_url}}/auth/refresh
X-Forwarded-For: {{refresh_ip}}
Content-Type: application/json

{
  "refreshToken": "{{invalid_refresh_token}}"
}

HTTP 401

POST {{base_url}}/auth/refresh
X-Forwarded-For: {{refresh_ip}}
Content-Type: application/json

{
  "refreshToken": "{{invalid_refresh_token}}"
}

HTTP 401

POST {{base_url}}/auth/refresh
X-Forwarded-For: {{refresh_ip}}
Content-Type: application/json

{
  "refreshToken": "{{invalid_refresh_token}}"
}

HTTP 401

POST {{base_url}}/auth/refresh
X-Forwarded-For: {{refresh_ip}}
Content-Type: application/json

{
  "refreshToken": "{{invalid_refresh_token}}"
}

HTTP 429
[Asserts]
jsonpath "$.statusCode" == 429
jsonpath "$.error" == "ThrottlerException"
jsonpath "$.message" == "Too many requests."
