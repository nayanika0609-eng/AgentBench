from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT

styles = getSampleStyleSheet()

TITLE = ParagraphStyle(
    "Title",
    parent=styles["Heading1"],
    fontName="Helvetica-Bold",
    fontSize=28,
    textColor=colors.HexColor("#0F172A"),
    alignment=TA_CENTER,
    spaceAfter=20,
)

SUBTITLE = ParagraphStyle(
    "Subtitle",
    parent=styles["Heading2"],
    fontName="Helvetica-Bold",
    fontSize=18,
    textColor=colors.HexColor("#2563EB"),
    spaceAfter=10,
)

HEADING = ParagraphStyle(
    "Heading",
    parent=styles["Heading2"],
    fontName="Helvetica-Bold",
    fontSize=15,
    textColor=colors.HexColor("#1E3A8A"),
    spaceBefore=12,
    spaceAfter=8,
)

BODY = ParagraphStyle(
    "Body",
    parent=styles["BodyText"],
    fontName="Helvetica",
    fontSize=10,
    leading=18,
    textColor=colors.HexColor("#334155"),
)

CARD_TITLE = ParagraphStyle(
    "CardTitle",
    parent=styles["BodyText"],
    fontName="Helvetica-Bold",
    fontSize=11,
    textColor=colors.white,
    alignment=TA_CENTER,
)

CARD_VALUE = ParagraphStyle(
    "CardValue",
    parent=styles["BodyText"],
    fontName="Helvetica-Bold",
    fontSize=18,
    textColor=colors.white,
    alignment=TA_CENTER,
)