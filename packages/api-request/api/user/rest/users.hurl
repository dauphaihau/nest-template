GET {{base_url}}/users
Authorization: Bearer {{access_token}}

HTTP 200
[Asserts]
jsonpath "$[0].id" exists
jsonpath "$[0].email" exists
jsonpath "$[0].status" exists
