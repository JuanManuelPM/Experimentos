# MANO Web W001/09. Reproducible local Chromium/Playwright QA.
# Run: pip install playwright && playwright install chromium && python qa-browser.py
from pathlib import Path
from playwright.sync_api import sync_playwright

html = (Path(__file__).parent / "index.html").read_text(encoding="utf-8")
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    for width, height in [(320, 720), (390, 844), (768, 1024), (1440, 900)]:
        page = browser.new_page(viewport={"width": width, "height": height})
        errors = []
        page.on("pageerror", lambda error: errors.append(str(error)))
        page.set_content(html)
        assert page.evaluate("document.documentElement.scrollWidth <= innerWidth + 1")
        assert page.locator(".course:visible").count() == 6
        page.get_by_role("button", name="Técnicos").click()
        assert page.locator(".course:visible").count() == 2
        assert "2 oficios" in page.locator("#courseCount").inner_text().lower()
        page.locator(".course:visible").first.locator("summary").click()
        assert page.locator(".course:visible").first.get_attribute("open") is not None
        page.get_by_role("button", name="Todos").click()
        assert page.locator(".course:visible").count() == 6
        if width < 691:
            assert not page.locator("#navLinks").is_visible()
            page.locator("#menuToggle").click()
            assert page.locator("#navLinks").is_visible()
            page.get_by_role("link", name="Preguntas").click()
            assert not page.locator("#navLinks").is_visible()
        page.locator("#person").fill("Ada")
        page.locator("#trade").select_option("Cerámica")
        page.locator("#question").fill("¿Puedo probar antes de empezar?")
        page.locator('#inquiryForm button[type="submit"]').click()
        assert page.locator("#draftPreview").is_visible()
        assert "No se envió" in page.locator("#draftText").inner_text()
        assert "Cerámica" in page.locator("#draftText").inner_text()
        assert not errors, errors
        print(f"PASS {width}px: filters, details, responsive, menu, draft, JS")
        page.close()
    browser.close()
