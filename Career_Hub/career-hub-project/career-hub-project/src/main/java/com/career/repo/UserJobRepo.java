package com.career.repo;

import org.springframework.data.jpa.repository.JpaRepository;

import com.career.entity.UserJobs;

public interface UserJobRepo extends JpaRepository<UserJobs, Integer> {

}
