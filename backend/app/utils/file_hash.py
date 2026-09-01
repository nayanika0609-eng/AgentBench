import hashlib


class FileHash:

    @staticmethod
    def calculate(filepath: str):

        sha = hashlib.sha256()

        with open(filepath, "rb") as f:

            while chunk := f.read(8192):
                sha.update(chunk)

        return sha.hexdigest()