from app.rag.embeddings import EmbeddingService
from app.rag.vector_store import VectorStore

store = VectorStore()

texts = [

    "REST API",

    "Machine Learning",

    "Software Engineering",

    "ImpactPilot handles requirement changes"

]

for i, text in enumerate(texts):

    store.add(
        i,
        EmbeddingService.embed_text(text)
    )

query = EmbeddingService.embed_text(
    "Requirement evolution"
)

results = store.search(query, top_k=2)

print(results)