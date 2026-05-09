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
jsonpath "$.data.users" exists
jsonpath "$.data.users[0].id" exists
jsonpath "$.data.users[0].email" exists
jsonpath "$.data.users[0].status" exists
