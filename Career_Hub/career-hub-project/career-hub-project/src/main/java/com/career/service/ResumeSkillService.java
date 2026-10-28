package com.career.service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

import org.springframework.stereotype.Service;

import com.career.dto.MatchedSkillDTO;
import com.career.dto.ResumeSkillMatchResponse;
import com.career.entity.Skills;
import com.career.repo.SkillsRepo;

@Service
public class ResumeSkillService {

    private final SkillsRepo skillsRepo;

    public ResumeSkillService(SkillsRepo skillsRepo) {
        this.skillsRepo = skillsRepo;
    }
    
    

    public ResumeSkillMatchResponse matchSkills(List<String> resumeSkills) {

        List<Skills> databaseSkills = skillsRepo.findAll();

        List<MatchedSkillDTO> matched = new ArrayList<>();
        List<String> unmatched = new ArrayList<>();

        Set<Integer> matchedIds = new HashSet<>();
        Set<String> unmatchedNames = new HashSet<>();

        for (String resumeSkill : resumeSkills) {

            if (resumeSkill == null || resumeSkill.isBlank()) {
                continue;
            }

            String normalized = normalize(resumeSkill);

            Skills found = databaseSkills.stream()
                    .filter(skill -> normalize(skill.getSkillName())
                            .equals(normalized))
                    .findFirst()
                    .orElse(null);

            if (found != null) {
                if (matchedIds.add(found.getSkillId())) {
                    matched.add(new MatchedSkillDTO(found.getSkillId(), found.getSkillName()));
                }
            } else {
                String displayName = resumeSkill.trim();

                if (unmatchedNames.add(
                        displayName.toLowerCase(Locale.ROOT))) {
                    unmatched.add(displayName);
                }
            }
        }

        return new ResumeSkillMatchResponse(matched, unmatched);
    }

    private String normalize(String value) {

        if (value == null) {
            return "";
        }

        String normalized = value.toLowerCase(Locale.ROOT)
                .replaceAll("\\s*\\([^)]*\\)", "")
                .replaceAll("[^a-z0-9+#.]", "");

        return switch (normalized) {
            case "reactjs", "react.js" -> "react";
            case "nodejs", "node.js" -> "nodejs";
            case "js" -> "javascript";
            case "ts" -> "typescript";
            case "mysql" -> "mysql";
            default -> normalized;
        };
    }
}
