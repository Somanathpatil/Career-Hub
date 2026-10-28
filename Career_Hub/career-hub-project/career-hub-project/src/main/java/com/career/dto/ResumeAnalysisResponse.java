package com.career.dto;

import java.util.List;

import lombok.Data;

@Data
public class ResumeAnalysisResponse{
        String candidateName;
        String email;
        String summary;
        List<String> skills;
        List<String> education;
        List<String> experience;
        List<String> projects;
}