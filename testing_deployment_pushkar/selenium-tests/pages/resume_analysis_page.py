from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


class ResumeAnalysisPage:

    URL = "http://localhost:3000/resume-analysis"

    FILE_INPUT = (
        By.ID,
        "resume-upload-input"
    )

    ANALYZE_BUTTON = (
        By.ID,
        "btn-analyze-resume"
    )

    ATS_SCORE = (
        By.XPATH,
        "//span[contains(text(), 'Resume ATS Score')]/ancestor::div[contains(@class, 'bg-white')]//h3"
    )

    ERROR_MESSAGE = (
        By.XPATH,
        "//p[contains(text(), 'Resume analysis failed')]/following-sibling::p"
    )

    ANALYSIS_AVAILABLE = (
        By.XPATH,
        "//span[contains(text(), 'Resume analysis available')]"
    )

    def __init__(self, driver):
        self.driver = driver
        self.wait = WebDriverWait(driver, 90)

    def open(self):
        self.driver.get(self.URL)
        return self

    def upload_resume(self, file_path):

        file_input = self.wait.until(
            EC.presence_of_element_located(
                self.FILE_INPUT
            )
        )

        file_input.send_keys(file_path)

    def click_analyze(self):

        button = self.wait.until(
            EC.element_to_be_clickable(
                self.ANALYZE_BUTTON
            )
        )

        button.click()

    def wait_for_analysis(self):

        # Wait until the button changes from:
        # "Analyzing Resume..."
        # back to:
        # "Run ATS Scan"

        self.wait.until(
            lambda driver:
            driver.find_element(
                *self.ANALYZE_BUTTON
            ).text.strip() == "Run ATS Scan"
        )

    def get_error_message(self):

        try:

            element = WebDriverWait(
                self.driver,
                2
            ).until(
                EC.visibility_of_element_located(
                    self.ERROR_MESSAGE
                )
            )

            return element.text.strip()

        except Exception:

            return None

    def wait_for_result(self):

        return self.wait.until(
            EC.visibility_of_element_located(
                self.ATS_SCORE
            )
        )

    def get_ats_score(self):

        score_element = self.wait_for_result()

        return score_element.text.strip()