# Unauthenticated POST to /v1/fragments
POST http://localhost:8080/v1/fragments
# Sending a plain text fragment
Content-Type: text/plain
# Include wrong HTTP Basic Auth credentials
[BasicAuth]
user1@email.com:fsoinsdo
# Body of the request goes in ```...``` when it's a string
`This is a fragment!`

#We expect to get back an HTTP 201
HTTP/1.1 401

[Asserts]
jsonpath "$.status" == "error"
jsonpath "$.error.code" == 401
jsonpath "$.error.message" == "Unauthorized"
