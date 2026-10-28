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
public class ExternalJobDTO {

    private String jobTitle;
    private String company;
    private String location;
    private Double salary;
    private Double experience;
    private String jobType;
    private String source;
    private String jobUrl;
    private List<String> requiredSkills;
    private String requiredLevel;
}
