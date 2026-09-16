import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    KeepTogether,
    HRFlowable,
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_number(num_pages)
            super().showPage()
        super().save()

    def draw_page_number(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748B"))
        
        # Header line & text (pages > 1)
        if self._pageNumber > 1:
            self.setStrokeColor(colors.HexColor("#CBD5E1"))
            self.setLineWidth(0.5)
            self.line(36, 11 * 72 - 28, 8.5 * 72 - 36, 11 * 72 - 28)
            self.drawString(36, 11 * 72 - 24, "BreastCare AI - Complete Setup & Deployment Guide")
        
        # Footer line & text
        self.setStrokeColor(colors.HexColor("#CBD5E1"))
        self.setLineWidth(0.5)
        self.line(36, 32, 8.5 * 72 - 36, 32)
        
        self.drawString(36, 20, "Institutional Clinical Research & CAD Workstation")
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(8.5 * 72 - 36, 20, page_text)
        self.restoreState()

def create_setup_pdf(output_path="SETUP_GUIDE.pdf"):
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=38,
        bottomMargin=42
    )

    styles = getSampleStyleSheet()
    
    # Custom Palette
    C_PRIMARY = colors.HexColor("#0F172A")    # Slate 900
    C_TEAL = colors.HexColor("#0D9488")       # Teal 600
    C_INDIGO = colors.HexColor("#4338CA")     # Indigo 700
    C_TEXT = colors.HexColor("#334155")       # Slate 700
    C_MUTED = colors.HexColor("#64748B")      # Slate 500
    C_CODE_BG = colors.HexColor("#F8FAFC")    # Slate 50
    C_CODE_BORDER = colors.HexColor("#E2E8F0")# Slate 200
    C_ALERT_BG = colors.HexColor("#F0FDFA")   # Teal 50
    C_ALERT_BORDER = colors.HexColor("#99F6E4")# Teal 200

    title_style = ParagraphStyle(
        "DocTitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=20,
        leading=24,
        textColor=C_PRIMARY,
        spaceAfter=4,
    )
    
    subtitle_style = ParagraphStyle(
        "DocSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=10,
        leading=14,
        textColor=C_TEAL,
        spaceAfter=10,
    )

    h1_style = ParagraphStyle(
        "SectionH1",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=13,
        leading=17,
        textColor=C_PRIMARY,
        spaceBefore=12,
        spaceAfter=6,
        keepWithNext=True,
    )

    h2_style = ParagraphStyle(
        "SectionH2",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=10.5,
        leading=14,
        textColor=C_INDIGO,
        spaceBefore=8,
        spaceAfter=4,
        keepWithNext=True,
    )

    body_style = ParagraphStyle(
        "BodyTextCustom",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=13,
        textColor=C_TEXT,
        spaceAfter=4,
    )

    bullet_style = ParagraphStyle(
        "BulletCustom",
        parent=body_style,
        leftIndent=14,
        firstLineIndent=-10,
        spaceAfter=3,
    )

    code_style = ParagraphStyle(
        "CodeText",
        parent=styles["Normal"],
        fontName="Courier",
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#0F172A"),
    )

    table_header_style = ParagraphStyle(
        "TH",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=8.5,
        leading=11,
        textColor=colors.white,
    )

    table_body_style = ParagraphStyle(
        "TB",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8,
        leading=10.5,
        textColor=C_TEXT,
    )

    table_body_bold = ParagraphStyle(
        "TBBold",
        parent=table_body_style,
        fontName="Helvetica-Bold",
        textColor=C_PRIMARY,
    )

    def code_box(code_text):
        escaped = code_text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\n", "<br/>")
        p = Paragraph(escaped, code_style)
        t = Table([[p]], colWidths=[doc.width])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), C_CODE_BG),
            ('BOX', (0,0), (-1,-1), 0.75, C_CODE_BORDER),
            ('TOPPADDING', (0,0), (-1,-1), 5),
            ('BOTTOMPADDING', (0,0), (-1,-1), 5),
            ('LEFTPADDING', (0,0), (-1,-1), 8),
            ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ]))
        return t

    def alert_box(text, prefix="PRO TIP"):
        escaped = text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\n", "<br/>")
        p = Paragraph(f"<b>[{prefix}]</b> {escaped}", body_style)
        t = Table([[p]], colWidths=[doc.width])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), C_ALERT_BG),
            ('BOX', (0,0), (-1,-1), 0.75, C_ALERT_BORDER),
            ('TOPPADDING', (0,0), (-1,-1), 6),
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
            ('LEFTPADDING', (0,0), (-1,-1), 10),
            ('RIGHTPADDING', (0,0), (-1,-1), 10),
        ]))
        return t

    story = []

    # Title & Banner
    story.append(Paragraph("BreastCare AI - Complete Setup & Deployment Guide", title_style))
    story.append(Paragraph("Multi-Tier Clinical Decision Support & Breast Cancer CAD Detection Platform<br/>Next.js 16 Web Portal + Flask Pathology AI + FastAPI Mammography CAD + Neon Cloud Database", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=C_TEAL, spaceBefore=2, spaceAfter=8))

    # Section 1: Architecture Overview
    story.append(Paragraph("1. Project Architecture Overview", h1_style))
    arch_data = [
        [Paragraph("Service", table_header_style), Paragraph("Directory", table_header_style), Paragraph("Tech Stack", table_header_style), Paragraph("Port", table_header_style), Paragraph("Primary Role", table_header_style)],
        [Paragraph("Main Web Portal", table_body_bold), Paragraph(".", table_body_style), Paragraph("Next.js 16, React 19, Prisma, Tailwind", table_body_style), Paragraph("3000", table_body_bold), Paragraph("Patient & Doctor Dashboards, Auth, Scheduling", table_body_style)],
        [Paragraph("Pathology AI", table_body_bold), Paragraph("ai-service/", table_body_style), Paragraph("Python 3.12, Flask, TensorFlow, Waitress", table_body_style), Paragraph("5000", table_body_bold), Paragraph("Histopathology ResNet50 classification & Grad-CAM", table_body_style)],
        [Paragraph("Mammography CAD", table_body_bold), Paragraph("CBIS_DDSM_Segmentation-main/", table_body_style), Paragraph("Python 3.12, FastAPI, PyTorch, YOLOv8", table_body_style), Paragraph("8000", table_body_bold), Paragraph("Tissue isolation, mass segmentation & PDF export", table_body_style)],
    ]
    t_arch = Table(arch_data, colWidths=[105, 110, 130, 45, 150])
    t_arch.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), C_PRIMARY),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#F8FAFC")]),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_arch)
    story.append(Spacer(1, 8))

    # Section 2: Prerequisites
    story.append(Paragraph("2. Prerequisites for the New Laptop", h1_style))
    story.append(Paragraph("Only two software environments are required on the target computer:", body_style))
    story.append(Paragraph("&bull; <b>Node.js (v18 or v20+ LTS):</b> Download from https://nodejs.org and install with default settings.", bullet_style))
    story.append(Paragraph("&bull; <b>Python (v3.10, 3.11, or 3.12):</b> Download from https://python.org. <i>CRITICAL: Ensure 'Add Python to PATH' is checked during installation.</i>", bullet_style))
    story.append(Paragraph("&bull; <b>Database:</b> <u>NO LOCAL POSTGRESQL OR PGADMIN IS REQUIRED!</u> The project connects directly to Neon.tech Cloud Database, already configured and seeded.", bullet_style))
    story.append(Spacer(1, 6))

    # Section 3: Transferring Project
    story.append(Paragraph("3. Transferring Project to the New Laptop", h1_style))
    story.append(Paragraph("Copy the entire <b>BreastCare_AI-main</b> folder via USB PenDrive or ZIP archive.", body_style))
    story.append(alert_box("Before copying, you can delete or skip the 'node_modules/' folder. It contains 40,000+ tiny files (500MB+) that slow down USB copying. Running 'npm install' on the new laptop restores it in ~60 seconds.", "TIME-SAVING TIP"))
    story.append(Spacer(1, 4))
    story.append(Paragraph("<b>Essential Transfer Checklist:</b> Ensure that <code>.env</code>, <code>package.json</code>, <code>ai-service/requirements.txt</code>, and <code>CBIS_DDSM_Segmentation-main/requirements.txt</code> are present.", body_style))
    story.append(Spacer(1, 6))

    # Section 4: First-Time Setup
    story.append(Paragraph("4. First-Time Setup on the New Laptop (Step-by-Step)", h1_style))
    story.append(Paragraph("Paste the folder onto the new laptop (e.g., Desktop) and run the following in 3 separate terminals:", body_style))
    
    story.append(Paragraph("Step 4.1: Web Portal Dependencies (Terminal 1)", h2_style))
    story.append(code_box("cd BreastCare_AI-main\nnpm install\nnpx prisma generate"))
    story.append(Spacer(1, 4))

    story.append(Paragraph("Step 4.2: Pathology AI Service Dependencies (Terminal 2)", h2_style))
    story.append(code_box("cd BreastCare_AI-main\\ai-service\npip install -r requirements.txt"))
    story.append(Spacer(1, 4))

    story.append(Paragraph("Step 4.3: Mammography CAD Station Dependencies (Terminal 3)", h2_style))
    story.append(code_box("cd BreastCare_AI-main\\CBIS_DDSM_Segmentation-main\npip install -r requirements.txt"))
    story.append(Spacer(1, 6))

    # Section 5: Daily Workflow
    story.append(Paragraph("5. Running the Application (Daily Workflow)", h1_style))
    story.append(Paragraph("Whenever starting the platform, launch these 3 terminal commands:", body_style))
    
    workflow_data = [
        [Paragraph("Terminal", table_header_style), Paragraph("Working Directory", table_header_style), Paragraph("Command to Run", table_header_style), Paragraph("Port", table_header_style), Paragraph("Expected Output", table_header_style)],
        [Paragraph("Terminal 1", table_body_bold), Paragraph("BreastCare_AI-main", table_body_style), Paragraph("npm run dev", table_body_bold), Paragraph("3000", table_body_style), Paragraph("Ready in ~2s on http://localhost:3000", table_body_style)],
        [Paragraph("Terminal 2", table_body_bold), Paragraph("ai-service/", table_body_style), Paragraph("python app.py", table_body_bold), Paragraph("5000", table_body_style), Paragraph("[OK] Listening on: http://127.0.0.1:5000", table_body_style)],
        [Paragraph("Terminal 3", table_body_bold), Paragraph("CBIS_DDSM_Segmentation-main/", table_body_style), Paragraph("python main.py", table_body_bold), Paragraph("8000", table_body_style), Paragraph("Uvicorn running on http://0.0.0.0:8000", table_body_style)],
    ]
    t_work = Table(workflow_data, colWidths=[65, 130, 110, 45, 190])
    t_work.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), C_PRIMARY),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#F8FAFC")]),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_work)
    story.append(Spacer(1, 8))

    # Section 6: Demo Accounts
    story.append(Paragraph("6. Pre-Seeded Demo Accounts & Credentials", h1_style))
    story.append(Paragraph("Open <b>http://localhost:3000</b> and sign in using any seeded role (All share password: <b>Demo@123</b>):", body_style))
    
    cred_data = [
        [Paragraph("Role", table_header_style), Paragraph("Email Address", table_header_style), Paragraph("Password", table_header_style), Paragraph("Portal Features Accessible", table_header_style)],
        [Paragraph("Doctor", table_body_bold), Paragraph("doctor@demo.breastcare.ai", table_body_style), Paragraph("Demo@123", table_body_bold), Paragraph("Clinical case review, diagnostic report sign-off, patient queue", table_body_style)],
        [Paragraph("Radiologist", table_body_bold), Paragraph("radiologist@demo.breastcare.ai", table_body_style), Paragraph("Demo@123", table_body_bold), Paragraph("Interactive Mammography CAD workstation, heatmaps & PDF export", table_body_style)],
        [Paragraph("Patient", table_body_bold), Paragraph("patient@demo.breastcare.ai", table_body_style), Paragraph("Demo@123", table_body_bold), Paragraph("Wellness timelines, BMI calculator, personalized care-plan tasks", table_body_style)],
        [Paragraph("Hospital Admin", table_body_bold), Paragraph("hospital@demo.breastcare.ai", table_body_style), Paragraph("Demo@123", table_body_bold), Paragraph("Department workload analytics, hospital-wide capacity metrics", table_body_style)],
        [Paragraph("Super Admin", table_body_bold), Paragraph("admin@demo.breastcare.ai", table_body_style), Paragraph("Demo@123", table_body_bold), Paragraph("System governance, audit log directory, user role management", table_body_style)],
        [Paragraph("Researcher", table_body_bold), Paragraph("researcher@demo.breastcare.ai", table_body_style), Paragraph("Demo@123", table_body_bold), Paragraph("Anonymized demographic studies, sensitivity & ROC graphs", table_body_style)],
        [Paragraph("Field Worker", table_body_bold), Paragraph("fieldworker@demo.breastcare.ai", table_body_style), Paragraph("Demo@123", table_body_bold), Paragraph("Rural village screenings, community health outreach logs", table_body_style)],
    ]
    t_cred = Table(cred_data, colWidths=[80, 155, 65, 240])
    t_cred.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), C_PRIMARY),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#F8FAFC")]),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 3.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3.5),
    ]))
    story.append(t_cred)
    story.append(Spacer(1, 8))

    # Section 7: Troubleshooting
    story.append(Paragraph("7. Key Troubleshooting & Technical Fixes", h1_style))
    story.append(Paragraph("<b>1. 'File signature not found' on AI Service:</b> Permanently resolved. The service detects Git LFS pointer files and automatically activates Pretrained ResNet50 Transfer-Learning backbone without crashing.", bullet_style))
    story.append(Paragraph("<b>2. PowerShell Execution Policy Error:</b> If script execution is blocked on Windows, run once: <code>Set-ExecutionPolicy -Scope CurrentUser RemoteSigned</code>.", bullet_style))
    story.append(Paragraph("<b>3. Port Conflict (3000, 5000, 8000):</b> Terminate conflicting process via: <code>netstat -ano | findstr :PORT</code> then <code>taskkill /PID &lt;PID&gt; /F</code>.", bullet_style))
    story.append(Paragraph("<b>4. Missing .env file:</b> Windows hides dotfiles by default. In File Explorer, enable <i>View &gt; Hidden items</i> to verify <code>.env</code> is present in root.", bullet_style))

    # Build PDF
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"[SUCCESS] PDF Generated at: {os.path.abspath(output_path)}")

if __name__ == "__main__":
    out_file = sys.argv[1] if len(sys.argv) > 1 else "SETUP_GUIDE.pdf"
    create_setup_pdf(out_file)
