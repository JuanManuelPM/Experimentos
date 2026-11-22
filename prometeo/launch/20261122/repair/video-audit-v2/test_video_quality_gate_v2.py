import pathlib, tempfile, unittest
from video_quality_gate_v2 import evaluate


def fixture(intent="fiction"):
    return {"identity":{"batchId":"video-w002-20261122","taskNumber":7},
            "design":{"intent":intent,"audienceEffect":"transfer conveys compassion", "representation":"authored 2D acting", "referenceCapability":"readable hands and gaze", "rejectedShortcut":"moving title cards", "alternativeTechnique":"held poses / keyframes", "firstSlice":{"status":"OBSERVED","evidence":"frame series at 0/2/4s","critique":"first passing test visually found hand overlap"},"causalActionTest":"independent blind retelling","sourceLedger":"PROVENANCE.json"},
            "media":{"status":"NOT_EXPORTED"}, "review":{"humanApproved":False,"professionalGrade":False}}

class VideoGateTest(unittest.TestCase):
    def test_manifest_without_media_is_not_approved(self):
        result=evaluate(fixture(),probe=False)
        self.assertEqual(result["status"],"INCOMPLETE_NO_FILM")
        self.assertIn("NO_VIDEO_EXPORT",result["warnings"])
        self.assertFalse(result["qualityClaimAllowed"])
    def test_rejects_slide_shortcut_without_real_first_slice(self):
        a=fixture();a["design"]["firstSlice"]={"status":"PLANNED"};a["design"]["alternativeTechnique"]=""
        result=evaluate(a,probe=False)
        self.assertIn("FIRST_SLICE_NOT_OBSERVED",result["errors"])
        self.assertIn("NO_REJECTED_SHORTCUT_OR_ALTERNATIVE",result["errors"])
    def test_no_public_without_binary(self):
        a=fixture();a["media"]={"status":"PUBLIC","file":"fake.mp4","publicUrl":"https://example.org/fake.mp4","frameSamples":[1,2,3]}
        self.assertIn("MEDIA_BINARY_UNAVAILABLE",evaluate(a,root=pathlib.Path(tempfile.gettempdir()),probe=False)["errors"])
    def test_forbids_self_approval(self):
        a=fixture();a["review"]["humanApproved"]=True
        self.assertIn("SELF_APPROVAL_FORBIDDEN",evaluate(a,probe=False)["errors"])
    def test_requires_documentary_provenance(self):
        a=fixture("documentary");a["design"]["sourceLedger"]=""
        self.assertIn("PROVENANCE_LEDGER_MISSING",evaluate(a,probe=False)["errors"])
    def test_requires_narrative_causality(self):
        a=fixture();a["design"]["causalActionTest"]=""
        self.assertIn("CAUSAL_ACTION_UNTESTED",evaluate(a,probe=False)["errors"])
    def test_rejects_wrong_batch_number(self):
        a=fixture();a["identity"]["taskNumber"]=12
        self.assertIn("IDENTITY_MISMATCH",evaluate(a,probe=False)["errors"])

if __name__=="__main__":unittest.main()
