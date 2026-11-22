"""MÁQUINA IMPERFECTA: deterministic and serializable musical modulation.
All clocks derive from absolute musical beat. No hidden synth state or hardware.
"""
from dataclasses import dataclass
import numpy as np

@dataclass(frozen=True)
class Modulation:
    kind: str
    frequency: float
    depth: float
    phase: float = 0.0
    offset: float = 0.0
    steps: tuple = ()
    seed: int = 0

    def evaluate(self, beat):
        b = np.asarray(beat, dtype=np.float64)
        phase = b * self.frequency + self.phase
        if self.kind == 'sine':
            value = np.sin(2 * np.pi * phase)
        elif self.kind == 'triangle':
            value = 2 * np.abs(2 * (phase % 1) - 1) - 1
        elif self.kind == 'step':
            if not self.steps:
                raise ValueError('step modulator requires steps')
            idx = np.floor(phase).astype(np.int64) % len(self.steps)
            value = np.asarray(self.steps)[idx]
        elif self.kind == 'sample_hold':
            idx = np.floor(phase).astype(np.int64)
            h = np.sin((idx + self.seed * 31) * 127.1 + 78.233) * 43758.5453
            value = 2 * (h - np.floor(h)) - 1
        else:
            raise ValueError(f'unknown modulation: {self.kind}')
        return self.offset + self.depth * value

def evaluate_route(route, beat):
    mod = Modulation(**{k:(tuple(v) if k=='steps' else v) for k,v in route.items() if k in Modulation.__dataclass_fields__})
    return mod.evaluate(beat)
