package com.career.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import com.career.entity.Users;
import com.career.repo.UsersRepo;

@Service
public class UsersService{

	@Autowired
	UsersRepo urepo;
	
	@Autowired
	AuthenticationManager authmanager;
	
	@Autowired
	JWTServiceImpl jwtService;
	
	
	public Users saveUser(Users users) {
		
		return urepo.save(users);
	
	}

	
	public List<Users> getAllUseres() {
		// TODO Auto-generated method stub
		return urepo.findAll();
	}

	
	public void deleteUserById(Integer id) {
		
		urepo.deleteById(id);
		
	}

	
	public String verify(Users users) {
		
		Authentication auth = authmanager.authenticate(new UsernamePasswordAuthenticationToken(users.getUsername(), users.getPassword()));
		
		if(auth.isAuthenticated()) {
			System.out.println("Login Successfully");
			return jwtService.getToken(users);
		}
		
		return "Fail";
	}

	
}
