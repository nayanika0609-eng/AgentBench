import csv
import io


class CSVGenerator:

    @staticmethod
    def generate(report):

        output = io.StringIO()

        writer = csv.writer(output)

        writer.writerow([
            "Rank",
            "Model",
            "Overall Score",
            "Latency (ms)",
            "Readability",
            "Keyword Score",
            "Prompt Adherence",
            "Completeness",
            "Words",
            "Sentences",
            "Characters",
            "Response Length",
            "Tokens",
            "Cost"
        ])

        ranking = {
            item["model"]: item["rank"]
            for item in report["ranking"]
        }

        for model in report["models"]:

            writer.writerow([

                ranking.get(model["model_name"]),

                model["model_name"],

                model["overall_score"],

                model["latency"],

                model["readability_score"],

                model["keyword_score"],

                model["prompt_adherence"],

                model["completeness_score"],

                model["word_count"],

                model["sentence_count"],

                model["character_count"],

                model["response_length"],

                model["tokens_used"],

                model["cost"]

            ])

        return output.getvalue()