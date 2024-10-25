// tag::constraint[]
CREATE CONSTRAINT UserEmailUnique
IF NOT EXISTS
FOR (user:User)
REQUIRE user.email IS UNIQUE
// end::constraint[]
;
