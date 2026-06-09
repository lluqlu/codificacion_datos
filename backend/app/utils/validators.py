def validate_text(text: str) -> str | None:
    if not text or not text.strip():
        return "El texto no puede estar vacio"
    return None


def validate_encoded_string(encoded: str) -> str | None:
    if not encoded:
        return "El codigo binario no puede estar vacio"
    if any(c not in ("0", "1") for c in encoded):
        return "El codigo binario solo puede contener 0 y 1"
    return None


def validate_codes_table(codes: list[dict]) -> str | None:
    if not codes:
        return "La tabla de codigos no puede estar vacia"
    seen_codes = set()
    for entry in codes:
        code = entry.get("code", "")
        if code in seen_codes:
            return f"Codigo duplicado encontrado: {code}"
        seen_codes.add(code)
    return None


def validate_algorithm(algorithm: str) -> str | None:
    if algorithm not in ("huffman", "shannon_fano"):
        return f"Algoritmo no valido: {algorithm}. Use 'huffman' o 'shannon_fano'"
    return None
