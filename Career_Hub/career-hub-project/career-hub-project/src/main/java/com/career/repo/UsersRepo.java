package com.career.repo;

import org.springframework.data.jpa.repository.JpaRepository;

import com.career.entity.Users;
import java.util.List;


public interface UsersRepo extends JpaRepository<Users, Integer> {

	Users findByUsername(String username);
	
}
