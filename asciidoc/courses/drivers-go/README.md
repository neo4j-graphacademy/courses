# Using Neo4j with Go

This course teaches you how to integrate Neo4j into your Go applications using the official Neo4j Go Driver.

## Prerequisites

- Go 1.21 or later
- Basic knowledge of Go programming
- Basic knowledge of Neo4j and Cypher

## Course Structure

The course is divided into three modules:

### Module 1: The Driver
- Installing the driver
- Creating driver instances
- Executing queries
- Working with results

### Module 2: Handling Results
- Graph types (Nodes, Relationships, Paths)
- Temporal types (Dates and times)
- Spatial types (Points and distances)

### Module 3: Best Practices
- Transaction management
- Error handling
- Production considerations

## Getting Started

1. Install the Neo4j Go Driver:
   ```bash
   go get github.com/neo4j/neo4j-go-driver/v5
   ```

2. Run the example code:
   ```bash
   go run tests.go
   ```

## Resources

- [Neo4j Go Driver Manual](https://neo4j.com/docs/go-manual/current/)
- [Go Driver GitHub Repository](https://github.com/neo4j/neo4j-go-driver)
- [Neo4j Developer Resources](https://neo4j.com/developer/go/)

## Course Files

- `course.adoc` - Main course definition
- `summary.adoc` - Course summary and next steps
- `tests.go` - Example Go code demonstrating driver usage
- `go.mod` - Go module definition
- `modules/` - Course modules and lessons
