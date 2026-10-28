package com.career.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.career.entity.Users;
import com.career.entity.UsersPrinciple;
import com.career.repo.UsersRepo;

@Service
public class UserDetailesServiceImpl implements UserDetailsService {

	@Autowired
	UsersRepo urepo;
	
	@Override
	public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
		
		Users users = urepo.findByUsername(username);
		
		if(users == null) {
			throw new UsernameNotFoundException(username);
		}
		
		return new UsersPrinciple(users);
	}

}
