"""Reusable phrase morphing engine, original CC0-compatible code.
Coordinates are relative seconds; velocities [0,1]. No random sample content.
"""

def transform(events, *, retrograde=False, invert_axis=None, transpose=0, stretch=1.0, duration_scale=1.0):
    """Pure transformation preserving an anchored phrase span and ordering.

    events: list of {'at': seconds, 'note': MIDI number, 'dur': seconds, 'vel': fraction}.
    Retrograde acts on note END positions to preserve a phrase's musical space.
    """
    if stretch <= 0 or duration_scale <= 0:
        raise ValueError('stretch and duration_scale must be positive')
    if not events:
        return []
    span = max(e['at'] + e['dur'] for e in events)
    transformed = []
    for e in events:
        at = span - e['at'] - e['dur'] if retrograde else e['at']
        pitch = 2 * invert_axis - e['note'] if invert_axis is not None else e['note']
        transformed.append({'at': round(at * stretch, 6),
                            'note': int(round(pitch + transpose)),
                            'dur': round(e['dur'] * stretch * duration_scale, 6),
                            'vel': float(e['vel'])})
    return sorted(transformed, key=lambda x: x['at'])


def interpolate_curve(points, t):
    """Smoothstep morph between ordered anchors, no instantaneous jumps."""
    import numpy as np
    p = np.asarray(points, dtype=float)
    x = np.asarray(t, dtype=float)
    i = np.maximum(0, np.minimum(np.searchsorted(p[:, 0], x, side='right') - 1, len(p)-2))
    a, b = p[i], p[i + 1]
    u = np.clip((x - a[:,0]) / np.maximum(1e-9, b[:,0]-a[:,0]), 0, 1)
    u = u*u*(3-2*u)
    return a[:,1] + u*(b[:,1]-a[:,1])
