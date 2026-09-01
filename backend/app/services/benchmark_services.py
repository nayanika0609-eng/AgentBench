from sqlalchemy.orm import Session
import time

from app.models.benchmark_run import BenchmarkRun
from app.models.project import Project

from app.schemas.benchmark import BenchmarkCreate

from app.llms.dispatcher import run_model
from app.services.llm_service import save_response
from app.services.evaluation_services import EvaluationService

from app.rag.vector_store import VectorStore
from app.rag.retriever import Retriever
from app.rag.context_builder import ContextBuilder


def create_benchmark(
    db: Session,
    project_id: int,
    benchmark: BenchmarkCreate,
    owner_id: int,
):

    # ---------------------------------
    # Check project ownership
    # ---------------------------------

    project = (
        db.query(Project)
        .filter(
            Project.id == project_id,
            Project.owner_id == owner_id,
        )
        .first()
    )

    if not project:
        raise ValueError("Project not found")

    # ---------------------------------
    # Create benchmark
    # ---------------------------------

    new_benchmark = BenchmarkRun(
        project_id=project.id,
        prompt=benchmark.prompt,
        status="PENDING",
    )

    db.add(new_benchmark)
    db.commit()
    db.refresh(new_benchmark)

    evaluation_service = EvaluationService()

    # ---------------------------------
    # Prepare RAG context ONCE
    # ---------------------------------

    context = None
    source_count = 0
    rag_prompt = new_benchmark.prompt

    if benchmark.use_rag:

        vector_store = VectorStore(
            project_id
        )

        retriever = Retriever(
            vector_store
        )

        # Limit retrieved chunks to 3
        # to reduce prompt size and latency.
        chunks = retriever.retrieve(
            db=db,
            question=new_benchmark.prompt,
            top_k=min(benchmark.top_k, 3),
        )

        retrieved = []

        for rank, chunk in enumerate(
            chunks,
            start=1
        ):

            retrieved.append(
                {
                    "rank": rank,
                    "chunk_id": chunk["chunk_id"],
                    "document_id": chunk["document_id"],
                    "filename": chunk.get("filename"),
                    "chunk_index": chunk.get("chunk_index"),
                    "content": chunk["content"],
                }
            )

        context = ContextBuilder.build(
            retrieved
        )

        source_count = len(
            retrieved
        )

        rag_prompt = ContextBuilder.build_prompt(
            question=new_benchmark.prompt,
            context=context,
        )

    # ---------------------------------
    # Run every selected model
    # ---------------------------------

    for model in benchmark.models:

        start_time = time.time()

        answer = run_model(
        model,
        rag_prompt,
        )

        end_time = time.time()

        print(
       f"MODEL {model} ACTUAL TIME: "
       f"{end_time - start_time:.2f} seconds"
)

        latency_ms = (
        end_time - start_time
        ) * 1000
        # ---------------------------------
        # Save LLM response
        # ---------------------------------

        llm_response = save_response(
            db=db,
            benchmark_id=new_benchmark.id,
            model_name=model,
            response=answer,
            latency_ms=latency_ms,
        )

        # ---------------------------------
        # Evaluate response
        # ---------------------------------

        evaluation_service.evaluate_response(
            db=db,
            llm_response=llm_response,
            prompt=new_benchmark.prompt,
            expected_keywords=None,
            reference_answer=None,
            start_time=start_time,
            end_time=end_time,
            context=context,
            source_count=source_count,
        )

    # ---------------------------------
    # Mark benchmark completed
    # ---------------------------------

    new_benchmark.status = "COMPLETED"

    db.commit()
    db.refresh(new_benchmark)

    return new_benchmark


def get_project_benchmarks(
    db: Session,
    project_id: int,
    owner_id: int,
):

    project = (
        db.query(Project)
        .filter(
            Project.id == project_id,
            Project.owner_id == owner_id,
        )
        .first()
    )

    if not project:
        raise ValueError("Project not found")

    return (
        db.query(BenchmarkRun)
        .filter(
            BenchmarkRun.project_id == project_id
        )
        .all()
    )


def get_benchmark(
    db: Session,
    benchmark_id: int,
    owner_id: int,
):

    benchmark = (
        db.query(BenchmarkRun)
        .join(Project)
        .filter(
            BenchmarkRun.id == benchmark_id,
            Project.owner_id == owner_id,
        )
        .first()
    )

    if not benchmark:
        raise ValueError("Benchmark not found")

    return benchmark


def delete_benchmark(
    db: Session,
    benchmark_id: int,
    owner_id: int,
):

    benchmark = (
        db.query(BenchmarkRun)
        .join(Project)
        .filter(
            BenchmarkRun.id == benchmark_id,
            Project.owner_id == owner_id,
        )
        .first()
    )

    if not benchmark:
        raise ValueError("Benchmark not found")

    db.delete(benchmark)
    db.commit()