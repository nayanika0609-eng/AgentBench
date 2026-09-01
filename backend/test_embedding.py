from app.rag.embeddings import EmbeddingService

vector = EmbeddingService.embed_text(
    "REST API is stateless."
)

print(type(vector))

print(vector.shape)

print(vector[:10])