import heapq
from .models import TreeNode, SymbolCode


def build_huffman_tree(frequencies: list[dict]) -> TreeNode:
    heap = [TreeNode(symbol=item["symbol"], frequency=item["frequency"]) for item in frequencies]
    heapq.heapify(heap)

    if len(heap) == 1:
        node = heapq.heappop(heap)
        root = TreeNode(symbol=None, frequency=node.frequency, left=node, right=None)
        return root

    while len(heap) > 1:
        left = heapq.heappop(heap)
        right = heapq.heappop(heap)
        merged = TreeNode(
            symbol=None,
            frequency=left.frequency + right.frequency,
            left=left,
            right=right,
        )
        heapq.heappush(heap, merged)

    return heap[0]


def _generate_codes(node: TreeNode, prefix: str, codes: dict[str, str]) -> None:
    if node is None:
        return
    if node.symbol is not None:
        codes[node.symbol] = prefix if prefix else "0"
        return
    _generate_codes(node.left, prefix + "0", codes)
    _generate_codes(node.right, prefix + "1", codes)


def generate_huffman_codes(frequencies: list[dict]) -> tuple[dict[str, str], TreeNode]:
    tree = build_huffman_tree(frequencies)
    codes: dict[str, str] = {}
    _generate_codes(tree, "", codes)
    return codes, tree


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
