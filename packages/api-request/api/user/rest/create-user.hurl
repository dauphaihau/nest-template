POST {{base_url}}/users
Authorization: Bearer {{access_token}}
Content-Type: application/json

{
  "email": "{{email}}",
  "password": "{{password}}",
  "displayName": "{{display_name}}"
}

HTTP 201
[Asserts]
jsonpath "$.id" exists
jsonpath "$.email" == "{{email}}"
jsonpath "$.displayName" == "{{display_name}}"
jsonpath "$.status" == "active"
