import re


class TextChunker:

    @staticmethod
    def chunk(
        text: str,
        chunk_size: int = 900,
        overlap: int = 150,
    ) -> list[str]:

        if not text:
            return []

        # Normalize whitespace while preserving paragraph boundaries.
        text = text.replace("\r\n", "\n")
        text = text.replace("\r", "\n")

        paragraphs = [
            p.strip()
            for p in re.split(r"\n\s*\n+", text)
            if p.strip()
        ]

        chunks = []
        current = ""

        for paragraph in paragraphs:

            # If the paragraph itself is small enough,
            # keep it together.
            if len(paragraph) <= chunk_size:

                candidate = (
                    f"{current}\n\n{paragraph}"
                    if current
                    else paragraph
                )

                if len(candidate) <= chunk_size:
                    current = candidate
                    continue

                if current:
                    chunks.append(current)

                # Start a new chunk.
                current = paragraph
                continue

            # Very large paragraph:
            # split it on sentence boundaries first.
            sentences = re.split(
                r"(?<=[.!?])\s+",
                paragraph
            )

            for sentence in sentences:

                sentence = sentence.strip()

                if not sentence:
                    continue

                candidate = (
                    f"{current} {sentence}"
                    if current
                    else sentence
                )

                if len(candidate) <= chunk_size:
                    current = candidate
                else:

                    if current:
                        chunks.append(current)

                    # Sentence itself may be larger than
                    # the chunk limit.
                    if len(sentence) > chunk_size:

                        start = 0

                        while start < len(sentence):

                            end = start + chunk_size

                            piece = sentence[start:end]

                            chunks.append(piece)

                            start += (
                                chunk_size - overlap
                            )

                        current = ""

                    else:
                        current = sentence

        if current:
            chunks.append(current)

        # Add controlled overlap between chunks.
        final_chunks = []

        for i, chunk in enumerate(chunks):

            if i == 0:
                final_chunks.append(chunk)
                continue

            previous = chunks[i - 1]

            overlap_text = previous[-overlap:]

            combined = (
                overlap_text
                + "\n\n"
                + chunk
            )

            # Don't make chunks unnecessarily huge.
            if len(combined) <= chunk_size + overlap:
                final_chunks.append(combined)
            else:
                final_chunks.append(chunk)

        return final_chunks