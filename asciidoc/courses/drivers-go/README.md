# Neo4j Go Driver Course

This course teaches you how to integrate Neo4j into your Go projects using the Neo4j Go Driver.

## Prerequisites

- Go 1.21 or later
- Basic knowledge of Go and Go modules
- Basic knowledge of Neo4j and Cypher

## Course Structure

- **Module 1: The Driver** - Installation, connection, and basic query execution
- **Module 2: Handling Results** - Working with different data types (graph, temporal, spatial)
- **Module 3: Best Practices** - Transaction management, error handling, and production patterns

## Quick Start

1. **Set up a new Go project:**
   ```bash
   mkdir hello-neo4j
   cd hello-neo4j
   go mod init graphacademy/hello
   ```

2. **Install the Neo4j Go Driver:**
   ```bash
   go get github.com/neo4j/neo4j-go-driver/v5
   ```

3. **Create a simple connection:**
   ```go
   package main

   import (
       "context"
       "fmt"
       "github.com/neo4j/neo4j-go-driver/v5/neo4j"
   )

   func main() {
       driver, err := neo4j.NewDriverWithContext(
           "neo4j://localhost:7687",
           neo4j.BasicAuth("neo4j", "your-password", ""),
       )
       if err != nil {
           panic(err)
       }
       defer driver.Close(context.Background())
       
       fmt.Println("Connected to Neo4j!")
   }
   ```

4. **Run the example:**
   ```bash
   go run main.go
   ```

## Running the Tests

The `tests.go` file contains comprehensive examples that demonstrate all the concepts covered in the course:

```bash
go run tests.go
```

## Course Content

This course includes:
- 7 lessons covering driver installation, query execution, result handling, and best practices
- 8 challenges to test your understanding
- Working code examples that compile and run successfully
- Production-ready patterns and error handling strategies

## Resources

- [Neo4j Go Driver Documentation](https://neo4j.com/docs/go-manual/current/)
- [Neo4j Go Driver GitHub](https://github.com/neo4j/neo4j-go-driver)
- [Neo4j Fundamentals Course](https://graphacademy.neo4j.com/courses/neo4j-fundamentals/)
- [Cypher Fundamentals Course](https://graphacademy.neo4j.com/courses/cypher-fundamentals/)
