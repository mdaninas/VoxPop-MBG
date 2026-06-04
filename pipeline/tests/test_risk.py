from voxpop_mbg.config import risk_level_for_score
from voxpop_mbg.risk import score_comment


def test_supportive_comment_is_low_risk():
    result = score_comment("semoga program ini bermanfaat dan membantu")
    assert result.level == "low"
    assert result.score <= 29


def test_multi_cue_rumor_is_high_risk():
    result = score_comment("katanya semua makanannya beracun, sebarkan ke semua")
    assert result.score >= 60
    assert result.level in ("high", "needs_verification")
    assert any(reason["type"] == "rumor" for reason in result.reasons)


def test_score_is_clamped_between_0_and_100():
    result = score_comment(
        "katanya semua pasti beracun keracunan korupsi settingan viral sebarkan"
    )
    assert 0 <= result.score <= 100


def test_neutral_question_has_no_reasons_inflated():
    result = score_comment("kapan program ini mulai")
    assert result.score <= 29
    assert result.level == "low"


def test_risk_level_thresholds():
    assert risk_level_for_score(0) == "low"
    assert risk_level_for_score(29) == "low"
    assert risk_level_for_score(30) == "medium"
    assert risk_level_for_score(59) == "medium"
    assert risk_level_for_score(60) == "high"
    assert risk_level_for_score(79) == "high"
    assert risk_level_for_score(80) == "needs_verification"
    assert risk_level_for_score(100) == "needs_verification"
