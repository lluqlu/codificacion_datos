from ..domain import huffman, shannon_fano, frequencies as freq_module, metrics
from ..utils.bit_utils import text_to_bits


def encode(text: str) -> dict:
    freqs = freq_module.calculate_frequencies(text)
    original_bits = text_to_bits(text)
    entropy = metrics.calculate_entropy(freqs)

    huffman_codes, tree = huffman.generate_huffman_codes(freqs)
    huffman_encoded = huffman.encode_text(text, huffman_codes)
    huffman_bits = metrics.calculate_compressed_bits(text, huffman_codes)
    huffman_avg = metrics.calculate_average_length(huffman_codes, freqs)
    huffman_rate = metrics.calculate_compression_rate(original_bits, huffman_bits)
    huffman_efficiency = metrics.calculate_efficiency(huffman_avg, entropy)

    sf_codes = shannon_fano.generate_shannon_fano_codes(freqs)
    sf_encoded = shannon_fano.encode_text(text, sf_codes)
    sf_bits = metrics.calculate_compressed_bits(text, sf_codes)
    sf_avg = metrics.calculate_average_length(sf_codes, freqs)
    sf_rate = metrics.calculate_compression_rate(original_bits, sf_bits)
    sf_efficiency = metrics.calculate_efficiency(sf_avg, entropy)

    return {
        "original": {
            "text": text,
            "characters": len(text),
            "bits": original_bits,
        },
        "frequencies": freqs,
        "huffman": {
            "codes": [
                {"symbol": sc.symbol, "code": sc.code, "length": sc.length}
                for sc in huffman.build_symbol_codes(huffman_codes)
            ],
            "encoded": huffman_encoded,
            "compressedBits": huffman_bits,
            "averageLength": huffman_avg,
            "compressionRate": huffman_rate,
            "efficiency": huffman_efficiency,
            "tree": tree.to_dict(),
        },
        "shannonFano": {
            "codes": [
                {"symbol": sc.symbol, "code": sc.code, "length": sc.length}
                for sc in shannon_fano.build_symbol_codes(sf_codes)
            ],
            "encoded": sf_encoded,
            "compressedBits": sf_bits,
            "averageLength": sf_avg,
            "compressionRate": sf_rate,
            "efficiency": sf_efficiency,
        },
    }


def decode(algorithm: str, encoded: str, codes: list[dict]) -> str:
    code_map = {entry["symbol"]: entry["code"] for entry in codes}

    if algorithm == "huffman":
        return huffman.decode_text(encoded, code_map)
    return shannon_fano.decode_text(encoded, code_map)
