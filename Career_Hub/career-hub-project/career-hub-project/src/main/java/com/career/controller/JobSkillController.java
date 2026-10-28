package com.career.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.career.entity.JobSkill;
import com.career.service.JobSkillService;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/jobskill")
public class JobSkillController {

    @Autowired
    private JobSkillService jsservice;

    @PostMapping("/add")
    public JobSkill addJobSkill(@RequestBody JobSkill jobSkill) {
        return jsservice.saveJobSkill(jobSkill);
    }

    @GetMapping("/job/{jobId}")
    public List<JobSkill> getJobSkills(@PathVariable Integer jobId) {
        return jsservice.getJobSkills(jobId);
    }
}