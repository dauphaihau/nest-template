POST {{base_url}}/auth/register
Content-Type: application/json

{
  "email": "{{email}}",
  "password": "{{password}}",
  "displayName": "{{display_name}}"
}

HTTP 201
[Captures]
register_access_token: jsonpath "$.accessToken"
register_refresh_token: jsonpath "$.refreshToken"
register_user_id: jsonpath "$.user.id"
register_session_id: jsonpath "$.user.sessionId"
[Asserts]
jsonpath "$.accessToken" exists
jsonpath "$.refreshToken" exists
jsonpath "$.user.email" == "{{email}}"
jsonpath "$.user.displayName" == "{{display_name}}"

GET {{base_url}}/auth/me
Authorization: Bearer {{register_access_token}}

HTTP 200
[Asserts]
jsonpath "$.id" == "{{register_user_id}}"
jsonpath "$.email" == "{{email}}"
jsonpath "$.sessionId" == "{{register_session_id}}"

POST {{base_url}}/auth/refresh
Content-Type: application/json

{
  "refreshToken": "{{register_refresh_token}}"
}

HTTP 200
[Captures]
refreshed_access_token: jsonpath "$.accessToken"
[Asserts]
jsonpath "$.accessToken" exists
jsonpath "$.refreshToken" exists
jsonpath "$.user.id" == "{{register_user_id}}"
jsonpath "$.user.email" == "{{email}}"

POST {{base_url}}/auth/logout
Authorization: Bearer {{refreshed_access_token}}

HTTP 204

GET {{base_url}}/auth/me
Authorization: Bearer {{refreshed_access_token}}

HTTP 401

POST {{base_url}}/auth/login
Content-Type: application/json

{
  "email": "{{email}}",
  "password": "{{password}}"
}

HTTP 200
[Captures]
login_access_token: jsonpath "$.accessToken"
login_session_id: jsonpath "$.user.sessionId"
[Asserts]
jsonpath "$.accessToken" exists
jsonpath "$.refreshToken" exists
jsonpath "$.user.id" == "{{register_user_id}}"
jsonpath "$.user.email" == "{{email}}"

GET {{base_url}}/auth/me
Authorization: Bearer {{login_access_token}}

HTTP 200
[Asserts]
jsonpath "$.id" == "{{register_user_id}}"
jsonpath "$.email" == "{{email}}"
jsonpath "$.sessionId" == "{{login_session_id}}"
