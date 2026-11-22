import importlib.util
from pathlib import Path
from PIL import Image
import hashlib, unittest
ROOT=Path('/mnt/data')
spec=importlib.util.spec_from_file_location('heat',ROOT/'el_calor_oculto_w003_render.py')
heat=importlib.util.module_from_spec(spec);spec.loader.exec_module(heat)

class HeatInfographicTests(unittest.TestCase):
    def test_shared_scene_unaffected_landmarks(self):
        a=heat.base_scene();b=heat.tree_scene()
        # Only the overlay may change pixels. These right-side facades are untouched.
        for x,y in [(410,200),(450,280),(380,300),(510,140),(300,130)]:
            self.assertEqual(a.getpixel((x*heat.S,y*heat.S)),b.getpixel((x*heat.S,y*heat.S)),(x,y))
        self.assertNotEqual(a.getpixel((60*heat.S,180*heat.S)),b.getpixel((60*heat.S,180*heat.S)))
    def test_native_image_dimensions(self):
        for name,size in [('A4_300dpi',(2480,3508)),('mobile',(780,4100))]:
            p=ROOT/f'el_calor_oculto_W003_09_{name}.png'
            with Image.open(p) as im:self.assertEqual(im.size,size)
    def test_two_claims_do_not_swap_units(self):
        source=(ROOT/'el_calor_oculto_w003_render.py').read_text()
        self.assertIn('1,6 °C',source)
        self.assertIn('>2×',source)
        self.assertIn('proporción que declaró confort',source)
        self.assertIn('Escena conceptual',source)
    def test_text_contrast_main(self):
        def lum(h):
            c=[int(h[i:i+2],16)/255 for i in (1,3,5)]
            c=[v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4 for v in c]
            return .2126*c[0]+.7152*c[1]+.0722*c[2]
        a,b=sorted((lum(heat.C['ink']),lum(heat.C['paper'])),reverse=True)
        self.assertGreaterEqual((a+.05)/(b+.05),7)

if __name__=='__main__': unittest.main(verbosity=2)