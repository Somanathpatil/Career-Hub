package com.career.dto;

import lombok.Data;

@Data
public class RoadmapProgressResponse {

    private Integer roadmapId;
    private String title;
    private long totalSteps;
    private long completedSteps;
    private double progressPercentage;
}