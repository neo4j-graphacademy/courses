CREATE (s:Speaker {name: "Adam Cowley"})
SET s += {
  x_handle: "@adamcowley",
  bio: "Adam Cowley is a dedicated developer with a keen interest in data and graph databases. Serving as the Senior Developer Advocate at Neo4j, Adam produces educational content for GraphAcademy, Neo4j’s free, self-paced, online learning platform. His technical experience spans two decades, developing websites, mobile apps and mixed reality experiences for budding startups to the world’s biggest companies",
  company: "Neo4j"
}
CREATE (t:Talk {url: "/talk/3b9XHj1HBahP8KJ13uWVui"})
SET t += {
  description: "A gentle introduction to Generative AI and Large Language Models for front-end developers looking to build intelligent chatbots and applications. The workshop introduces you to LangChain, an Open Source framework for building AI Applications. You will also be introduced to some of the common pitfalls you will face when interacting with LLMs and how they can be overcome.",
  time: "11:35:00",
  title: "Generative AI for Front-end Developers"
}
MERGE (r:Room {
  name: "Main amphitheatre"
})
MERGE (t)-[:GIVEN_BY]->(s)
MERGE (t)-[:IN_ROOM]->(r)
