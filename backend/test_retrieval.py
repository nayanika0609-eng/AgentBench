from app.database.connection import SessionLocal
from app.rag.vector_store import VectorStore
from app.rag.retriever import Retriever

db = SessionLocal()

store = VectorStore(7)

retriever = Retriever(store)

results = retriever.retrieve(
    db,
    "What is the future scope of ImpactPilot?",
    top_k=5
)

for chunk in results:
    print("-" * 40)
    print(chunk.content)