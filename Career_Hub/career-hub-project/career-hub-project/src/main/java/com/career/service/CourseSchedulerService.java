package com.career.service;

import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
public class CourseSchedulerService {

    private static final Logger log = LoggerFactory.getLogger(CourseSchedulerService.class);

    @Autowired
    private CourseFetcherService courseFetcherService;

    /**
     * Daily check at 3:00 AM: if 10 days have elapsed since the last course sync,
     * fetch fresh upskilling courses from YouTube and other platforms via Gemini AI.
     */
    @Scheduled(cron = "0 0 3 * * ?")
    public void scheduleTenDayCourseSync() {
        log.info("[CourseSchedulerService] Checking 10-day course sync schedule...");
        try {
            if (courseFetcherService.isSyncAllowed(false)) {
                log.info("[CourseSchedulerService] 10 days elapsed since last sync. Triggering fresh course sync...");
                Map<String, Object> res = courseFetcherService.syncUpskillingCourses(false);
                log.info("[CourseSchedulerService] 10-day course sync result: {}", res.get("message"));
            } else {
                Map<String, Object> status = courseFetcherService.getSyncStatus();
                log.info("[CourseSchedulerService] Course sync skipped. Next scheduled sync in {} days.",
                        status.get("nextSyncInDays"));
            }
        } catch (Exception e) {
            log.error("[CourseSchedulerService] Error during scheduled course sync check: {}", e.getMessage(), e);
        }
    }

    /**
     * Startup event: ensures courses are updated today on first boot or if 10-day cycle is due.
     */
    @EventListener(ApplicationReadyEvent.class)
    public void onStartupCourseCheck() {
        log.info("[CourseSchedulerService] Application ready. Verifying upskilling course status...");
        try {
            // Upgrade any legacy course records
            courseFetcherService.cleanOrUpgradeLegacyCourses();

            // If never synced before or 10-day interval reached, fetch today
            if (courseFetcherService.isSyncAllowed(false)) {
                log.info("[CourseSchedulerService] First-time setup or 10-day interval reached. Fetching upskilling courses today...");
                Map<String, Object> res = courseFetcherService.syncUpskillingCourses(false);
                log.info("[CourseSchedulerService] Startup course sync completed: {}", res.get("message"));
            } else {
                Map<String, Object> status = courseFetcherService.getSyncStatus();
                log.info("[CourseSchedulerService] Courses are up-to-date. Last synced: {}. Next sync in {} days.",
                        status.get("lastSync"), status.get("nextSyncInDays"));
            }
        } catch (Exception e) {
            log.warn("[CourseSchedulerService] Startup course check skipped: {}", e.getMessage());
        }
    }
}
