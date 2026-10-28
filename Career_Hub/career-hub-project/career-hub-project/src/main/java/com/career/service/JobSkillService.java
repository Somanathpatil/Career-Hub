package com.career.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


import com.career.entity.JobSkill;
import com.career.entity.Jobs;
import com.career.entity.Skills;

import com.career.repo.JobSkillRepo;
import com.career.repo.JobsRepo;
import com.career.repo.SkillsRepo;

@Service
public class JobSkillService {

    @Autowired
    private JobSkillRepo jsrepo;

    @Autowired
    private JobsRepo jrepo;

    @Autowired
    private SkillsRepo srepo;

    public JobSkill saveJobSkill(JobSkill jobSkill) {

        Jobs job = jrepo.findById(jobSkill.getJob().getJobId())
                .orElseThrow(() -> new RuntimeException("Job not found"));

        Skills skill = srepo.findById(jobSkill.getSkill().getSkillId())
                .orElseThrow(() -> new RuntimeException("Skill not found"));

        jobSkill.setJob(job);
        jobSkill.setSkill(skill);

        return jsrepo.save(jobSkill);
    }

    public List<JobSkill> getJobSkills(Integer jobId) {
        return jsrepo.findByJobJobId(jobId);
    }
}