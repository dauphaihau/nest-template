POST {{graphql_url}}
Authorization: Bearer {{access_token}}
```graphql
mutation CreateUser($input: CreateUserInput!) {
  createUser(input: $input) {
    id
    email
    displayName
    status
  }
}

variables {
  "input": {
    "email": "{{email}}",
    "password": "{{password}}",
    "displayName": "{{display_name}}"
  }
}
```

HTTP 200
[Asserts]
jsonpath "$.data.createUser.id" exists
jsonpath "$.data.createUser.email" == "{{email}}"
jsonpath "$.data.createUser.displayName" == "{{display_name}}"
jsonpath "$.data.createUser.status" == "active"
