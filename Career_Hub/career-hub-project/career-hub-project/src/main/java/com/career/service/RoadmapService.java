package com.career.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.career.dto.RoadmapProgressResponse;
import com.career.entity.Course;
import com.career.entity.CourseSkill;
import com.career.entity.JobSkill;
import com.career.entity.Jobs;
import com.career.entity.Roadmap;
import com.career.entity.RoadmapStep;
import com.career.entity.Skills;
import com.career.entity.UserSkill;
import com.career.entity.Users;
import com.career.repo.CourseSkillRepo;
import com.career.repo.JobSkillRepo;
import com.career.repo.JobsRepo;
import com.career.repo.RoadmapRepo;
import com.career.repo.RoadmapStepRepo;
import com.career.repo.UserSkillRepo;
import com.career.repo.UsersRepo;

@Service
public class RoadmapService {

    @Autowired
    private RoadmapRepo roadmapRepo;

    @Autowired
    private RoadmapStepRepo roadmapStepRepo;

    @Autowired
    private UsersRepo usersRepo;

    @Autowired
    private JobsRepo jobsRepo;

    @Autowired
    private UserSkillRepo userSkillRepo;

    @Autowired
    private JobSkillRepo jobSkillRepo;

    @Autowired
    private CourseSkillRepo courseSkillRepo;

    @Transactional
    public Roadmap generateRoadmap(Integer userId, Integer jobId) {

        Users user = usersRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Jobs job = jobsRepo.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        List<UserSkill> userSkills =
                userSkillRepo.findByUserUserId(userId);

        List<JobSkill> jobSkills =
                jobSkillRepo.findByJobJobId(jobId);

        Roadmap roadmap = new Roadmap();
        roadmap.setUser(user);
        roadmap.setJob(job);
        roadmap.setTitle("Learning Roadmap for " + job.getJobTitle());
        roadmap.setStatus("IN_PROGRESS");

        roadmap = roadmapRepo.save(roadmap);

        int order = 1;

        for (JobSkill jobSkill : jobSkills) {

            Skills skill = jobSkill.getSkill();

            UserSkill matchingUserSkill = null;

            for (UserSkill userSkill : userSkills) {
                if (userSkill.getSkill().getSkillId()
                        .equals(skill.getSkillId())) {
                    matchingUserSkill = userSkill;
                    break;
                }
            }

            // Skip skills the user already meets.
            if (matchingUserSkill != null
                    && getLevelValue(matchingUserSkill.getLevel())
                    >= getLevelValue(jobSkill.getRequiredLevel())) {
                continue;
            }

            // Find a free course for this skill, if available.
            Course selectedCourse = null;

            List<CourseSkill> courseSkills =
                    courseSkillRepo.findBySkillSkillId(skill.getSkillId());

            for (CourseSkill courseSkill : courseSkills) {
                Course course = courseSkill.getCourse();

                if (Boolean.TRUE.equals(course.getFree())) {
                    selectedCourse = course;
                    break;
                }
            }

            RoadmapStep step = new RoadmapStep();
            step.setRoadmap(roadmap);
            step.setSkill(skill);
            step.setCourse(selectedCourse);
            step.setStepOrder(order++);
            step.setStatus("PENDING");

            if (matchingUserSkill == null) {
                step.setDescription(
                        "Learn " + skill.getSkillName()
                        + ". It is required for " + job.getJobTitle()
                        + " but is missing from your profile."
                );
            } else {
                step.setDescription(
                        "Improve " + skill.getSkillName()
                        + " from " + matchingUserSkill.getLevel()
                        + " to the required level "
                        + jobSkill.getRequiredLevel() + "."
                );
            }

            roadmapStepRepo.save(step);
        }

        return roadmap;
    }

    public List<Roadmap> getUserRoadmaps(Integer userId) {

        if (!usersRepo.existsById(userId)) {
            throw new RuntimeException("User not found");
        }

        return roadmapRepo.findByUserUserId(userId);
    }

    public List<RoadmapStep> getRoadmapSteps(Integer roadmapId) {

        if (!roadmapRepo.existsById(roadmapId)) {
            throw new RuntimeException("Roadmap not found");
        }

        return roadmapStepRepo
                .findByRoadmapRoadmapIdOrderByStepOrderAsc(roadmapId);
    }

    private int getLevelValue(String level) {

        if (level == null) {
            return 0;
        }

        switch (level.toUpperCase()) {
            case "BEGINNER":
                return 1;
            case "INTERMEDIATE":
                return 2;
            case "ADVANCED":
                return 3;
            case "EXPERT":
                return 4;
            default:
                throw new IllegalArgumentException(
                        "Invalid skill level: " + level
                );
        }
    }
    
    
    @Transactional
    public RoadmapStep completeStep(Integer stepId) {

        RoadmapStep step = roadmapStepRepo.findById(stepId)
                .orElseThrow(() ->
                        new RuntimeException("Roadmap step not found"));

        if (!"COMPLETED".equals(step.getStatus())) {
            step.setStatus("COMPLETED");
            step.setCompletedAt(java.time.LocalDateTime.now());

            roadmapStepRepo.save(step);
        }

        updateRoadmapStatus(step.getRoadmap().getRoadmapId());

        return step;
    }

    @Transactional
    public RoadmapStep reopenStep(Integer stepId) {

        RoadmapStep step = roadmapStepRepo.findById(stepId)
                .orElseThrow(() ->
                        new RuntimeException("Roadmap step not found"));

        step.setStatus("PENDING");
        step.setCompletedAt(null);

        roadmapStepRepo.save(step);

        updateRoadmapStatus(step.getRoadmap().getRoadmapId());

        return step;
    }

    public RoadmapProgressResponse getProgress(Integer roadmapId) {

        Roadmap roadmap = roadmapRepo.findById(roadmapId)
                .orElseThrow(() ->
                        new RuntimeException("Roadmap not found"));

        long total = roadmapStepRepo
                .countByRoadmapRoadmapId(roadmapId);

        long completed = roadmapStepRepo
                .countByRoadmapRoadmapIdAndStatus(
                        roadmapId, "COMPLETED");

        double percentage = total == 0
                ? 0.0
                : Math.round(completed * 10000.0 / total) / 100.0;

        RoadmapProgressResponse response =
                new RoadmapProgressResponse();

        response.setRoadmapId(roadmap.getRoadmapId());
        response.setTitle(roadmap.getTitle());
        response.setTotalSteps(total);
        response.setCompletedSteps(completed);
        response.setProgressPercentage(percentage);

        return response;
    }

    private void updateRoadmapStatus(Integer roadmapId) {

        long total = roadmapStepRepo
                .countByRoadmapRoadmapId(roadmapId);

        long completed = roadmapStepRepo
                .countByRoadmapRoadmapIdAndStatus(
                        roadmapId, "COMPLETED");

        Roadmap roadmap = roadmapRepo.findById(roadmapId)
                .orElseThrow(() ->
                        new RuntimeException("Roadmap not found"));

        if (total > 0 && total == completed) {
            roadmap.setStatus("COMPLETED");
        } else {
            roadmap.setStatus("IN_PROGRESS");
        }

        roadmapRepo.save(roadmap);
    }
    
    
}