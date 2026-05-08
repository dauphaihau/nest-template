GET {{base_url}}/auth/me
Authorization: Bearer {{access_token}}

HTTP 200
[Asserts]
jsonpath "$.id" exists
jsonpath "$.email" exists
