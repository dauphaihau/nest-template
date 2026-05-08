POST {{base_url}}/auth/login
Content-Type: application/json

{
  "email": "{{email}}",
  "password": "{{password}}"
}

HTTP 200
[Asserts]
jsonpath "$.accessToken" exists
jsonpath "$.refreshToken" exists
jsonpath "$.user.email" == "{{email}}"
