from dataclasses import dataclass, field
from typing import Optional


@dataclass
class TreeNode:
    symbol: Optional[str]
    frequency: int
    left: Optional["TreeNode"] = field(default=None)
    right: Optional["TreeNode"] = field(default=None)

    def __lt__(self, other: "TreeNode") -> bool:
        return self.frequency < other.frequency

    def to_dict(self) -> dict:
        return {
            "symbol": self.symbol,
            "frequency": self.frequency,
            "left": self.left.to_dict() if self.left else None,
            "right": self.right.to_dict() if self.right else None,
        }


@dataclass
class SymbolCode:
    symbol: str
    code: str
    length: int


@dataclass
class AlgorithmResult:
    codes: list[SymbolCode]
    encoded: str
    compressed_bits: int
    average_length: float
    compression_rate: float
    efficiency: float


@dataclass
class HuffmanResult(AlgorithmResult):
    tree: Optional[TreeNode] = None


@dataclass
class EncodeResponse:
    original_text: str
    characters: int
    bits: int
    frequencies: list[dict]
    huffman: HuffmanResult
    shannon_fano: AlgorithmResult
