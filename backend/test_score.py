from app.evaluators.score import ScoreCalculator


calculator = ScoreCalculator()


results = {
    "semantic_similarity": 90,
    "keyword_score": 80,
    "readability_score": 85,
    "prompt_adherence": 100,
    "completeness_score": 90,
    "latency": 150,
    "json_valid": None,
}


score = calculator.calculate(results)

print("Overall score:", score)