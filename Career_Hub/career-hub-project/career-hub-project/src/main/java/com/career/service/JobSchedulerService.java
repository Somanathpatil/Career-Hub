package com.career.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.career.repo.JobsRepo;

@Service
public class JobSchedulerService {

    private static final Logger log = LoggerFactory.getLogger(JobSchedulerService.class);

    @Autowired
    private JobFetcherService jobFetcherService;

    @Autowired
    private JobsRepo jobsRepo;

    /**
     * Daily automated job sync at 2:00 AM every day.
     * Cron expression: second, minute, hour, day-of-month, month, day-of-week
     */
    @Scheduled(cron = "0 0 2 * * ?")
    public void scheduleDailyJobSync() {
        log.info("[JobSchedulerService] Triggering automated daily job sync at 2:00 AM...");
        try {
            jobFetcherService.syncAllDailyJobs();
            log.info("[JobSchedulerService] Daily automated job sync finished successfully.");
        } catch (Exception e) {
            log.error("[JobSchedulerService] Error during automated daily job sync: {}", e.getMessage(), e);
        }
    }

    /**
     * Initial startup check: if the database has fewer than 3 jobs, fetch real jobs immediately.
     */
    @EventListener(ApplicationReadyEvent.class)
    public void onStartupJobCheck() {
        long count = jobsRepo.count();
        log.info("[JobSchedulerService] Application started. Current job count in database: {}", count);

        // Sanitize & upgrade any legacy demo jobs or example.com links
        try {
            jobFetcherService.cleanOrUpgradeLegacyDemoJobs();
        } catch (Exception e) {
            log.warn("[JobSchedulerService] Legacy job upgrade check error: {}", e.getMessage());
        }

        if (count < 6) {
            log.info("[JobSchedulerService] Initializing database with real jobs for React.js, Java, and Python...");
            try {
                jobFetcherService.syncAllDailyJobs();
            } catch (Exception e) {
                log.warn("[JobSchedulerService] Startup job sync skipped: {}", e.getMessage());
            }
        }
    }
}
