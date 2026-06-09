from .models import SymbolCode


def _partition(symbols: list[dict]) -> int:
    total = sum(item["frequency"] for item in symbols)
    accumulated = 0
    best_diff = total
    best_index = 1

    for i in range(1, len(symbols)):
        accumulated += symbols[i - 1]["frequency"]
        diff = abs(total - 2 * accumulated)
        if diff < best_diff:
            best_diff = diff
            best_index = i

    return best_index


def _assign_codes(symbols: list[dict], codes: dict[str, str], prefix: str) -> None:
    if not symbols:
        return
    if len(symbols) == 1:
        codes[symbols[0]["symbol"]] = prefix if prefix else "0"
        return

    split = _partition(symbols)
    _assign_codes(symbols[:split], codes, prefix + "0")
    _assign_codes(symbols[split:], codes, prefix + "1")


def generate_shannon_fano_codes(frequencies: list[dict]) -> dict[str, str]:
    sorted_symbols = sorted(frequencies, key=lambda x: -x["frequency"])
    codes: dict[str, str] = {}
    _assign_codes(sorted_symbols, codes, "")
    return codes


def encode_text(text: str, codes: dict[str, str]) -> str:
    return "".join(codes[char] for char in text)


def decode_text(encoded: str, codes: dict[str, str]) -> str:
    reverse = {code: symbol for symbol, code in codes.items()}
    result = []
    buffer = ""
    for bit in encoded:
        buffer += bit
        if buffer in reverse:
            result.append(reverse[buffer])
            buffer = ""
    if buffer:
        raise ValueError("Invalid encoded string: incomplete code sequence")
    return "".join(result)


def build_symbol_codes(codes: dict[str, str]) -> list[SymbolCode]:
    return [SymbolCode(symbol=s, code=c, length=len(c)) for s, c in codes.items()]
