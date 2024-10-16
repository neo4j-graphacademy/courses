// tag::model[]
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

@Node
class Customer {
    @Id
    String customerId;
    String customerName;
    String loyaltyId;

    //constructor, getters, and setters
}

@Node
class Employee {
    @Id
    String employeeId;
    String employeeName;
    LocalDate startDate;

    //constructor, getters, and setters
}
// end::model[]