import os

import faiss
import numpy as np


INDEX_DIR = "vector_indexes"
EMBEDDING_DIMENSION = 384


os.makedirs(
    INDEX_DIR,
    exist_ok=True
)


class VectorStore:

    def __init__(self, project_id: int):

        self.project_id = project_id

        self.index_path = os.path.join(
            INDEX_DIR,
            f"project_{project_id}.index"
        )

        self.mapping_path = os.path.join(
            INDEX_DIR,
            f"project_{project_id}.npy"
        )

        if os.path.exists(self.index_path):

            self.index = faiss.read_index(
                self.index_path
            )

            if os.path.exists(self.mapping_path):

                self.chunk_ids = np.load(
                    self.mapping_path,
                    allow_pickle=True
                ).tolist()

            else:

                self.chunk_ids = []

        else:

            self.index = faiss.IndexFlatL2(
                EMBEDDING_DIMENSION
            )

            self.chunk_ids = []

    def add(
        self,
        chunk_id,
        embedding
    ):

        vector = np.asarray(
            embedding,
            dtype="float32"
        ).reshape(1, -1)

        if vector.shape[1] != EMBEDDING_DIMENSION:

            raise ValueError(
                f"Expected embedding dimension "
                f"{EMBEDDING_DIMENSION}, "
                f"got {vector.shape[1]}"
            )

        self.index.add(vector)

        self.chunk_ids.append(
            int(chunk_id)
        )

    def search(
        self,
        embedding,
        top_k: int = 5
    ):

        if self.index.ntotal == 0:
            return []

        vector = np.asarray(
            embedding,
            dtype="float32"
        ).reshape(1, -1)

        if vector.shape[1] != EMBEDDING_DIMENSION:

            raise ValueError(
                f"Expected embedding dimension "
                f"{EMBEDDING_DIMENSION}, "
                f"got {vector.shape[1]}"
            )

        top_k = min(
            top_k,
            self.index.ntotal
        )

        distances, indices = self.index.search(
            vector,
            top_k
        )

        results = []

        for distance, index in zip(
            distances[0],
            indices[0]
        ):

            if 0 <= index < len(self.chunk_ids):

                results.append({

                    "chunk_id": self.chunk_ids[index],

                    "distance": float(distance)

                })

        return results

    def save(self):

        faiss.write_index(
            self.index,
            self.index_path
        )

        np.save(
            self.mapping_path,
            np.asarray(
                self.chunk_ids,
                dtype="int64"
            )
        )