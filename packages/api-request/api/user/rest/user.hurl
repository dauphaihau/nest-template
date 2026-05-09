GET {{base_url}}/users/{{user_id}}
Authorization: Bearer {{access_token}}

HTTP 200
[Asserts]
jsonpath "$.id" == "{{user_id}}"
jsonpath "$.email" exists
jsonpath "$.status" exists
