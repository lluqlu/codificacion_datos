import math


def calculate_entropy(frequencies: list[dict]) -> float:
    total = sum(item["frequency"] for item in frequencies)
    entropy = 0.0
    for item in frequencies:
        p = item["frequency"] / total
        if p > 0:
            entropy -= p * math.log2(p)
    return entropy


def calculate_average_length(codes: dict[str, str], frequencies: list[dict]) -> float:
    total = sum(item["frequency"] for item in frequencies)
    freq_map = {item["symbol"]: item["frequency"] for item in frequencies}
    avg = sum((freq_map[s] / total) * len(c) for s, c in codes.items())
    return round(avg, 4)


def calculate_compressed_bits(text: str, codes: dict[str, str]) -> int:
    return sum(len(codes[char]) for char in text)


def calculate_compression_rate(original_bits: int, compressed_bits: int) -> float:
    if original_bits == 0:
        return 0.0
    return round((1 - compressed_bits / original_bits) * 100, 2)


def calculate_efficiency(average_length: float, entropy: float) -> float:
    if average_length == 0:
        return 0.0
    return round((entropy / average_length) * 100, 2)
