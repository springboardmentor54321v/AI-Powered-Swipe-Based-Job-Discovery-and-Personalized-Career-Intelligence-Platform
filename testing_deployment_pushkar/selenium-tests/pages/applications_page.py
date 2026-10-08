from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

BASE_URL = "http://localhost:3000"


class ApplicationsPage:
    """
    NOTE: selectors below are placeholders — update to match your
    actual ApplicationsPage.jsx.
    """

    def __init__(self, driver):
        self.driver = driver
        self.wait = WebDriverWait(driver, 10)

    def open(self):
        self.driver.get(f"{BASE_URL}/applications")
        return self

    def get_application_rows(self):
        return self.driver.find_elements(By.CSS_SELECTOR, "[data-testid='application-row']")

    def get_application_count(self):
        return len(self.get_application_rows())

    def get_status_for_first(self):
        rows = self.get_application_rows()
        if not rows:
            return None
        return rows[0].find_element(By.CSS_SELECTOR, "[data-testid='application-status']").text