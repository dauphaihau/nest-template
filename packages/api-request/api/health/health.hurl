GET {{base_url}}/health

HTTP 200
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.timestamp" exists
jsonpath "$.components.db.status" == "ok"
jsonpath "$.components.storage.status" == "ok"
