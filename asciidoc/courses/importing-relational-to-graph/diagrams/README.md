# Diagrams and Screenshots Needed for the Course

This document lists all locations where screenshots or diagrams are needed, organized by type.

---

## PART 1: SCREENSHOTS NEEDED (Manual Capture Required)

These require actual screenshots from the software interfaces:

### Module 1: Foundation

#### Lesson 2: Prerequisites
| Location | Description | Suggested Filename |
|----------|-------------|-------------------|
| Line 226 | Data Importer initial screen | `data-importer-initial.png` |
| Line 235 | Add Data Source dialog | `add-data-source-dialog.png` |
| Line 301 | Table list in Data Importer | `data-importer-tables.png` |

### Module 2: Modelling

#### Lesson 1: Connecting to PostgreSQL
| Location | Description | Suggested Filename |
|----------|-------------|-------------------|
| Line 102 | Query results in Postico/pgAdmin | `query-results.png` |
| Line 117 | Customers table columns | `customers-columns.png` |
| Line 141 | Record counts | `record-counts.png` |
| Line 166 | Foreign key relationships | `foreign-keys.png` |
| Line 226 | Customer data | `customer-data.png` |
| Line 249 | Joined order data | `joined-order-data.png` |

#### Lesson 5: Planning Validation
| Location | Description | Suggested Filename |
|----------|-------------|-------------------|
| Line 307 | SHOW CONSTRAINTS output | `show-constraints.png` |
| Line 309 | SHOW INDEXES output | `show-indexes.png` |

#### Lesson 6: Modelling Workshop (Arrows.app)
| Location | Description | Suggested Filename |
|----------|-------------|-------------------|
| Line 34 | Arrows.app blank canvas | `arrows-blank.png` |
| Line 42 | Node creation | `arrows-create-node.png` |
| Line 67 | Arranged nodes | `arrows-arranged-nodes.png` |
| Line 89 | Customer node with properties | `arrows-customer-properties.png` |
| Line 148 | PLACED relationship | `arrows-placed-relationship.png` |
| Line 166 | Relationship with properties | `arrows-relationship-properties.png` |
| Line 179 | Self-referencing relationship | `arrows-self-reference.png` |
| Line 186 | Complete Arrows.app model | `arrows-complete-model.png` |
| Line 209 | Export menu | `arrows-export.png` |

**Total Screenshots Needed: 20**

---

## PART 2: MERMAID DIAGRAMS (Generated)

These conceptual diagrams have been generated as PNG files in this directory:

| # | Diagram | Purpose | Target Location | PNG File |
|---|---------|---------|-----------------|----------|
| 1 | Node Labels Overview | Shows all 7 node labels derived from Northwind tables | `lessons/2-analysing-schema/lesson.adoc` Line 320 | `01-node-labels.png` |
| 2 | Customer-PLACED-Order | Shows the PLACED relationship mapping | `lessons/3-identifying-nodes/lesson.adoc` Line 140 | `02-customer-placed-order.png` |
| 3 | Employee-PROCESSED-Order | Shows the PROCESSED relationship mapping | `lessons/3-identifying-nodes/lesson.adoc` Line 156 | `03-employee-processed-order.png` |
| 4 | Order-SHIPPED_BY-Shipper | Shows the SHIPPED_BY relationship mapping | `lessons/3-identifying-nodes/lesson.adoc` Line 170 | `04-order-shipped-by-shipper.png` |
| 5 | Order-CONTAINS-Product | Shows junction table becoming relationship with properties | `lessons/3-identifying-nodes/lesson.adoc` Line 188 | `05-order-contains-product.png` |
| 6 | Product-IN_CATEGORY-Category | Shows the IN_CATEGORY relationship mapping | `lessons/3-identifying-nodes/lesson.adoc` Line 202 | `06-product-in-category.png` |
| 7 | Supplier-SUPPLIES-Product | Shows the SUPPLIES relationship mapping | `lessons/3-identifying-nodes/lesson.adoc` Line 218 | `07-supplier-supplies-product.png` |
| 8 | Employee-REPORTS_TO-Employee | Shows self-referencing relationship for hierarchy | `lessons/3-identifying-nodes/lesson.adoc` Line 234 | `08-employee-reports-to.png` |
| 9 | Complete Northwind Model | Shows all nodes and relationships together | `lessons/3-identifying-nodes/lesson.adoc` Line 275 | `09-complete-northwind-model.png` |

**Total Diagrams Generated: 9**

---

## SUMMARY FOR REVIEW

### Diagram 1: Node Labels Overview (`01-node-labels.png`)
Shows the transformation from 7 Northwind relational tables to 7 graph node labels:
- customers → Customer
- orders → Order  
- products → Product
- categories → Category
- suppliers → Supplier
- employees → Employee
- shippers → Shipper

### Diagram 2: Customer-PLACED-Order (`02-customer-placed-order.png`)
Shows how the foreign key `orders.customer_id → customers.customer_id` becomes the `(Customer)-[:PLACED]->(Order)` relationship.

### Diagram 3: Employee-PROCESSED-Order (`03-employee-processed-order.png`)
Shows how the foreign key `orders.employee_id → employees.employee_id` becomes the `(Employee)-[:PROCESSED]->(Order)` relationship.

### Diagram 4: Order-SHIPPED_BY-Shipper (`04-order-shipped-by-shipper.png`)
Shows how the foreign key `orders.ship_via → shippers.shipper_id` becomes the `(Order)-[:SHIPPED_BY]->(Shipper)` relationship.

### Diagram 5: Order-CONTAINS-Product (`05-order-contains-product.png`)
Shows how the junction table `order_details` (with order_id, product_id, quantity, unit_price, discount) becomes the `(Order)-[:CONTAINS {quantity, unitPrice, discount}]->(Product)` relationship with properties.

### Diagram 6: Product-IN_CATEGORY-Category (`06-product-in-category.png`)
Shows how the foreign key `products.category_id → categories.category_id` becomes the `(Product)-[:IN_CATEGORY]->(Category)` relationship.

### Diagram 7: Supplier-SUPPLIES-Product (`07-supplier-supplies-product.png`)
Shows how the foreign key `products.supplier_id → suppliers.supplier_id` becomes the `(Supplier)-[:SUPPLIES]->(Product)` relationship.

### Diagram 8: Employee-REPORTS_TO-Employee (`08-employee-reports-to.png`)
Shows how the self-referencing foreign key `employees.reports_to → employees.employee_id` becomes the `(Employee)-[:REPORTS_TO]->(Employee)` relationship, creating the management hierarchy.

### Diagram 9: Complete Northwind Model (`09-complete-northwind-model.png`)
Shows the complete graph model with all 7 node labels and all 7 relationship types:
- Customer -PLACED-> Order
- Employee -PROCESSED-> Order
- Order -SHIPPED_BY-> Shipper
- Order -CONTAINS-> Product (with properties)
- Product -IN_CATEGORY-> Category
- Supplier -SUPPLIES-> Product
- Employee -REPORTS_TO-> Employee

---

## TO COPY DIAGRAMS TO LESSON FOLDERS

After reviewing, copy the PNG files to the appropriate lesson image folders:

```bash
# Node labels diagram
cp 01-node-labels.png ../modules/2-modelling/lessons/2-analysing-schema/images/node-labels.png

# Relationship diagrams
cp 02-customer-placed-order.png ../modules/2-modelling/lessons/3-identifying-nodes/images/customer-placed-order.png
cp 03-employee-processed-order.png ../modules/2-modelling/lessons/3-identifying-nodes/images/employee-processed-order.png
cp 04-order-shipped-by-shipper.png ../modules/2-modelling/lessons/3-identifying-nodes/images/order-shipped-by-shipper.png
cp 05-order-contains-product.png ../modules/2-modelling/lessons/3-identifying-nodes/images/order-contains-product.png
cp 06-product-in-category.png ../modules/2-modelling/lessons/3-identifying-nodes/images/product-in-category.png
cp 07-supplier-supplies-product.png ../modules/2-modelling/lessons/3-identifying-nodes/images/supplier-supplies-product.png
cp 08-employee-reports-to.png ../modules/2-modelling/lessons/3-identifying-nodes/images/employee-reports-to.png
cp 09-complete-northwind-model.png ../modules/2-modelling/lessons/3-identifying-nodes/images/complete-northwind-model.png
```

Then update the lesson files to replace the `// TODO` comments with the actual image references.
