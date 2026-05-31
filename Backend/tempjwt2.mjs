import jwt from "jsonwebtoken";
const token = jwt.sign(
  { id: "host-test", role: "HOST", email: "host@example.com" },
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzc5NDU2NDYzLCJleHAiOjE3Nzk0NjAwNjN9.2hTPd4VRYJqcaLZ-fusYhJHRj7sYFPAMT8eaOTMyQJM",
  { expiresIn: "1h" },
);
console.log(token);
