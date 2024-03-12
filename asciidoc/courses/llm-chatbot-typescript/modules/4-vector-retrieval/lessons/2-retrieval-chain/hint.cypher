MATCH (s:Session {id: 'vector-retriever-1'})
RETURN s,
    [ (s)-[:HAS_RESPONSE]->(r)
        | [ r,
            [ (r)-[:CONTEXT]->(c) | c ]
        ]
    ]
