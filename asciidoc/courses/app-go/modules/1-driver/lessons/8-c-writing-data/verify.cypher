MATCH (m:Movie {title: "Matrix, The"})
RETURN size((m)<-[:ACTED_IN]-()) > 4 AS outcome