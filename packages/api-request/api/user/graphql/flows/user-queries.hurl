POST {{base_url}}/auth/register
X-Forwarded-For: {{register_ip}}
Content-Type: application/json

{
  "email": "{{email}}",
  "password": "{{password}}",
  "displayName": "{{display_name}}"
}

HTTP 201
[Captures]
access_token: jsonpath "$.accessToken"
user_id: jsonpath "$.user.id"
[Asserts]
jsonpath "$.user.email" == "{{email}}"
jsonpath "$.user.displayName" == "{{display_name}}"

POST {{graphql_url}}
Authorization: Bearer {{access_token}}
```graphql
query UserById($id: ID!) {
  user(id: $id) {
    id
    email
    displayName
    status
  }
}

variables {
  "id": "{{user_id}}"
}
```

HTTP 200
[Asserts]
jsonpath "$.data.user.id" == "{{user_id}}"
jsonpath "$.data.user.email" == "{{email}}"
jsonpath "$.data.user.displayName" == "{{display_name}}"
jsonpath "$.data.user.status" exists

POST {{graphql_url}}
Authorization: Bearer {{access_token}}
```graphql
query ListUsers {
  users {
    id
    email
    displayName
    status
  }
}
```

HTTP 200
[Asserts]
jsonpath "$.data.users" count == 1
jsonpath "$.data.users[0].id" == "{{user_id}}"
jsonpath "$.data.users[0].email" == "{{email}}"
jsonpath "$.data.users[0].displayName" == "{{display_name}}"
jsonpath "$.data.users[0].status" exists

GET {{base_url}}/users
Authorization: Bearer {{access_token}}

HTTP 200
[Asserts]
jsonpath "$[0].id" == "{{user_id}}"
jsonpath "$[0].email" == "{{email}}"
jsonpath "$[0].displayName" == "{{display_name}}"
jsonpath "$[0].status" exists

GET {{base_url}}/users/{{user_id}}
Authorization: Bearer {{access_token}}

HTTP 200
[Asserts]
jsonpath "$.id" == "{{user_id}}"
jsonpath "$.email" == "{{email}}"
jsonpath "$.displayName" == "{{display_name}}"
jsonpath "$.status" exists
