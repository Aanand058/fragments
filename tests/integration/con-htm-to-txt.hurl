# 1. Authenticated POST to /v1/fragments
POST http://localhost:8080/v1/fragments
Content-Type: text/html
[BasicAuth]
user1@email.com:password1
`<h2>This is a html fragment</h2>`

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
jsonpath "$.fragment.type" == "text/html"
jsonpath "$.fragment.size" == 32

# 4. Convert html fragment to text
GET {{url}}.txt
[BasicAuth]
user1@email.com:password1

# Confirm that the server returns expected response
HTTP/1.1 200
Content-Type: text/plain
Content-Length: 32
[Asserts]
body == "<h2>This is a html fragment</h2>"
