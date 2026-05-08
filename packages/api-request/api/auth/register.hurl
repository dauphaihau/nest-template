POST {{base_url}}/auth/register
Content-Type: application/json

{
  "email": "{{email}}",
  "password": "{{password}}",
  "displayName": "{{display_name}}"
}

HTTP 201
[Asserts]
jsonpath "$.accessToken" exists
jsonpath "$.refreshToken" exists
jsonpath "$.user.email" == "{{email}}"
