package com.career.service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.career.dto.ExternalCourseDTO;
import com.career.entity.AppSetting;
import com.career.entity.Course;
import com.career.entity.CourseSkill;
import com.career.entity.Skills;
import com.career.repo.AppSettingRepo;
import com.career.repo.CourseRepo;
import com.career.repo.CourseSkillRepo;
import com.career.repo.SkillsRepo;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class CourseFetcherService {

    private static final Logger log = LoggerFactory.getLogger(CourseFetcherService.class);
    private static final String SETTING_LAST_SYNC = "course_last_sync_date";
    private static final int SYNC_INTERVAL_DAYS = 10;
    private static final DateTimeFormatter ISO_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    @Autowired
    private CourseRepo courseRepo;

    @Autowired
    private SkillsRepo skillsRepo;

    @Autowired
    private CourseSkillRepo courseSkillRepo;

    @Autowired
    private AppSettingRepo appSettingRepo;

    @Autowired
    private GeminiService geminiService;

    @Autowired
    private ObjectMapper objectMapper;

    /**
     * Check if 10 days have elapsed since the last sync.
     */
    public boolean isSyncAllowed(boolean force) {
        if (force) {
            return true;
        }
        LocalDateTime lastSync = getLastSyncDateTime();
        if (lastSync == null) {
            return true; // Never synced before
        }
        long daysPassed = ChronoUnit.DAYS.between(lastSync, LocalDateTime.now());
        return daysPassed >= SYNC_INTERVAL_DAYS;
    }

    public LocalDateTime getLastSyncDateTime() {
        Optional<AppSetting> setting = appSettingRepo.findById(SETTING_LAST_SYNC);
        if (setting.isPresent() && setting.get().getValue() != null && !setting.get().getValue().isBlank()) {
            try {
                return LocalDateTime.parse(setting.get().getValue(), ISO_FORMATTER);
            } catch (Exception e) {
                log.warn("Could not parse last sync date: {}", setting.get().getValue());
            }
        }
        return null;
    }

    public Map<String, Object> getSyncStatus() {
        Map<String, Object> status = new HashMap<>();
        LocalDateTime lastSync = getLastSyncDateTime();

        if (lastSync == null) {
            status.put("lastSync", null);
            status.put("daysSinceLastSync", null);
            status.put("nextSyncInDays", 0);
            status.put("canSync", true);
            status.put("message", "Upskilling courses have not been synced yet. Sync is available now.");
        } else {
            long daysPassed = ChronoUnit.DAYS.between(lastSync, LocalDateTime.now());
            long daysRemaining = Math.max(0, SYNC_INTERVAL_DAYS - daysPassed);
            boolean canSync = daysPassed >= SYNC_INTERVAL_DAYS;

            status.put("lastSync", lastSync.toString());
            status.put("daysSinceLastSync", daysPassed);
            status.put("nextSyncInDays", daysRemaining);
            status.put("canSync", canSync);
            status.put("intervalDays", SYNC_INTERVAL_DAYS);
            status.put("message", canSync
                    ? "10-day cycle completed. Ready for fresh course update!"
                    : "Courses up to date (10-day refresh cycle). Next scheduled sync in " + daysRemaining + " day(s).");
        }
        return status;
    }

    /**
     * Synchronize upskilling courses from YouTube, Coursera, Udemy using Gemini AI.
     * Enforces the 10-day cycle unless force=true.
     */
    @Transactional
    public Map<String, Object> syncUpskillingCourses(boolean force) {
        cleanOrUpgradeLegacyCourses();

        boolean allowed = isSyncAllowed(force);
        Map<String, Object> result = new HashMap<>();

        if (!allowed) {
            LocalDateTime lastSync = getLastSyncDateTime();
            long daysPassed = lastSync != null ? ChronoUnit.DAYS.between(lastSync, LocalDateTime.now()) : 0;
            long daysRemaining = SYNC_INTERVAL_DAYS - daysPassed;

            result.put("synced", false);
            result.put("message", "10-day cycle in effect. Last synced " + daysPassed + " day(s) ago. Next sync in " + daysRemaining + " day(s).");
            result.put("coursesTotal", courseRepo.count());
            result.put("status", getSyncStatus());
            log.info("Course sync skipped: 10-day cycle active ({} days remaining).", daysRemaining);
            return result;
        }

        log.info("Initiating 10-day upskilling course fetch via Gemini AI...");
        List<ExternalCourseDTO> externalCourses = fetchCoursesViaGemini();

        if (externalCourses.isEmpty()) {
            log.info("Gemini returned empty or was unreachable. Loading verified seed upskilling courses...");
            externalCourses.addAll(getCuratedSeedCourses());
        }

        int savedCount = 0;
        for (ExternalCourseDTO dto : externalCourses) {
            try {
                Course course = saveOrUpdateCourse(dto);
                if (course != null) {
                    savedCount++;
                }
            } catch (Exception e) {
                log.warn("Failed saving course {}: {}", dto.getTitle(), e.getMessage());
            }
        }

        // Record successful sync timestamp in MySQL
        LocalDateTime now = LocalDateTime.now();
        appSettingRepo.save(new AppSetting(SETTING_LAST_SYNC, now.format(ISO_FORMATTER)));

        result.put("synced", true);
        result.put("coursesAddedOrUpdated", savedCount);
        result.put("coursesTotal", courseRepo.count());
        result.put("lastSync", now.toString());
        result.put("nextSyncInDays", SYNC_INTERVAL_DAYS);
        result.put("message", "Successfully fetched and updated " + savedCount + " real upskilling courses! Next scheduled sync in 10 days.");
        result.put("status", getSyncStatus());

        log.info("Course sync completed successfully: {} courses processed. Next sync in 10 days.", savedCount);
        return result;
    }

    /**
     * Fetch real upskilling tutorials on YouTube and top platforms using Gemini AI.
     */
    private List<ExternalCourseDTO> fetchCoursesViaGemini() {
        String prompt = """
            You are a Technical Education and Upskilling Curator.
            Provide 14 to 18 authentic, highly rated upskilling courses and masterclasses on YouTube, Coursera, Udemy, and freeCodeCamp.
            Focus on practical developer upskilling for in-demand technologies:
            1. React.js & Modern Frontend (freeCodeCamp, Traversy Media, Chai aur Code)
            2. Java & Object Oriented Programming (Bro Code, Programming with Mosh, Telusko)
            3. Spring Boot 3 & Microservices (Telusko, Amigoscode, Java Guides)
            4. Python for Beginners & Full Stack (Programming with Mosh, freeCodeCamp)
            5. SQL & Database Administration (freeCodeCamp, Alex The Analyst)
            6. Modern JavaScript ES6+ (freeCodeCamp, SuperSimpleDev)
            7. Docker, Containers & DevOps (TechWorld with Nana)
            8. Git & GitHub Collaboration (freeCodeCamp, Kunal Kushwaha)
            9. Node.js & Express REST APIs (freeCodeCamp, John Smilga)
            10. Django / FastAPI Web Development (freeCodeCamp, Tech With Tim)
            11. AWS Cloud Practitioner & Cloud Architecture (freeCodeCamp, Stephane Maarek)

            For each course, return:
            - title: Clear, real course title (e.g. "React.js Full Course 2026 with Projects", "Java 17 & Spring Boot 3 Masterclass")
            - provider: Channel or platform name (e.g. "YouTube (freeCodeCamp)", "YouTube (Programming with Mosh)", "YouTube (Bro Code)", "YouTube (Telusko)", "Coursera", "Udemy")
            - url: Authentic working video/playlist URL on YouTube or official course URL (e.g. https://www.youtube.com/watch?v=bMknfKXIFA8, https://www.youtube.com/watch?v=A74TOX803D0, https://www.youtube.com/watch?v=5PdEmeopJVQ, https://www.youtube.com/watch?v=_uQrJ0TkZlc). CRITICAL: Do NOT output placeholder or generic 'example.com' or homepage URLs. Must be a specific video or playlist.
            - free: true for YouTube & freeCodeCamp, false for paid certifications
            - rating: Realistic rating between 4.5 and 4.9
            - duration: Realistic duration (e.g. "11 hours", "6 hours", "8.5 hours")
            - description: 1-2 sentences outlining the competencies taught
            - targetSkills: List of 1-3 matching skill names (e.g. ["React", "JavaScript"], ["Java", "Spring Boot"], ["Python", "Django"], ["SQL", "MySQL"], ["Docker"], ["Git"], ["AWS"])

            Output format:
            Strict JSON array of objects only. No markdown fences, no explanatory text.

            JSON Schema:
            [
              {
                "title": "string",
                "provider": "string",
                "url": "string",
                "free": true,
                "rating": 4.8,
                "duration": "string",
                "description": "string",
                "targetSkills": ["string"]
              }
            ]
            """;

        String response = geminiService.generateCareerGuidance(prompt);
        if (response == null || response.isBlank()) {
            return Collections.emptyList();
        }

        String cleanJson = response.trim();
        if (cleanJson.startsWith("```")) {
            cleanJson = cleanJson.replaceAll("(?s)^\\s*```(?:json)?|```\\s*$", "").trim();
        }

        try {
            List<ExternalCourseDTO> list = objectMapper.readValue(cleanJson, new TypeReference<List<ExternalCourseDTO>>() {});
            if (list != null) {
                for (ExternalCourseDTO dto : list) {
                    sanitizeCourseDTO(dto);
                }
                return list;
            }
        } catch (Exception e) {
            log.warn("Gemini course JSON parsing failed: {}", e.getMessage());
        }
        return Collections.emptyList();
    }

    private void sanitizeCourseDTO(ExternalCourseDTO dto) {
        if (dto.getFree() == null) {
            dto.setFree(true);
        }
        if (dto.getRating() == null || dto.getRating() < 1.0) {
            dto.setRating(4.8);
        }
        if (dto.getDuration() == null || dto.getDuration().isBlank()) {
            dto.setDuration("6 hours");
        }
        if (dto.getProvider() == null || dto.getProvider().isBlank()) {
            dto.setProvider("YouTube (freeCodeCamp)");
        }
        if (dto.getUrl() == null || dto.getUrl().contains("example.com") || dto.getUrl().equals("https://www.youtube.com/") || dto.getUrl().isBlank()) {
            dto.setUrl(buildFallbackCourseUrl(dto.getTitle()));
        }
    }

    private String buildFallbackCourseUrl(String title) {
        String query = (title != null && !title.isBlank() ? title : "Full Course").trim();
        try {
            return "https://www.youtube.com/results?search_query=" + URLEncoder.encode(query + " tutorial", StandardCharsets.UTF_8);
        } catch (Exception e) {
            return "https://www.youtube.com/watch?v=bMknfKXIFA8";
        }
    }

    /**
     * Persist course and automatically link to skills in CourseSkill.
     */
    private Course saveOrUpdateCourse(ExternalCourseDTO dto) {
        if (dto.getTitle() == null || dto.getTitle().isBlank()) {
            return null;
        }

        Optional<Course> existing = courseRepo.findByTitleIgnoreCase(dto.getTitle().trim());
        Course course = existing.orElseGet(Course::new);

        course.setTitle(dto.getTitle().trim());
        course.setProvider(dto.getProvider() != null ? dto.getProvider() : "YouTube");
        course.setUrl(dto.getUrl());
        course.setFree(dto.getFree() != null ? dto.getFree() : Boolean.TRUE);
        course.setRating(dto.getRating() != null ? dto.getRating() : 4.8);
        course.setDuration(dto.getDuration() != null ? dto.getDuration() : "8 hours");
        course.setDescription(dto.getDescription() != null ? dto.getDescription() : "Comprehensive upskilling course.");

        Course saved = courseRepo.save(course);

        // Map target skills
        if (dto.getTargetSkills() != null && !dto.getTargetSkills().isEmpty()) {
            for (String skillName : dto.getTargetSkills()) {
                if (skillName == null || skillName.isBlank()) continue;
                String normalized = skillName.trim();

                // Find all matching skills in database
                List<Skills> matchedSkills = skillsRepo.findAll().stream()
                        .filter(s -> s.getSkillName() != null && s.getSkillName().equalsIgnoreCase(normalized))
                        .toList();

                if (matchedSkills.isEmpty()) {
                    Skills newSkill = new Skills();
                    newSkill.setSkillName(normalized);
                    matchedSkills = List.of(skillsRepo.save(newSkill));
                }

                for (Skills skill : matchedSkills) {
                    if (!courseSkillRepo.existsByCourseCourseIdAndSkillSkillId(saved.getCourseId(), skill.getSkillId())) {
                        CourseSkill cs = new CourseSkill();
                        cs.setCourse(saved);
                        cs.setSkill(skill);
                        courseSkillRepo.save(cs);
                    }
                }
            }
        }

        return saved;
    }

    /**
     * Clean and upgrade any legacy courses that have generic homepage URLs.
     */
    @Transactional
    public void cleanOrUpgradeLegacyCourses() {
        List<Course> all = courseRepo.findAll();
        for (Course c : all) {
            boolean isGeneric = c.getUrl() == null
                    || c.getUrl().isBlank()
                    || c.getUrl().equals("https://www.youtube.com/")
                    || c.getUrl().contains("example.com");

            if (isGeneric || Boolean.FALSE.equals(c.getFree()) || c.getFree() == null) {
                c.setFree(Boolean.TRUE);
                if (c.getUrl() == null || c.getUrl().equals("https://www.youtube.com/") || c.getUrl().contains("example.com")) {
                    c.setUrl(buildFallbackCourseUrl(c.getTitle()));
                }
                courseRepo.save(c);
            }
        }
    }

    /**
     * Curated, verified upskilling YouTube courses for core technology stacks.
     */
    public List<ExternalCourseDTO> getCuratedSeedCourses() {
        List<ExternalCourseDTO> list = new ArrayList<>();

        list.add(ExternalCourseDTO.builder()
                .title("React.js Full Course 2026 with Projects")
                .provider("YouTube (freeCodeCamp)")
                .url("https://www.youtube.com/watch?v=bMknfKXIFA8")
                .free(true)
                .rating(4.9)
                .duration("11 hours")
                .description("Complete React guide: JSX, hooks (useState, useEffect, useMemo), TailwindCSS, custom hooks, and state management.")
                .targetSkills(List.of("React", "JavaScript"))
                .build());

        list.add(ExternalCourseDTO.builder()
                .title("Java Full Course for Beginners (2026)")
                .provider("YouTube (Bro Code)")
                .url("https://www.youtube.com/watch?v=A74TOX803D0")
                .free(true)
                .rating(4.9)
                .duration("12 hours")
                .description("Master Java fundamentals from scratch: variables, OOP, inheritance, collections, exception handling, and file I/O.")
                .targetSkills(List.of("Java"))
                .build());

        list.add(ExternalCourseDTO.builder()
                .title("Spring Boot 3 & Microservices Full Tutorial")
                .provider("YouTube (Telusko)")
                .url("https://www.youtube.com/watch?v=5PdEmeopJVQ")
                .free(true)
                .rating(4.8)
                .duration("8.5 hours")
                .description("Build production-ready REST APIs, Spring Data JPA, Hibernate, Spring Security 6, and microservices architecture.")
                .targetSkills(List.of("Spring Boot", "Microservices"))
                .build());

        list.add(ExternalCourseDTO.builder()
                .title("Python for Beginners - Full Course")
                .provider("YouTube (Programming with Mosh)")
                .url("https://www.youtube.com/watch?v=_uQrJ0TkZlc")
                .free(true)
                .rating(4.9)
                .duration("6 hours")
                .description("Learn Python programming from scratch to intermediate: data structures, functions, modules, packages, and OOP.")
                .targetSkills(List.of("Python"))
                .build());

        list.add(ExternalCourseDTO.builder()
                .title("SQL & Database Design Tutorial for Beginners")
                .provider("YouTube (freeCodeCamp)")
                .url("https://www.youtube.com/watch?v=HXV3zeQKqGY")
                .free(true)
                .rating(4.8)
                .duration("4.5 hours")
                .description("Master SQL queries, inner/outer joins, subqueries, grouping, database schema design, and MySQL administration.")
                .targetSkills(List.of("SQL", "MySQL"))
                .build());

        list.add(ExternalCourseDTO.builder()
                .title("JavaScript Programming Full Course")
                .provider("YouTube (freeCodeCamp)")
                .url("https://www.youtube.com/watch?v=jS4aFq5-91M")
                .free(true)
                .rating(4.8)
                .duration("7.5 hours")
                .description("Master modern ES6+ JavaScript, closures, asynchronous promises, DOM manipulation, and fetch API.")
                .targetSkills(List.of("JavaScript"))
                .build());

        list.add(ExternalCourseDTO.builder()
                .title("Docker Tutorial for Beginners (Containerization)")
                .provider("YouTube (TechWorld with Nana)")
                .url("https://www.youtube.com/watch?v=3qBXWUpoPHo")
                .free(true)
                .rating(4.9)
                .duration("3 hours")
                .description("Learn Docker from ground up: Dockerfile, containers, images, volumes, networking, Docker Compose, and CI/CD basics.")
                .targetSkills(List.of("Docker"))
                .build());

        list.add(ExternalCourseDTO.builder()
                .title("Git and GitHub Complete Crash Course")
                .provider("YouTube (freeCodeCamp)")
                .url("https://www.youtube.com/watch?v=RGOj5yH7evk")
                .free(true)
                .rating(4.8)
                .duration("2 hours")
                .description("Complete guide to Git version control: commit, branch, merge, stash, rebase, and open-source collaboration on GitHub.")
                .targetSkills(List.of("Git"))
                .build());

        list.add(ExternalCourseDTO.builder()
                .title("Node.js and Express.js Full Course")
                .provider("YouTube (freeCodeCamp)")
                .url("https://www.youtube.com/watch?v=Oe421EPjeBE")
                .free(true)
                .rating(4.8)
                .duration("8 hours")
                .description("Backend JavaScript development with Node.js, Express framework, middleware, JWT authentication, and MongoDB integration.")
                .targetSkills(List.of("Node.js"))
                .build());

        list.add(ExternalCourseDTO.builder()
                .title("Python Django Full Stack Web App Tutorial")
                .provider("YouTube (freeCodeCamp)")
                .url("https://www.youtube.com/watch?v=F5mRW0jo-U4")
                .free(true)
                .rating(4.7)
                .duration("9 hours")
                .description("Build dynamic web applications using Django: MVT pattern, Django ORM, user authentication, and REST API deployment.")
                .targetSkills(List.of("Django", "Python"))
                .build());

        list.add(ExternalCourseDTO.builder()
                .title("RESTful APIs & Web Services Architecture")
                .provider("YouTube (freeCodeCamp)")
                .url("https://www.youtube.com/watch?v=yE9v9tefP6w")
                .free(true)
                .rating(4.7)
                .duration("4 hours")
                .description("Understand REST architecture, HTTP methods, headers, status codes, OpenAPI/Swagger docs, and API testing with Postman.")
                .targetSkills(List.of("REST API"))
                .build());

        list.add(ExternalCourseDTO.builder()
                .title("AWS Certified Cloud Practitioner Full Course")
                .provider("YouTube (freeCodeCamp)")
                .url("https://www.youtube.com/watch?v=SOTamWNgDKc")
                .free(true)
                .rating(4.8)
                .duration("14 hours")
                .description("Comprehensive AWS cloud computing guide: EC2, S3, RDS, Lambda, IAM, VPC, security, and cloud architecture patterns.")
                .targetSkills(List.of("AWS"))
                .build());

        return list;
    }
}
