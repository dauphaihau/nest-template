POST {{base_url}}/auth/refresh
Content-Type: application/json

{
  "refreshToken": "{{refresh_token}}"
}

HTTP 200
[Asserts]
jsonpath "$.accessToken" exists
jsonpath "$.refreshToken" exists
jsonpath "$.user.id" exists
