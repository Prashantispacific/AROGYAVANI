import os
import sys
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE

def build_presentation(output_path="AarogyaVani_Presentation.pptx"):
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # Executive Theme Colors
    BG_COLOR = RGBColor(11, 17, 32)        # Deep obsidian slate #0B1120
    CARD_BG = RGBColor(19, 29, 49)         # Elevated slate card #131D31
    CARD_BORDER = RGBColor(38, 56, 88)     # Refined border #263858
    
    TEXT_WHITE = RGBColor(255, 255, 255)
    TEXT_LIGHT = RGBColor(226, 232, 240)   # High-contrast readable off-white #E2E8F0
    TEXT_MUTED = RGBColor(148, 163, 184)   # Slate gray #94A3B8

    EMERALD = RGBColor(16, 185, 129)       # #10B981
    TEAL = RGBColor(6, 182, 212)           # #06B6D4
    BLUE = RGBColor(59, 130, 246)          # #3B82F6
    AMBER = RGBColor(245, 158, 11)         # #F59E0B
    ROSE = RGBColor(239, 68, 68)           # #EF4444
    INDIGO = RGBColor(99, 102, 241)        # #6366F1
    PURPLE = RGBColor(168, 85, 247)        # #A855F7

    def set_background(slide):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
        bg.fill.solid()
        bg.fill.fore_color.rgb = BG_COLOR
        bg.line.fill.background()
        return bg

    def add_header(slide, title, category="AAROGYAVANI  |  BIT N BUILD '26", subtitle=None, page_num=None):
        pill = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(0.42), Inches(3.6), Inches(0.32))
        pill.fill.solid()
        pill.fill.fore_color.rgb = RGBColor(18, 30, 52)
        pill.line.color.rgb = RGBColor(45, 68, 106)
        pill.line.width = Pt(1)
        tf_pill = pill.text_frame
        tf_pill.word_wrap = False
        tf_pill.vertical_anchor = MSO_ANCHOR.MIDDLE
        p = tf_pill.paragraphs[0]
        p.text = category.upper()
        p.font.size = Pt(9.5)
        p.font.bold = True
        p.font.color.rgb = TEAL
        p.font.name = "Segoe UI"
        p.alignment = PP_ALIGN.CENTER

        if page_num:
            num_pill = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(11.333), Inches(0.42), Inches(1.2), Inches(0.32))
            num_pill.fill.solid()
            num_pill.fill.fore_color.rgb = RGBColor(18, 30, 52)
            num_pill.line.color.rgb = RGBColor(45, 68, 106)
            num_pill.line.width = Pt(1)
            tf_num = num_pill.text_frame
            tf_num.word_wrap = False
            tf_num.vertical_anchor = MSO_ANCHOR.MIDDLE
            p_num = tf_num.paragraphs[0]
            p_num.text = f"{page_num:02d} / 12"
            p_num.font.size = Pt(10)
            p_num.font.bold = True
            p_num.font.color.rgb = TEXT_MUTED
            p_num.font.name = "Segoe UI"
            p_num.alignment = PP_ALIGN.CENTER

        t_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.85), Inches(11.733), Inches(0.55))
        tf_t = t_box.text_frame
        tf_t.word_wrap = True
        tf_t.margin_left = tf_t.margin_top = tf_t.margin_right = tf_t.margin_bottom = 0
        p_t = tf_t.paragraphs[0]
        p_t.text = title
        p_t.font.size = Pt(24)
        p_t.font.bold = True
        p_t.font.color.rgb = TEXT_WHITE
        p_t.font.name = "Segoe UI"

        if subtitle:
            s_box = slide.shapes.add_textbox(Inches(0.8), Inches(1.42), Inches(11.733), Inches(0.35))
            tf_s = s_box.text_frame
            tf_s.word_wrap = True
            tf_s.margin_left = tf_s.margin_top = tf_s.margin_right = tf_s.margin_bottom = 0
            p_s = tf_s.paragraphs[0]
            p_s.text = subtitle
            p_s.font.size = Pt(13)
            p_s.font.color.rgb = TEXT_MUTED
            p_s.font.name = "Segoe UI"

    def create_card_base(slide, left, top, width, height, accent_color=None, bg_color=CARD_BG, border_color=CARD_BORDER):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        card.fill.solid()
        card.fill.fore_color.rgb = bg_color
        card.line.color.rgb = border_color
        card.line.width = Pt(1.2)

        if accent_color:
            strip = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left + Inches(0.15), top, width - Inches(0.3), Inches(0.06))
            strip.fill.solid()
            strip.fill.fore_color.rgb = accent_color
            strip.line.fill.background()
        return card

    def add_bottom_pill(slide, left, top, width, text, color):
        bp = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, Inches(0.34))
        bp.fill.solid()
        bp.fill.fore_color.rgb = RGBColor(16, 26, 44)
        bp.line.color.rgb = color
        bp.line.width = Pt(1)
        tf_bp = bp.text_frame
        tf_bp.vertical_anchor = MSO_ANCHOR.MIDDLE
        p = tf_bp.paragraphs[0]
        p.text = text
        p.font.size = Pt(9.5)
        p.font.bold = True
        p.font.color.rgb = color
        p.alignment = PP_ALIGN.CENTER
        return bp

    # =========================================================================
    # SLIDE 1: HERO & TITLE (Clean, High-Impact Composition)
    # =========================================================================
    s1 = prs.slides.add_slide(blank_layout)
    set_background(s1)

    tag_shape = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(0.75), Inches(3.8), Inches(0.36))
    tag_shape.fill.solid()
    tag_shape.fill.fore_color.rgb = RGBColor(18, 30, 52)
    tag_shape.line.color.rgb = RGBColor(45, 68, 106)
    tf_tag = tag_shape.text_frame
    tf_tag.vertical_anchor = MSO_ANCHOR.MIDDLE
    p = tf_tag.paragraphs[0]
    p.text = "BIT N BUILD '26  •  HEALTHTECH TRACK"
    p.font.size = Pt(10.5)
    p.font.bold = True
    p.font.color.rgb = EMERALD
    p.font.name = "Segoe UI"
    p.alignment = PP_ALIGN.CENTER

    title_box = s1.shapes.add_textbox(Inches(0.8), Inches(1.3), Inches(11.7), Inches(0.9))
    tf = title_box.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = 0
    p = tf.paragraphs[0]
    p.text = "आरोग्यवाणी (AarogyaVani)"
    p.font.size = Pt(40)
    p.font.bold = True
    p.font.color.rgb = TEXT_WHITE
    p.font.name = "Segoe UI"

    sub_box = s1.shapes.add_textbox(Inches(0.8), Inches(2.25), Inches(11.7), Inches(0.45))
    tf = sub_box.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = 0
    p = tf.paragraphs[0]
    p.text = "Voice-First AI Clinical Triage & Referral Assistant for Rural Healthcare"
    p.font.size = Pt(20)
    p.font.bold = True
    p.font.color.rgb = TEAL
    p.font.name = "Segoe UI"

    desc_box = s1.shapes.add_textbox(Inches(0.8), Inches(2.8), Inches(11.7), Inches(0.6))
    tf = desc_box.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = 0
    p = tf.paragraphs[0]
    p.text = "Empowering 850M+ rural citizens and 1M+ frontline ASHA workers with instant spoken-symptom triage, deterministic emergency safety gates, and verified digital referrals."
    p.font.size = Pt(13.5)
    p.font.color.rgb = TEXT_LIGHT
    p.font.name = "Segoe UI"

    v_cards = [
        ("🎙️ Vernacular Voice-First", "Spoken symptoms in 5 regional Indian languages with natural, reassuring audio playback.", EMERALD, "5 LANGUAGES SUPPORTED"),
        ("🛡️ <100ms Deterministic Gate", "Rule-based emergency bypass eliminates LLM hallucination for critical life threats.", ROSE, "< 100MS LATENCY"),
        ("📋 ASHA Clinical Copilot", "Doorstep vitals logging, prescription OCR & verified PHC referral slips.", TEAL, "ABDM / NHM COMPLIANT")
    ]
    card_w = Inches(3.64)
    card_h = Inches(2.3)
    top_pos = Inches(3.7)

    for i, (ctitle, cdesc, ccolor, cpill) in enumerate(v_cards):
        left_pos = Inches(0.8 + i * 4.04)
        create_card_base(s1, left_pos, top_pos, card_w, card_h, ccolor)

        tb = s1.shapes.add_textbox(left_pos + Inches(0.25), top_pos + Inches(0.3), card_w - Inches(0.5), card_h - Inches(0.8))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = 0

        p = tf.paragraphs[0]
        p.text = ctitle
        p.font.size = Pt(16)
        p.font.bold = True
        p.font.color.rgb = ccolor
        p.font.name = "Segoe UI"
        p.space_after = Pt(10)

        p = tf.add_paragraph()
        p.text = cdesc
        p.font.size = Pt(12.5)
        p.font.color.rgb = TEXT_LIGHT
        p.font.name = "Segoe UI"

        add_bottom_pill(s1, left_pos + Inches(0.25), top_pos + Inches(1.8), Inches(2.2), cpill, ccolor)

    foot_card = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(6.3), Inches(11.733), Inches(0.55))
    foot_card.fill.solid()
    foot_card.fill.fore_color.rgb = RGBColor(18, 28, 48)
    foot_card.line.color.rgb = RGBColor(38, 58, 92)
    tf_foot = foot_card.text_frame
    tf_foot.vertical_anchor = MSO_ANCHOR.MIDDLE
    p = tf_foot.paragraphs[0]
    p.text = "Team LocalHost Boys (GDG HBTU): Prashant Gautam • Prathvi Goswami • Ankit Kumar • Love Gwal"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = TEXT_LIGHT
    p.font.name = "Segoe UI"
    p.alignment = PP_ALIGN.CENTER

    # =========================================================================
    # SLIDE 2: THE PROBLEM (High Impact Stat Cards)
    # =========================================================================
    s2 = prs.slides.add_slide(blank_layout)
    set_background(s2)
    add_header(s2, "The Problem: The Rural Indian Healthcare Trilemma", "GROUND REALITY & CLINICAL CONTEXT", 
               "Over 850 million rural citizens face an acute lack of timely, accessible medical triage.", 2)

    prob_cards = [
        ("1 : 25,000", "Extreme Doctor Scarcity", ROSE, [
            "25× worse than WHO benchmark (1:1,000)",
            "40+ km average travel to nearest hospital",
            "Delayed arrivals turn mild illness into critical sepsis"
        ], "CRITICAL SHORTAGE"),
        ("850M+", "Language & Literacy Barrier", AMBER, [
            "Typing medical symptoms fails low-literacy users",
            "Hundreds of vernacular dialects & colloquial terms",
            "Handwritten prescriptions frequently lost or illegible"
        ], "ACCESSIBILITY GAP"),
        ("1 Million+", "Overburdened ASHA Workers", TEAL, [
            "Backbone of rural health carries heavy paper registers",
            "Zero clinical triage decision-support at doorsteps",
            "Doctors receive unstructured, verbal referrals"
        ], "OPERATIONAL BOTTLENECK")
    ]

    card_w = Inches(3.64)
    card_h = Inches(4.7)
    top_pos = Inches(1.95)

    for i, (stat, title, color, bullets, pill_txt) in enumerate(prob_cards):
        left_pos = Inches(0.8 + i * 4.04)
        create_card_base(s2, left_pos, top_pos, card_w, card_h, color)

        tb = s2.shapes.add_textbox(left_pos + Inches(0.25), top_pos + Inches(0.3), card_w - Inches(0.5), card_h - Inches(0.6))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = 0

        p = tf.paragraphs[0]
        p.text = stat
        p.font.size = Pt(36)
        p.font.bold = True
        p.font.color.rgb = color
        p.font.name = "Segoe UI"

        p = tf.add_paragraph()
        p.text = title
        p.font.size = Pt(17)
        p.font.bold = True
        p.font.color.rgb = TEXT_WHITE
        p.font.name = "Segoe UI"
        p.space_after = Pt(18)

        for b in bullets:
            p = tf.add_paragraph()
            p.text = f"▸  {b}"
            p.font.size = Pt(13)
            p.font.color.rgb = TEXT_LIGHT
            p.font.name = "Segoe UI"
            p.space_after = Pt(12)

        add_bottom_pill(s2, left_pos + Inches(0.25), top_pos + Inches(4.0), Inches(2.2), pill_txt, color)

    # =========================================================================
    # SLIDE 3: THE SOLUTION (Dual Perspective: Simple vs Technical)
    # =========================================================================
    s3 = prs.slides.add_slide(blank_layout)
    set_background(s3)
    add_header(s3, "The Solution: What is AarogyaVani?", "INNOVATION & VALUE PROPOSITION", 
               "A dual-engine platform designed for rural simplicity and clinical-grade reliability.", 3)

    w_half = Inches(5.66)
    card_h = Inches(4.7)
    top_pos = Inches(1.95)

    create_card_base(s3, Inches(0.8), top_pos, w_half, card_h, EMERALD)
    tb = s3.shapes.add_textbox(Inches(1.15), top_pos + Inches(0.3), w_half - Inches(0.7), card_h - Inches(0.9))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = 0
    p = tf.paragraphs[0]
    p.text = "💡 For Patients & Community Health (Human-Centric)"
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = EMERALD
    p.space_after = Pt(16)

    sol_non_tech = [
        ("Speak Symptoms Naturally", "Press one microphone button and describe issues in mother tongue—zero typing."),
        ("5 Regional Indian Languages", "Native understanding of Hindi, Bengali, Telugu, Marathi, and English idioms."),
        ("Instant Life-Threat Alert", "Detects heart attacks, stroke signs, or severe trauma in <100ms with 108 hotline."),
        ("Spoken Voice Guidance", "Reads out clear home-care remedies and instructions so illiterate patients stay guided.")
    ]
    for h, d in sol_non_tech:
        p = tf.add_paragraph()
        p.text = f"✔  {h}:  "
        p.font.size = Pt(13.5)
        p.font.bold = True
        p.font.color.rgb = TEXT_WHITE
        run = p.add_run()
        run.text = d
        run.font.bold = False
        run.font.size = Pt(12)
        run.font.color.rgb = TEXT_LIGHT
        p.space_after = Pt(12)

    add_bottom_pill(s3, Inches(1.15), top_pos + Inches(4.0), Inches(3.2), "EMPOWERING 850M+ CITIZENS", EMERALD)

    create_card_base(s3, Inches(6.86), top_pos, w_half, card_h, BLUE)
    tb = s3.shapes.add_textbox(Inches(7.21), top_pos + Inches(0.3), w_half - Inches(0.7), card_h - Inches(0.9))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = 0
    p = tf.paragraphs[0]
    p.text = "⚡ For Technical Evaluators & Architects (High-Reliability)"
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = BLUE
    p.space_after = Pt(16)

    sol_tech = [
        ("Multi-Model Pipeline", "Sarvam Saaras v4 (ASR) + Gemini 2.5 Flash (Triage) + Sarvam Bulbul v3 (TTS)."),
        ("Zero-Hallucination Safety Gate", "Deterministic regex scans emergency keywords before LLM inference occurs."),
        ("Multimodal Prescription OCR", "Gemini 2.5 Vision digitizes handwritten slips with human-in-the-loop editing."),
        ("Zero PII Footprint", "Stateless, privacy-first design adhering to Ayushman Bharat Digital Mission (ABDM).")
    ]
    for h, d in sol_tech:
        p = tf.add_paragraph()
        p.text = f"⚡  {h}:  "
        p.font.size = Pt(13.5)
        p.font.bold = True
        p.font.color.rgb = TEXT_WHITE
        run = p.add_run()
        run.text = d
        run.font.bold = False
        run.font.size = Pt(12)
        run.font.color.rgb = TEXT_LIGHT
        p.space_after = Pt(12)

    add_bottom_pill(s3, Inches(7.21), top_pos + Inches(4.0), Inches(3.2), "SUB-SECOND MULTI-MODEL STACK", BLUE)

    # =========================================================================
    # SLIDE 4: DUAL PERSONA USER EXPERIENCE
    # =========================================================================
    s4 = prs.slides.add_slide(blank_layout)
    set_background(s4)
    add_header(s4, "Dual-Persona Interface: Citizen vs. ASHA Mode", "USER-CENTRIC CLINICAL WORKFLOW",
               "One unified platform serving both illiterate villagers and frontline healthcare workers.", 4)

    create_card_base(s4, Inches(0.8), top_pos, w_half, card_h, TEAL)
    tb = s4.shapes.add_textbox(Inches(1.15), top_pos + Inches(0.3), w_half - Inches(0.7), card_h - Inches(0.9))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = 0
    p = tf.paragraphs[0]
    p.text = "👤 Citizen / Patient Mode (मरीज़)"
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = TEAL
    p.space_after = Pt(16)

    citizen_pts = [
        ("Target User", "Rural villagers, elderly patients, low-literacy citizens seeking home triage."),
        ("Effortless Intake", "1-tap audio record button or visual touch body map (Head, Chest, Stomach)."),
        ("Traffic-Light Result", "Clear Red, Yellow, or Green status badge with plain-language explanation."),
        ("Spoken Guidance", "Plays friendly audio advice in native tongue—no reading required.")
    ]
    for h, d in citizen_pts:
        p = tf.add_paragraph()
        p.text = f"▸  {h}:  "
        p.font.size = Pt(13.5)
        p.font.bold = True
        p.font.color.rgb = TEXT_WHITE
        run = p.add_run()
        run.text = d
        run.font.bold = False
        run.font.size = Pt(12)
        run.font.color.rgb = TEXT_LIGHT
        p.space_after = Pt(12)

    add_bottom_pill(s4, Inches(1.15), top_pos + Inches(4.0), Inches(4.6), "✨ IMPACT: CUTS 75% UNNECESSARY HOSPITAL TRAVEL", TEAL)

    create_card_base(s4, Inches(6.86), top_pos, w_half, card_h, INDIGO)
    tb = s4.shapes.add_textbox(Inches(7.21), top_pos + Inches(0.3), w_half - Inches(0.7), card_h - Inches(0.9))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = 0
    p = tf.paragraphs[0]
    p.text = "👩‍⚕️ ASHA Health Worker Mode (आशा)"
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = INDIGO
    p.space_after = Pt(16)

    asha_pts = [
        ("Target User", "Accredited Social Health Activists conducting home visits and screening rounds."),
        ("Vitals & History", "Record Blood Pressure, SpO2, Pulse, Temperature, and patient demographics."),
        ("Referral Slips", "Generates official, formatted PHC referral card with ASHA verification badge."),
        ("Offline-First Flow", "Logs beneficiary visits locally on mobile device and syncs when back online.")
    ]
    for h, d in asha_pts:
        p = tf.add_paragraph()
        p.text = f"▸  {h}:  "
        p.font.size = Pt(13.5)
        p.font.bold = True
        p.font.color.rgb = TEXT_WHITE
        run = p.add_run()
        run.text = d
        run.font.bold = False
        run.font.size = Pt(12)
        run.font.color.rgb = TEXT_LIGHT
        p.space_after = Pt(12)

    add_bottom_pill(s4, Inches(7.21), top_pos + Inches(4.0), Inches(4.6), "✨ IMPACT: SAVES 4+ HOURS DAILY IN MANUAL LOGGING", INDIGO)

    # =========================================================================
    # SLIDE 5: END-TO-END SYSTEM FLOW (Visual 4-Stage Horizontal Pipeline)
    # =========================================================================
    s5 = prs.slides.add_slide(blank_layout)
    set_background(s5)
    add_header(s5, "End-to-End System Flow: From Voice Note to Referral", "THE CLINICAL PIPELINE",
               "A 4-stage pipeline combining deterministic instant safety with multimodal intelligence.", 5)

    stages = [
        ("STEP 01", "Multimodal Intake", TEAL, [
            "Voice input in 5 languages",
            "Touch body-part map",
            "Prescription photo scan",
            "Clinical vitals logging"
        ], "MULTIMODAL INTAKE"),
        ("STEP 02", "Deterministic Gate", ROSE, [
            "<100ms Regex evaluation",
            "15+ lethal red-flags checked",
            "Zero LLM latency/hallucination",
            "Direct 108 Emergency lock"
        ], "< 100MS FAILSAFE"),
        ("STEP 03", "AI Risk Triage", AMBER, [
            "Gemini 2.5 Flash reasoning",
            "WHO IMNCI triage protocol",
            "Stratified: Red/Yellow/Green",
            "Explainable clinical rationale"
        ], "WHO IMNCI ENGINE"),
        ("STEP 04", "Vernacular Action", EMERALD, [
            "Sarvam Bulbul TTS speech",
            "Dual-language display",
            "Printable PHC referral slip",
            "Actionable home-care steps"
        ], "VOICE & SLIP OUT")
    ]

    card_w = Inches(2.68)
    card_h = Inches(4.7)
    top_pos = Inches(1.95)

    for i, (step_num, title, color, bullets, pill_txt) in enumerate(stages):
        left_pos = Inches(0.8 + i * 3.02)
        create_card_base(s5, left_pos, top_pos, card_w, card_h, color)

        tb = s5.shapes.add_textbox(left_pos + Inches(0.2), top_pos + Inches(0.25), card_w - Inches(0.4), card_h - Inches(0.8))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = 0

        p = tf.paragraphs[0]
        p.text = step_num
        p.font.size = Pt(11)
        p.font.bold = True
        p.font.color.rgb = color
        p.font.name = "Segoe UI"
        p.space_after = Pt(4)

        p = tf.add_paragraph()
        p.text = title
        p.font.size = Pt(16)
        p.font.bold = True
        p.font.color.rgb = TEXT_WHITE
        p.font.name = "Segoe UI"
        p.space_after = Pt(18)

        for b in bullets:
            p = tf.add_paragraph()
            p.text = f"▸ {b}"
            p.font.size = Pt(12.5)
            p.font.color.rgb = TEXT_LIGHT
            p.font.name = "Segoe UI"
            p.space_after = Pt(12)

        add_bottom_pill(s5, left_pos + Inches(0.2), top_pos + Inches(4.0), card_w - Inches(0.4), pill_txt, color)

        if i < 3:
            arrow = s5.shapes.add_textbox(left_pos + card_w, top_pos + Inches(1.8), Inches(0.34), Inches(0.6))
            p_ar = arrow.text_frame.paragraphs[0]
            p_ar.text = "➔"
            p_ar.font.size = Pt(18)
            p_ar.font.bold = True
            p_ar.font.color.rgb = RGBColor(90, 120, 160)
            p_ar.alignment = PP_ALIGN.CENTER

    # =========================================================================
    # SLIDE 6: SYSTEM ARCHITECTURE & TECH STACK
    # =========================================================================
    s6 = prs.slides.add_slide(blank_layout)
    set_background(s6)
    add_header(s6, "Architectural Pipeline: Production-Ready Serverless Stack", "TECHNICAL SPECIFICATIONS",
               "Decoupled, edge-accelerated architecture built for 99.9% uptime and sub-second responses.", 6)

    arch_cards = [
        ("Frontend & Client Edge", TEAL, [
            ("Framework", "React 19, TypeScript, Vite PWA"),
            ("Styling", "Tailwind CSS, Lucide Icons"),
            ("Offline Cache", "IndexedDB / LocalStorage Cache"),
            ("Audio Capture", "Web MediaStream & Web Audio API")
        ], "EDGE PWA CLIENT"),
        ("Serverless API Gateway", BLUE, [
            ("Runtime", "Netlify Functions v2 (Node.js Edge)"),
            ("Security", "Server-side secret storage; zero leaks"),
            ("Failover Ladder", "Auto-switch between primary & backup"),
            ("CORS & Proxy", "Streaming audio proxy with rate limits")
        ], "ZERO-SECRET LEAK"),
        ("Multi-Model AI Engine", PURPLE, [
            ("Speech-to-Text", "Sarvam Saaras v4 ⇄ Gemini Audio"),
            ("Clinical Triage", "Google Gemini 2.5 Flash (JSON schema)"),
            ("Text-to-Speech", "Sarvam Bulbul v3 ⇄ Web Speech API"),
            ("Vision OCR", "Gemini 2.5 Flash Vision Document AI")
        ], "SUB-SECOND INFERENCE")
    ]

    card_w = Inches(3.64)
    card_h = Inches(4.7)
    top_pos = Inches(1.95)

    for i, (title, color, specs, pill_txt) in enumerate(arch_cards):
        left_pos = Inches(0.8 + i * 4.04)
        create_card_base(s6, left_pos, top_pos, card_w, card_h, color)

        tb = s6.shapes.add_textbox(left_pos + Inches(0.25), top_pos + Inches(0.3), card_w - Inches(0.5), card_h - Inches(0.8))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = 0

        p = tf.paragraphs[0]
        p.text = title
        p.font.size = Pt(17)
        p.font.bold = True
        p.font.color.rgb = color
        p.font.name = "Segoe UI"
        p.space_after = Pt(16)

        for label, val in specs:
            p = tf.add_paragraph()
            p.text = f"▸  {label}:  "
            p.font.size = Pt(13)
            p.font.bold = True
            p.font.color.rgb = TEXT_WHITE
            p.font.name = "Segoe UI"
            run = p.add_run()
            run.text = val
            run.font.bold = False
            run.font.size = Pt(12)
            run.font.color.rgb = TEXT_LIGHT
            p.space_after = Pt(10)

        add_bottom_pill(s6, left_pos + Inches(0.25), top_pos + Inches(4.0), Inches(2.5), pill_txt, color)

    # =========================================================================
    # SLIDE 7: DETERMINISTIC SAFETY GATES (<100MS)
    # =========================================================================
    s7 = prs.slides.add_slide(blank_layout)
    set_background(s7)
    add_header(s7, "Deterministic Safety Gates: Zero LLM Gambling in Emergencies", "CLINICAL RISK MITIGATION",
               "Why life-threatening symptoms never wait for or depend on probabilistic AI models.", 7)

    warn_banner = s7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.95), Inches(11.733), Inches(0.65))
    warn_banner.fill.solid()
    warn_banner.fill.fore_color.rgb = RGBColor(40, 16, 22)
    warn_banner.line.color.rgb = ROSE
    warn_banner.line.width = Pt(1.5)
    tf_wb = warn_banner.text_frame
    tf_wb.vertical_anchor = MSO_ANCHOR.MIDDLE
    p = tf_wb.paragraphs[0]
    p.text = "🚨 CLINICAL GOLD STANDARD: Any acute condition triggers an instant <100ms emergency protocol, bypassing LLM processing entirely."
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = RGBColor(254, 202, 202)
    p.alignment = PP_ALIGN.CENTER

    card_h = Inches(3.85)
    top_pos = Inches(2.8)

    create_card_base(s7, Inches(0.8), top_pos, w_half, card_h, ROSE)
    tb = s7.shapes.add_textbox(Inches(1.15), top_pos + Inches(0.25), w_half - Inches(0.7), card_h - Inches(0.8))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = 0
    p = tf.paragraphs[0]
    p.text = "🛑 Critical Danger Signs Detected"
    p.font.size = Pt(17)
    p.font.bold = True
    p.font.color.rgb = ROSE
    p.space_after = Pt(14)

    danger_signs = [
        ("Cardiac Emergencies", "Crushing chest pain, left-arm radiating pressure, cold sweating"),
        ("Stroke & Seizures", "Facial drooping, slurred speech, active convulsions, loss of consciousness"),
        ("Severe Hemorrhage", "Uncontrolled arterial bleeding, major compound fractures"),
        ("Pediatric Red Flags", "Infant high fever with extreme lethargy, inability to nurse")
    ]
    for h, d in danger_signs:
        p = tf.add_paragraph()
        p.text = f"•  {h}:  "
        p.font.size = Pt(13)
        p.font.bold = True
        p.font.color.rgb = TEXT_WHITE
        run = p.add_run()
        run.text = d
        run.font.bold = False
        run.font.size = Pt(12)
        run.font.color.rgb = TEXT_LIGHT
        p.font.name = "Segoe UI"
        p.space_after = Pt(10)

    add_bottom_pill(s7, Inches(1.15), top_pos + Inches(3.2), Inches(3.2), "IMMEDIATE 108 INTERVENTION", ROSE)

    create_card_base(s7, Inches(6.86), top_pos, w_half, card_h, TEAL)
    tb = s7.shapes.add_textbox(Inches(7.21), top_pos + Inches(0.25), w_half - Inches(0.7), card_h - Inches(0.8))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = 0
    p = tf.paragraphs[0]
    p.text = "⚡ Instant Fail-Safe Execution"
    p.font.size = Pt(17)
    p.font.bold = True
    p.font.color.rgb = TEAL
    p.space_after = Pt(14)

    failsafe_steps = [
        ("< 100ms Edge Execution", "Client-side regex scans transcript before any API request is sent."),
        ("Zero LLM Hallucination", "Completely eliminates risk of AI downplaying a life-threatening symptom."),
        ("One-Tap 108 Hotline", "Screen locks to urgent red modal with direct ambulance dialer button."),
        ("Loud Vernacular Audio", "Automatically plays calm, authoritative emergency first-aid advice.")
    ]
    for h, d in failsafe_steps:
        p = tf.add_paragraph()
        p.text = f"✔  {h}:  "
        p.font.size = Pt(13)
        p.font.bold = True
        p.font.color.rgb = TEXT_WHITE
        run = p.add_run()
        run.text = d
        run.font.bold = False
        run.font.size = Pt(12)
        run.font.color.rgb = TEXT_LIGHT
        p.font.name = "Segoe UI"
        p.space_after = Pt(10)

    add_bottom_pill(s7, Inches(7.21), top_pos + Inches(3.2), Inches(3.2), "ZERO PROBABILISTIC GAMBLE", TEAL)

    # =========================================================================
    # SLIDE 8: 3-TIER CLINICAL RISK STRATIFICATION
    # =========================================================================
    s8 = prs.slides.add_slide(blank_layout)
    set_background(s8)
    add_header(s8, "Clinical Risk Stratification: Red / Yellow / Green Framework", "WHO IMNCI & NHM TRIAGE TIERS",
               "Clear, actionable categories routing patients to the exact level of clinical care needed.", 8)

    triage_cards = [
        ("RED: EMERGENCY", ROSE, "Immediate Hospital / 108", "Action Window: Minutes Matter", [
            "Chest pain, stroke signs, severe hemorrhage",
            "Bypasses LLM directly via safety gate",
            "Locks UI to flashing emergency card",
            "Urges immediate transfer to District Hospital"
        ], "AMBULANCE / ER NOW"),
        ("YELLOW: ATTENTION", AMBER, "Visit PHC in 24–48 Hours", "Action Window: Sub-Acute", [
            "Persistent high fever >3 days, productive cough",
            "Analyzed by Gemini 2.5 Flash with vitals context",
            "Generates structured ASHA referral slip",
            "Provides warning signs that mandate earlier visit"
        ], "PHC VISIT IN 24-48H"),
        ("GREEN: ROUTINE", EMERALD, "Supportive Home Care", "Action Window: Self-Limiting", [
            "Common seasonal cold, mild headache, simple fatigue",
            "Provides safe, verified home remedies & hydration tips",
            "Reads clear instructions via native-language voice",
            "Instructs patient to re-triage if symptoms persist"
        ], "SAFE HOME RECOVERY")
    ]

    card_w = Inches(3.64)
    card_h = Inches(4.7)
    top_pos = Inches(1.95)

    for i, (badge_txt, color, action_h, window_txt, bullets, pill_txt) in enumerate(triage_cards):
        left_pos = Inches(0.8 + i * 4.04)
        create_card_base(s8, left_pos, top_pos, card_w, card_h, color)

        tb = s8.shapes.add_textbox(left_pos + Inches(0.25), top_pos + Inches(0.3), card_w - Inches(0.5), card_h - Inches(0.8))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = 0

        p = tf.paragraphs[0]
        p.text = badge_txt
        p.font.size = Pt(14)
        p.font.bold = True
        p.font.color.rgb = color
        p.font.name = "Segoe UI"

        p = tf.add_paragraph()
        p.text = action_h
        p.font.size = Pt(17)
        p.font.bold = True
        p.font.color.rgb = TEXT_WHITE
        p.font.name = "Segoe UI"

        p = tf.add_paragraph()
        p.text = window_txt
        p.font.size = Pt(12)
        p.font.bold = True
        p.font.color.rgb = color
        p.font.name = "Segoe UI"
        p.space_after = Pt(16)

        for b in bullets:
            p = tf.add_paragraph()
            p.text = f"▸  {b}"
            p.font.size = Pt(12.5)
            p.font.color.rgb = TEXT_LIGHT
            p.font.name = "Segoe UI"
            p.space_after = Pt(10)

        add_bottom_pill(s8, left_pos + Inches(0.25), top_pos + Inches(4.0), Inches(2.4), pill_txt, color)

    # =========================================================================
    # SLIDE 9: VERNACULAR INCLUSION & ACCESSIBILITY
    # =========================================================================
    s9 = prs.slides.add_slide(blank_layout)
    set_background(s9)
    add_header(s9, "Vernacular Localization & Low-Literacy Inclusivity", "BRIDGING THE DIGITAL DIVIDE",
               "Designed from the ground up for rural India's linguistic diversity and low-literacy users.", 9)

    v_features = [
        ("5 Major Languages", EMERALD, [
            ("Hindi (Default)", "Full Hindi interface and Devanagari voice out"),
            ("Regional Support", "English, Bengali, Telugu, and Marathi"),
            ("Instant Toggle", "Switch language anytime with 1 tap, zero reload"),
            ("Acoustic Tuning", "Tuned for colloquial idioms, slangs, and accents")
        ], "BHASHINI ALIGNED"),
        ("Visual Body-Part Map", TEAL, [
            ("Zero Typing Needed", "Touch head, chest, stomach, arms, or legs"),
            ("Elderly Friendly", "Large visual targets with high-contrast borders"),
            ("Multi-Region Select", "Select multiple affected zones simultaneously"),
            ("Context Enrichment", "Feeds anatomical location directly to triage AI")
        ], "ZERO-LITERACY BARRIER"),
        ("Voice-In / Voice-Out", BLUE, [
            ("Natural Speech ASR", "Powered by Sarvam Saaras v4 acoustic models"),
            ("Warm Indian TTS", "Sarvam Bulbul v3 sounds natural, not robotic"),
            ("Dual Readout", "Visual cards accompanied by clear audio playback"),
            ("Illiteracy Bridge", "Citizens get expert medical advice without reading")
        ], "NATURAL SPEECH VIVO")
    ]

    card_w = Inches(3.64)
    card_h = Inches(4.7)
    top_pos = Inches(1.95)

    for i, (title, color, items, pill_txt) in enumerate(v_features):
        left_pos = Inches(0.8 + i * 4.04)
        create_card_base(s9, left_pos, top_pos, card_w, card_h, color)

        tb = s9.shapes.add_textbox(left_pos + Inches(0.25), top_pos + Inches(0.3), card_w - Inches(0.5), card_h - Inches(0.8))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = 0

        p = tf.paragraphs[0]
        p.text = title
        p.font.size = Pt(18)
        p.font.bold = True
        p.font.color.rgb = color
        p.font.name = "Segoe UI"
        p.space_after = Pt(16)

        for h, d in items:
            p = tf.add_paragraph()
            p.text = f"•  {h}:  "
            p.font.size = Pt(13)
            p.font.bold = True
            p.font.color.rgb = TEXT_WHITE
            run = p.add_run()
            run.text = d
            run.font.bold = False
            run.font.size = Pt(11.5)
            run.font.color.rgb = TEXT_LIGHT
            p.space_after = Pt(10)

        add_bottom_pill(s9, left_pos + Inches(0.25), top_pos + Inches(4.0), Inches(2.4), pill_txt, color)

    # =========================================================================
    # SLIDE 10: MULTIMODAL PRESCRIPTION OCR
    # =========================================================================
    s10 = prs.slides.add_slide(blank_layout)
    set_background(s10)
    add_header(s10, "Multimodal Prescription OCR & Safety Screening", "COMPUTER VISION & DRUG SAFETY",
               "Translating illegible handwritten doctor prescriptions into safe, digital patient records.", 10)

    ocr_steps = [
        ("1. Vision Extraction", TEAL, [
            ("Camera Capture", "Snap photo of messy handwritten doctor paper slip"),
            ("Multimodal OCR", "Gemini 2.5 Flash Vision extracts medicines & doses"),
            ("Laser Scan UI", "Animated laser scanning line gives instant feedback"),
            ("Privacy Focus", "Images deleted immediately after OCR extraction")
        ], "GEMINI 2.5 VISION OCR"),
        ("2. Safety Screening", AMBER, [
            ("Contraindications", "Cross-checks medicines for dangerous interactions"),
            ("Dosage Verification", "Flags abnormal dosages or missing frequency terms"),
            ("Overdose Check", "Prevents duplicate medications across old slips"),
            ("Warning Badges", "Displays clear yellow/red medication hazard alerts")
        ], "DRUG SAFETY CHECK"),
        ("3. Human Verification", EMERALD, [
            ("Editable Form", "Extracted drugs are placed into structured fields"),
            ("ASHA Confirmation", "Health worker confirms or adjusts dosage on screen"),
            ("Beneficiary Sync", "Verified list attaches to patient referral record"),
            ("ABDM Ready", "Formatted cleanly for digital health locker sync")
        ], "HUMAN-IN-THE-LOOP")
    ]

    card_w = Inches(3.64)
    card_h = Inches(4.7)
    top_pos = Inches(1.95)

    for i, (title, color, items, pill_txt) in enumerate(ocr_steps):
        left_pos = Inches(0.8 + i * 4.04)
        create_card_base(s10, left_pos, top_pos, card_w, card_h, color)

        tb = s10.shapes.add_textbox(left_pos + Inches(0.25), top_pos + Inches(0.3), card_w - Inches(0.5), card_h - Inches(0.8))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = 0

        p = tf.paragraphs[0]
        p.text = title
        p.font.size = Pt(18)
        p.font.bold = True
        p.font.color.rgb = color
        p.font.name = "Segoe UI"
        p.space_after = Pt(16)

        for h, d in items:
            p = tf.add_paragraph()
            p.text = f"•  {h}:  "
            p.font.size = Pt(13)
            p.font.bold = True
            p.font.color.rgb = TEXT_WHITE
            run = p.add_run()
            run.text = d
            run.font.bold = False
            run.font.size = Pt(11.5)
            run.font.color.rgb = TEXT_LIGHT
            p.space_after = Pt(10)

        add_bottom_pill(s10, left_pos + Inches(0.25), top_pos + Inches(4.0), Inches(2.4), pill_txt, color)

    # =========================================================================
    # SLIDE 11: CLINICAL IMPACT & GOVERNMENT ALIGNMENT
    # =========================================================================
    s11 = prs.slides.add_slide(blank_layout)
    set_background(s11)
    add_header(s11, "Real-World Clinical Impact & Government Alignment", "MEASURABLE OUTCOMES & POLICY SYNERGY",
               "Driving quantifiable healthcare efficiency while strictly aligning with national health frameworks.", 11)

    stat_w = Inches(2.68)
    stat_h = Inches(1.8)
    stat_top = Inches(1.95)

    stats = [
        ("< 100 ms", "Emergency Triage", ROSE, "Zero delay to dial 108 ambulance"),
        ("75%", "Travel Reduction", EMERALD, "Cuts unnecessary hospital visits"),
        ("100%", "Standardized Referrals", TEAL, "Structured slips for PHC doctors"),
        ("5+", "Regional Languages", BLUE, "True linguistic equity in Bharat")
    ]

    for i, (num, lbl, col, dsc) in enumerate(stats):
        left_pos = Inches(0.8 + i * 3.02)
        create_card_base(s11, left_pos, stat_top, stat_w, stat_h, col)

        tb = s11.shapes.add_textbox(left_pos + Inches(0.15), stat_top + Inches(0.2), stat_w - Inches(0.3), stat_h - Inches(0.3))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = 0

        p = tf.paragraphs[0]
        p.text = num
        p.font.size = Pt(30)
        p.font.bold = True
        p.font.color.rgb = col

        p = tf.add_paragraph()
        p.text = lbl
        p.font.size = Pt(14)
        p.font.bold = True
        p.font.color.rgb = TEXT_WHITE

        p = tf.add_paragraph()
        p.text = dsc
        p.font.size = Pt(11)
        p.font.color.rgb = TEXT_LIGHT

    align_top = Inches(3.95)
    align_h = Inches(2.7)
    create_card_base(s11, Inches(0.8), align_top, Inches(11.733), align_h, TEAL)

    tb = s11.shapes.add_textbox(Inches(1.15), align_top + Inches(0.25), Inches(11.0), align_h - Inches(0.4))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = 0

    p = tf.paragraphs[0]
    p.text = "🏛️ Alignment with Government of India Digital Missions"
    p.font.size = Pt(17)
    p.font.bold = True
    p.font.color.rgb = TEAL
    p.space_after = Pt(12)

    missions = [
        ("Ayushman Bharat Digital Mission (ABDM)", "Triage records format ready for 14-digit ABHA health accounts and PHR bundles."),
        ("Digital India Bhashini Mission", "Accelerating vernacular voice AI adoption in rural public service delivery."),
        ("National Health Mission (NHM)", "Directly empowers 1 Million+ frontline ASHA workers with doorstep decision support.")
    ]
    for m_title, m_desc in missions:
        p = tf.add_paragraph()
        p.text = f"✔  {m_title}:  "
        p.font.bold = True
        p.font.size = Pt(13.5)
        p.font.color.rgb = TEXT_WHITE
        run = p.add_run()
        run.text = m_desc
        run.font.bold = False
        run.font.size = Pt(12)
        run.font.color.rgb = TEXT_LIGHT
        p.space_after = Pt(8)

    # =========================================================================
    # SLIDE 12: ROADMAP, SCALABILITY & CONCLUSION
    # =========================================================================
    s12 = prs.slides.add_slide(blank_layout)
    set_background(s12)
    add_header(s12, "Roadmap, Scalability & Summary Takeaways", "THE PATH FORWARD",
               "From hackathon proof-of-concept to nationwide rural healthcare infrastructure.", 12)

    road_cards = [
        ("Near-Term (Next 3 Months)", TEAL, [
            ("Edge WASM Models", "Offline voice transcription for zero-signal village clinics"),
            ("WhatsApp PHC Bot", "Automated referral slip push to primary care doctors"),
            ("5 Additional Languages", "Tamil, Gujarati, Punjabi, Kannada, and Odia support")
        ], "OFFLINE-FIRST EDGE"),
        ("Long-Term Vision", INDIGO, [
            ("ABDM Sandbox Push", "Direct electronic health record sync via ABDM Gateway"),
            ("Outbreak Heatmaps", "Aggregated symptom cluster maps for District Health Officers"),
            ("Medicine Stock Alert", "Flags local PHC stockouts for essential antibiotics & ORS")
        ], "NATIONAL HEALTH GRID"),
        ("Summary for Evaluators", EMERALD, [
            ("Life-Saving Safety", "Deterministic <100ms emergency gates prevent clinical tragedy"),
            ("Production Architecture", "React 19, serverless edge, and multi-model AI fallbacks"),
            ("True Clinical Equity", "Brings specialized triage to 850M+ last-mile citizens")
        ], "MISSION-READY IMPACT")
    ]

    card_w = Inches(3.64)
    card_h = Inches(4.7)
    top_pos = Inches(1.95)

    for i, (title, color, items, pill_txt) in enumerate(road_cards):
        left_pos = Inches(0.8 + i * 4.04)
        create_card_base(s12, left_pos, top_pos, card_w, card_h, color)

        tb = s12.shapes.add_textbox(left_pos + Inches(0.25), top_pos + Inches(0.3), card_w - Inches(0.5), card_h - Inches(0.8))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = 0

        p = tf.paragraphs[0]
        p.text = title
        p.font.size = Pt(17)
        p.font.bold = True
        p.font.color.rgb = color
        p.font.name = "Segoe UI"
        p.space_after = Pt(16)

        for h, d in items:
            p = tf.add_paragraph()
            p.text = f"•  {h}:  "
            p.font.size = Pt(13)
            p.font.bold = True
            p.font.color.rgb = TEXT_WHITE
            run = p.add_run()
            run.text = d
            run.font.bold = False
            run.font.size = Pt(11.5)
            run.font.color.rgb = TEXT_LIGHT
            p.space_after = Pt(10)

        add_bottom_pill(s12, left_pos + Inches(0.25), top_pos + Inches(4.0), Inches(2.5), pill_txt, color)

    prs.save(output_path)
    print(f"Successfully built {output_path}")

if __name__ == "__main__":
    out_file = sys.argv[1] if len(sys.argv) > 1 else "AarogyaVani_Presentation.pptx"
    build_presentation(out_file)
