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
jsonpath "$.data.user.email" exists
jsonpath "$.data.user.status" exists
