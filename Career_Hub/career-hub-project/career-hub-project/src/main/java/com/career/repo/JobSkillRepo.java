package com.career.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.career.entity.JobSkill;

@Repository
public interface JobSkillRepo extends JpaRepository<JobSkill, Integer> {
	
	List<JobSkill> findByJobJobId(Integer id);

	boolean existsByJobJobIdAndSkillSkillId(Integer jobId, Integer skillId);
}
