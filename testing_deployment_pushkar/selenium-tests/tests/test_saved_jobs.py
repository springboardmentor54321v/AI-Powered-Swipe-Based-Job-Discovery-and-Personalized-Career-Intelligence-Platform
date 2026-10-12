import time
from pages.discover_page import DiscoverPage
from pages.saved_jobs_page import SavedJobsPage


def test_saved_job_appears_on_saved_page(logged_in_driver):
    discover = DiscoverPage(logged_in_driver).open()
    discover.save_job()
    time.sleep(1)

    saved = SavedJobsPage(logged_in_driver).open()
    assert saved.get_saved_count() > 0


def test_unsave_removes_job_from_saved_page(logged_in_driver):
    discover = DiscoverPage(logged_in_driver).open()
    discover.save_job()
    time.sleep(1)

    saved = SavedJobsPage(logged_in_driver).open()
    count_before = saved.get_saved_count()

    saved.unsave_first_job()
    time.sleep(1)

    saved.open()
    count_after = saved.get_saved_count()
    assert count_after == count_before - 1


def test_apply_from_saved_page_marks_as_applied(logged_in_driver):
    discover = DiscoverPage(logged_in_driver).open()
    discover.save_job()
    time.sleep(1)

    saved = SavedJobsPage(logged_in_driver).open()
    saved.apply_from_first_card()
    time.sleep(1)

    assert saved.is_first_card_applied()