from voxpop_mbg.clean import basic_normalize, clean_text, dedupe_key, mask_sensitive


def test_clean_lowercases_and_strips():
    assert clean_text("  BAGUS Sekali  ") == "bagus sekali"


def test_clean_removes_urls_and_mentions():
    cleaned = clean_text("cek https://example.com ya @user123 mantap")
    assert "http" not in cleaned
    assert "@user123" not in cleaned
    assert "mantap" in cleaned


def test_clean_normalizes_slang():
    cleaned = clean_text("ga setuju sm program ini")
    assert "tidak" in cleaned
    assert "sama" in cleaned


def test_clean_preserves_negation():
    cleaned = clean_text("makanan tidak layak")
    assert "tidak" in cleaned


def test_mask_sensitive_handles_email_and_phone():
    masked = mask_sensitive("hubungi a@b.com atau 0812-3456-7890")
    assert "a@b.com" not in masked
    assert "0812" not in masked


def test_mask_sensitive_handles_unicode_mentions():
    masked = mask_sensitive("@★gendiss_ halo")
    assert "gendiss" not in masked
    assert "halo" in masked


def test_dedupe_key_ignores_punctuation_and_case():
    assert dedupe_key(clean_text("Bagus!!!")) == dedupe_key(clean_text("bagus"))


def test_basic_normalize_collapses_whitespace():
    assert basic_normalize("  A   B  ") == "a b"
