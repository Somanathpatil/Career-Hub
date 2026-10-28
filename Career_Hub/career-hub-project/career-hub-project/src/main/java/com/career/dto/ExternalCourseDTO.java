package com.career.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExternalCourseDTO {

    private String title;
    private String provider;
    private String url;
    private Boolean free;
    private Double rating;
    private String duration;
    private String description;
    private List<String> targetSkills;
}
