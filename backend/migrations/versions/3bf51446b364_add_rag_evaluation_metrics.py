from alembic import op
import sqlalchemy as sa


revision = "3bf51446b364"
down_revision = "be294c63e636"
branch_labels = None
depends_on = None


def upgrade():

    op.add_column(
        "evaluations",
        sa.Column(
            "context_relevance_score",
            sa.Float(),
            nullable=True
        )
    )

    op.add_column(
        "evaluations",
        sa.Column(
            "faithfulness_score",
            sa.Float(),
            nullable=True
        )
    )

    op.add_column(
        "evaluations",
        sa.Column(
            "answer_relevance_score",
            sa.Float(),
            nullable=True
        )
    )

    op.add_column(
        "evaluations",
        sa.Column(
            "citation_coverage_score",
            sa.Float(),
            nullable=True
        )
    )

    op.add_column(
        "evaluations",
        sa.Column(
            "rag_score",
            sa.Float(),
            nullable=True
        )
    )


def downgrade():

    op.drop_column(
        "evaluations",
        "rag_score"
    )

    op.drop_column(
        "evaluations",
        "citation_coverage_score"
    )

    op.drop_column(
        "evaluations",
        "answer_relevance_score"
    )

    op.drop_column(
        "evaluations",
        "faithfulness_score"
    )

    op.drop_column(
        "evaluations",
        "context_relevance_score"
    )