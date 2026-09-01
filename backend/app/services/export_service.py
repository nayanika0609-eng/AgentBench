import json

from app.services.report_service import ReportService

from app.reports.csv_generator import CSVGenerator
from app.reports.pdf_generator import PDFGenerator


class ExportService:

    def __init__(
        self,
        db,
        owner_id: int,
    ):

        self.report_service = ReportService(db)

        self.owner_id = owner_id

    def get_report(
        self,
        benchmark_id,
    ):

        return self.report_service.generate_report(
            benchmark_id=benchmark_id,
            owner_id=self.owner_id,
        )

    def export_json(
        self,
        benchmark_id,
    ):

        report = self.get_report(
            benchmark_id
        )

        if report is None:
            return None

        return json.dumps(
            report,
            indent=4
        )

    def export_csv(
        self,
        benchmark_id,
    ):

        report = self.get_report(
            benchmark_id
        )

        if report is None:
            return None

        return CSVGenerator.generate(
            report
        )

    def export_pdf(
        self,
        benchmark_id,
    ):

        report = self.get_report(
            benchmark_id
        )

        if report is None:
            return None

        return PDFGenerator.generate(
            report
        )