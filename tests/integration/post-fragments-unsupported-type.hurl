# tests/integration/post-fragments-unsupported-type.hurl
# Authenticated POST to /v1/fragments with an unsupported Content-Type
POST http://localhost:8080/v1/fragments
# Set an unsupported Content-Type
Content-Type: application/xml
# Include HTTP Basic Auth credentials
[BasicAuth]
user1@email.com:password1
# Body of the request goes in ```...``` when it's a string
`<xml>unsupported fragment type</xml>`

# We expect to get back an HTTP 415 Unsupported Media Type error
HTTP/1.1 415
[Asserts]
# Assert that the response status is 415
status == 415
