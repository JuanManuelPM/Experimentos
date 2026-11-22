import importlib, json, pathlib, hashlib, numpy as np, soundfile as sf, sys
ROOT=pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT))
from modulation import evaluate_route
from synth import P, construct, bass, kick, SR, midi, TRACKS

def test_modulation_repeatability():
    beat=np.linspace(0,18,1000)
    for r in P['modulationRoutes']:
        assert np.array_equal(evaluate_route(r,beat),evaluate_route(r,beat))
        assert np.std(evaluate_route(r,beat))>0

def test_timbre_is_composite_and_parameter_sensitive():
    v=bass(40,.5,5.)
    assert np.sqrt(np.mean(v*v))>.02
    assert np.mean(np.abs(v-bass(40,.5,5.,variation=.7)))>.001
    assert np.std(kick())>.02

def test_stems_are_real_and_reconstruct_master():
    stems,master,stats=construct(4,start_bar=8)
    assert len(stems)==6
    assert all(np.std(s)>0.0001 for s in stems.values())
    assert max(abs(sum(stems.values())-master).flat)<2e-6
    assert np.max(np.abs(master))<=.901

def test_reopen_from_project_reproduces_samples():
    _,a,_=construct(4,start_bar=8)
    import synth
    importlib.reload(synth)
    _,b,_=synth.construct(4,start_bar=8)
    assert hashlib.sha256(a.tobytes()).hexdigest()==hashlib.sha256(b.tobytes()).hexdigest()

def test_modulation_ab_is_audibly_distinct_as_signal():
    _,a,_=construct(4,start_bar=8)
    _,b,_=construct(4,start_bar=8,override_mod=.08)
    assert np.mean(np.abs(a-b))>.00001

def test_project_has_real_development():
    assert len(P['sections'])>=5
    assert {s['name'] for s in P['sections']} >= {'ACTIVATION','CIRCUIT A','BROWNOUT','CIRCUIT B','POWER DOWN'}
