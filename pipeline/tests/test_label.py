from voxpop_mbg.clean import clean_text
from voxpop_mbg.label import weak_label


def test_katanya_rumor_is_negative_not_sarcastic():
    text = clean_text("katanya semua makanannya beracun, sebarkan")
    label, _ = weak_label(text)
    assert label == "negative"


def test_sarcasm_terms_still_fire_with_negative_cue():
    text = clean_text("wkwk makanannya beracun banget")
    label, _ = weak_label(text)
    assert label == "sarcastic_or_ambiguous"
