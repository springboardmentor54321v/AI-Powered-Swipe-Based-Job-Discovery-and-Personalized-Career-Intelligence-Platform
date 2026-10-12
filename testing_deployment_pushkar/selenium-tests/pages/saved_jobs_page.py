from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

BASE_URL = "http://localhost:3000"


class SavedJobsPage:

    SAVED_CARDS = (By.CSS_SELECTOR, "[data-testid='saved-job-card']")
    EMPTY_STATE_HEADING = (By.XPATH, "//h2[contains(text(),'No saved jobs yet')]")
    NO_FILTER_MATCH_HEADING = (By.XPATH, "//h2[contains(text(),'No jobs match this filter')]")

    def __init__(self, driver):
        self.driver = driver
        self.wait = WebDriverWait(driver, 10)

    def open(self):
        self.driver.get(f"{BASE_URL}/saved")
        # Either cards or the empty-state heading should appear
        self.wait.until(
            lambda d: d.find_elements(*self.SAVED_CARDS)
            or d.find_elements(*self.EMPTY_STATE_HEADING)
        )
        return self

    def get_saved_job_cards(self):
        return self.driver.find_elements(*self.SAVED_CARDS)

    def get_saved_count(self):
        return len(self.get_saved_job_cards())

    def unsave_first_job(self):
        cards = self.get_saved_job_cards()
        if not cards:
            return self
        unsave_btn = cards[0].find_element(
            By.CSS_SELECTOR, "[aria-label='Remove job from saved']"
        )
        unsave_btn.click()
        return self

    def apply_from_first_card(self):
        cards = self.get_saved_job_cards()
        if not cards:
            return self
        apply_btn = cards[0].find_element(
            By.XPATH, ".//button[contains(., 'Apply') or contains(., 'Applied')]"
        )
        apply_btn.click()
        return self

    def is_first_card_applied(self):
        cards = self.get_saved_job_cards()
        if not cards:
            return False
        apply_btn = cards[0].find_element(
            By.XPATH, ".//button[contains(., 'Apply') or contains(., 'Applied')]"
        )
        return "Applied" in apply_btn.text

    def is_empty_state_shown(self):
        try:
            WebDriverWait(self.driver, 5).until(
                EC.visibility_of_element_located(self.EMPTY_STATE_HEADING)
            )
            return True
        except Exception:
            return False

    def is_filter_empty_state_shown(self):
        try:
            WebDriverWait(self.driver, 5).until(
                EC.visibility_of_element_located(self.NO_FILTER_MATCH_HEADING)
            )
            return True
        except Exception:
            return False