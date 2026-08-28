from voxpop_mbg.clean import clean_text
from voxpop_mbg.label import weak_label
from voxpop_mbg.topics import assign_issue


def test_food_safety_wins_over_student_benefit():
    text = clean_text("anak saya keracunan makanan sekolah")
    sentiment, _ = weak_label(text)
    issue_id, _, hits = assign_issue(text, sentiment)
    assert issue_id == "food_safety"
    assert "keracunan" in hits


def test_makan_keyword_maps_to_food_quality():
    text = clean_text("program makan gratis ini bagus")
    sentiment, _ = weak_label(text)
    issue_id, _, hits = assign_issue(text, sentiment)
    assert issue_id == "food_quality"
    assert "makan" in hits


def test_budget_transparency_not_stolen_by_food_safety_generic_tokens():
    cases = [
        "pengawasan anggaran negara harus transparan",
        "sakit hati lihat dana triliunan dikorupsi",
        "anggaran dapur sekolah berapa juta",
    ]
    for raw in cases:
        text = clean_text(raw)
        sentiment, _ = weak_label(text)
        issue_id, _, _ = assign_issue(text, sentiment)
        assert issue_id == "budget_transparency", raw


def test_sick_child_without_core_terms_is_not_food_safety():
    text = clean_text("kasihan anak yang sakit tidak kebagian jatah")
    sentiment, _ = weak_label(text)
    issue_id, _, _ = assign_issue(text, sentiment)
    assert issue_id != "food_safety"


def test_core_food_safety_incident_terms_still_trigger_override():
    text = clean_text("makanan basi bikin muntah dan diare")
    sentiment, _ = weak_label(text)
    issue_id, _, hits = assign_issue(text, sentiment)
    assert issue_id == "food_safety"
    assert "muntah" in hits or "diare" in hits


# Leftover: "dapur umum di desa kami belum ada" ties dapur (food_safety) vs desa
# (regional_access); food_safety wins via ISSUE_TAXONOMY declaration order.
