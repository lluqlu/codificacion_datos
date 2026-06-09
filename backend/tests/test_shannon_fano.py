import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.domain.shannon_fano import (
    generate_shannon_fano_codes,
    encode_text,
    decode_text,
    build_symbol_codes,
)
from app.domain.frequencies import calculate_frequencies


def test_generates_codes_for_all_symbols():
    freqs = calculate_frequencies("abracadabra")
    codes = generate_shannon_fano_codes(freqs)
    for item in freqs:
        assert item["symbol"] in codes


def test_encode_decode_roundtrip():
    text = "hello world"
    freqs = calculate_frequencies(text)
    codes = generate_shannon_fano_codes(freqs)
    encoded = encode_text(text, codes)
    decoded = decode_text(encoded, codes)
    assert decoded == text


def test_single_symbol():
    freqs = calculate_frequencies("aaaa")
    codes = generate_shannon_fano_codes(freqs)
    assert "a" in codes
    encoded = encode_text("aaaa", codes)
    decoded = decode_text(encoded, codes)
    assert decoded == "aaaa"


def test_codes_are_prefix_free():
    freqs = calculate_frequencies("abracadabra")
    codes = generate_shannon_fano_codes(freqs)
    code_list = list(codes.values())
    for i, c1 in enumerate(code_list):
        for j, c2 in enumerate(code_list):
            if i != j:
                assert not c1.startswith(c2), f"{c1} starts with {c2}"


def test_build_symbol_codes_length():
    freqs = calculate_frequencies("test")
    codes = generate_shannon_fano_codes(freqs)
    symbol_codes = build_symbol_codes(codes)
    for sc in symbol_codes:
        assert sc.length == len(sc.code)
