package com.career.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.career.entity.Users;
import com.career.service.UsersService;

@RestController
@CrossOrigin(origins = "http://localhost:5173/")
@RequestMapping("/api/users")
public class UsersController {

	@Autowired
	UsersService uservice;
	
	private BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);
	
	@PostMapping("/register")
	public String addUsere(@RequestBody Users users) {
		users.setPassword(encoder.encode(users.getPassword()));
		uservice.saveUser(users);
		return "User Added Successfully!";
	}
	
	@PostMapping("/login")
	public String verify(@RequestBody Users users) {
		return uservice.verify(users);
	}
	
	@GetMapping
	public List<Users> viewAllUsers(){
		return uservice.getAllUseres();
	}
	
	@DeleteMapping("/{id}")
	public String deleteUser(@PathVariable Integer id) {
		uservice.deleteUserById(id);
		return "User Deleted Successfully!";
	}
	
	
	
	
}
