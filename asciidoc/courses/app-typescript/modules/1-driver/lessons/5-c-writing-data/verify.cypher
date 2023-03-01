MATCH (m:Movie {title: "Matrix, The"})
RETURN count { (m)<-[:ACTED_IN]-() } > 4 AS outcome