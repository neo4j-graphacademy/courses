package main

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/neo4j/neo4j-go-driver/v5/neo4j"
)

const (
	NEO4J_URI      = "neo4j://localhost:7687"
	NEO4J_USER     = "neo4j"
	NEO4J_PASSWORD = "neoneoneo"
)

func main() {
	ctx := context.Background()
	
	// Create driver instance
	driver, err := neo4j.NewDriverWithContext(
		NEO4J_URI,
		neo4j.BasicAuth(NEO4J_USER, NEO4J_PASSWORD, ""),
	)
	if err != nil {
		log.Fatal("Error creating driver:", err)
	}
	defer driver.Close(ctx)

	// Verify connectivity
	err = driver.VerifyConnectivity(ctx)
	if err != nil {
		log.Fatal("Error verifying connectivity:", err)
	}
	fmt.Println("Successfully connected to Neo4j!")

	// Example 1: Simple query with execute_query equivalent
	fmt.Println("\n=== Example 1: Simple Query ===")
	result, err := neo4j.ExecuteQuery(ctx, driver,
		"RETURN 42 AS answer",
		nil,
		neo4j.EagerResultTransformer,
	)
	if err != nil {
		log.Fatal("Error executing query:", err)
	}

	for _, record := range result.Records {
		answer, _ := record.Get("answer")
		fmt.Printf("Answer: %v\n", answer)
	}

	// Example 2: Using sessions for more control
	fmt.Println("\n=== Example 2: Using Sessions ===")
	session := driver.NewSession(ctx, neo4j.SessionConfig{})
	defer session.Close(ctx)

	result2, err := session.Run(ctx, "RETURN 42 AS answer", nil)
	if err != nil {
		log.Fatal("Error in session:", err)
	}

	for result2.Next(ctx) {
		record := result2.Record()
		answer, _ := record.Get("answer")
		fmt.Printf("Answer from session: %v\n", answer)
	}

	// Example 3: Using result transformer
	fmt.Println("\n=== Example 3: Result Transformer ===")
	result, err = neo4j.ExecuteQuery(ctx, driver,
		"UNWIND range(1, 10) AS r RETURN r",
		nil,
		neo4j.EagerResultTransformer,
	)
	if err != nil {
		log.Fatal("Error with result transformer:", err)
	}

	for _, record := range result.Records {
		r, _ := record.Get("r")
		fmt.Printf("%s: r = %v\n", time.Now().Format("15:04:05"), r)
	}

	// Example 4: Working with parameters
	fmt.Println("\n=== Example 4: Parameters ===")
	result, err = neo4j.ExecuteQuery(ctx, driver,
		"RETURN $name AS name, $age AS age",
		map[string]any{
			"name": "Alice",
			"age":  30,
		},
		neo4j.EagerResultTransformer,
	)
	if err != nil {
		log.Fatal("Error with parameters:", err)
	}

	for _, record := range result.Records {
		name, _ := record.Get("name")
		age, _ := record.Get("age")
		fmt.Printf("Name: %s, Age: %v\n", name, age)
	}

	fmt.Println("\nAll examples completed successfully!")
}
