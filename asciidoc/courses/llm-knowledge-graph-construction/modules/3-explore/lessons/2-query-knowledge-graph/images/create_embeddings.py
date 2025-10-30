import ollama

ollama.embeddings(model='all-minilm', prompt='What is retrieval augmented generation?').embedding
ollama.embeddings(model='all-minilm', prompt='How do you use the Vector + Cypher retriever?').embedding
ollama.embeddings(model='all-minilm', prompt='Grounding in LLMs.').embedding