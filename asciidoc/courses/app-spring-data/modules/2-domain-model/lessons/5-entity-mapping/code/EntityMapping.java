// tag::order-mapping[]
@Node
class Order {
    @Id
    String transactionId;
    String orderNumber;
    LocalDate orderDate;
    LocalTime orderTime;

    @Relationship(value = "BOUGHT", direction = Relationship.Direction.INCOMING)
    Customer customer;
    @Relationship(value = "SOLD", direction = Relationship.Direction.INCOMING)
    Employee employee;

    //constructor, getters, and setters
}

interface OrderRepository extends Neo4jRepository<Order, String> {
    @Query("MATCH (o:Order)<-[rel]-(person) RETURN * LIMIT 10;")
    List<Order> findTenOrders();
}
// end::order-mapping[]

// tag::receipt-mapping[]
@Node
class Order {
    //other fields
    
    @Relationship(value = "BOUGHT", direction = Relationship.Direction.INCOMING)
    Receipt customerReceipt;

    //constructor, getters, and setters
}

@RelationshipProperties
class Receipt {
    @RelationshipId
    String id;

    Double orderTotal;

    @TargetNode
    Customer customer;

    //constructor, getters, and setters
}
// end::receipt-mapping[]