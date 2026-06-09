def calculate_frequencies(text: str) -> list[dict]:
    counts: dict[str, int] = {}
    for char in text:
        counts[char] = counts.get(char, 0) + 1
    return [
        {"symbol": symbol, "frequency": freq}
        for symbol, freq in sorted(counts.items(), key=lambda x: -x[1])
    ]
