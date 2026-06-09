import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.domain.metrics import (
    calculate_entropy,
    calculate_average_length,
    calculate_compressed_bits,
    calculate_compression_rate,
    calculate_efficiency,
)


FREQS = [
    {"symbol": "a", "frequency": 5},
    {"symbol": "b", "frequency": 3},
    {"symbol": "c", "frequency": 2},
]


def test_entropy_positive():
    entropy = calculate_entropy(FREQS)
    assert entropy > 0


def test_entropy_single_symbol():
    entropy = calculate_entropy([{"symbol": "a", "frequency": 10}])
    assert entropy == 0.0


def test_average_length():
    codes = {"a": "0", "b": "10", "c": "11"}
    avg = calculate_average_length(codes, FREQS)
    assert avg > 0


def test_compressed_bits():
    codes = {"a": "0", "b": "10", "c": "11"}
    bits = calculate_compressed_bits("aabc", codes)
    assert bits == 1 + 1 + 2 + 2


def test_compression_rate_reduces():
    rate = calculate_compression_rate(80, 32)
    assert rate == 60.0


def test_compression_rate_zero_original():
    rate = calculate_compression_rate(0, 10)
    assert rate == 0.0


def test_efficiency_between_zero_and_hundred():
    entropy = calculate_entropy(FREQS)
    codes = {"a": "0", "b": "10", "c": "11"}
    avg = calculate_average_length(codes, FREQS)
    eff = calculate_efficiency(avg, entropy)
    assert 0 < eff <= 100
