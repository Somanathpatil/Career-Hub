package com.career.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.career.dto.CourseRecommendationResponse;
import com.career.entity.Course;
import com.career.entity.CourseSkill;
import com.career.entity.JobSkill;
import com.career.entity.UserSkill;
import com.career.repo.CourseSkillRepo;
import com.career.repo.JobSkillRepo;
import com.career.repo.UserSkillRepo;

@Service
public class CourseRecommendationService {

    @Autowired
    private UserSkillRepo userSkillRepo;

    @Autowired
    private JobSkillRepo jobSkillRepo;

    @Autowired
    private CourseSkillRepo courseSkillRepo;

    public List<CourseRecommendationResponse> recommendCourses(Integer userId, Integer jobId) {

        List<UserSkill> userSkills = userSkillRepo.findByUserUserId(userId);

        List<JobSkill> jobSkills = jobSkillRepo.findByJobJobId(jobId);

        // Map each user's skill ID to their current level.
        Map<Integer, String> userLevels = new HashMap<>();

        for (UserSkill userSkill : userSkills) {
            userLevels.put(
                    userSkill.getSkill().getSkillId(),
                    userSkill.getLevel()
            );
        }

        List<CourseRecommendationResponse> recommendations = new ArrayList<>();

        // Track course + target skill combinations to avoid duplicates.
        Set<String> processedCombinations = new HashSet<>();

        for (JobSkill jobSkill : jobSkills) {

            Integer skillId = jobSkill.getSkill().getSkillId();
            String skillName = jobSkill.getSkill().getSkillName();
            String requiredLevel = jobSkill.getRequiredLevel();

            String userLevel = userLevels.get(skillId);

            // Skip skills that already meet the job requirement.
            if (userLevel != null && getLevelValue(userLevel) >= getLevelValue(requiredLevel)) {
                continue;
            }

            // Find courses teaching this skill.
            List<CourseSkill> courseSkills = courseSkillRepo.findBySkillSkillId(skillId);

            for (CourseSkill courseSkill : courseSkills) {

                Course course = courseSkill.getCourse();

                // Recommend free courses only.
                if (!Boolean.TRUE.equals(course.getFree())) {
                    continue;
                }

                String combination =
                        course.getCourseId() + "-" + skillId;

                if (!processedCombinations.add(combination)) {
                    continue;
                }

                CourseRecommendationResponse response =
                        new CourseRecommendationResponse();

                response.setCourseId(course.getCourseId());
                response.setTitle(course.getTitle());
                response.setProvider(course.getProvider());
                response.setUrl(course.getUrl());
                response.setFree(course.getFree());
                response.setRating(course.getRating());
                response.setDuration(course.getDuration());
                response.setTargetSkill(skillName);

                if (userLevel == null) {
                    response.setReason(
                            skillName
                            + " is required for this job but is missing "
                            + "from your profile."
                    );
                } else {
                    response.setReason(
                            "Your current level is " + userLevel
                            + ", while this job requires "
                            + requiredLevel + "."
                    );
                }

                recommendations.add(response);
            }
        }

        return recommendations;
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
}