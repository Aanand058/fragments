# 1. Authenticated POST to /v1/fragments
POST http://localhost:8080/v1/fragments
Content-Type: text/markdown
[BasicAuth]
user1@email.com:password1
`## This is a markdown fragment`

# 2. Confirm that the server returns a 201
HTTP/1.1 201
[Captures]
url: header "Location"
fragment_id: jsonpath "$.fragment.id"

# 3. GET the newly created fragment info
GET {{url}}/info
[BasicAuth]
user1@email.com:password1

# Confirm that the server returns expected response
HTTP/1.1 200
Content-Type: application/json; charset=utf-8
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" == {{fragment_id}}
jsonpath "$.fragment.ownerId" matches "^[0-9a-fA-F]+$"
jsonpath "$.fragment.created" isString
jsonpath "$.fragment.created" matches /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/
jsonpath "$.fragment.updated" isString
jsonpath "$.fragment.updated" matches /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/
jsonpath "$.fragment.type" == "text/markdown"
jsonpath "$.fragment.size" == 30

# 4. Convert markdown fragment to html
GET {{url}}.html
[BasicAuth]
user1@email.com:password1

# Confirm that the server returns expected response
HTTP/1.1 200
Content-Type: text/html
Content-Length: 37
[Asserts]
body == "<h2>This is a markdown fragment</h2>\n"
