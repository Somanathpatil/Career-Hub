package com.career.repo;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.career.entity.Jobs;

@Repository
public interface JobsRepo extends JpaRepository<Jobs, Integer> {

	boolean existsByJobTitleAndCompany(String jobTitle, String company);

	Optional<Jobs> findByJobTitleAndCompany(String jobTitle, String company);

	boolean existsByJobUrl(String jobUrl);

	List<Jobs> findBySource(String source);
}
