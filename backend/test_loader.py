from app.rag.loader import DocumentLoader
from app.rag.chunker import TextChunker

text = DocumentLoader.load(
    "uploads/ImpactPilot future scope.pdf"
)

chunks = TextChunker.chunk(text)

print("Chunks:", len(chunks))

for i, chunk in enumerate(chunks):

    print("=" * 50)

    print(i + 1)

    print(chunk[:300])