package com.career.dto;

import lombok.Data;

@Data
public class CourseRecommendationResponse {

    private Integer courseId;
    private String title;
    private String provider;
    private String url;
    private Boolean free;
    private Double rating;
    private String duration;

    private String targetSkill;
    private String reason;
}