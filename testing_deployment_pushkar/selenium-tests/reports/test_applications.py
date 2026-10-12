from pages.discover_page import DiscoverPage
from pages.applications_page import ApplicationsPage


def test_applying_creates_application_entry(logged_in_driver):
    discover = DiscoverPage(logged_in_driver).open()
    discover.apply_current_job()

    import time
    time.sleep(1)

    applications = ApplicationsPage(logged_in_driver).open()
    assert applications.get_application_count() > 0


def test_new_application_has_applied_status(logged_in_driver):
    discover = DiscoverPage(logged_in_driver).open()
    discover.apply_current_job()

    import time
    time.sleep(1)

    applications = ApplicationsPage(logged_in_driver).open()
    status = applications.get_status_for_first()
    assert status is not None
    assert "applied" in status.lower()