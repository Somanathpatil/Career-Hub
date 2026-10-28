package com.career.service;


import java.util.Date;
import javax.crypto.SecretKey;

import org.springframework.stereotype.Service;

import com.career.entity.Users;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;

import io.jsonwebtoken.security.Keys;

@Service
public class JWTServiceImpl {
	
	private String secretKey = "TXUgRSLvAEfFphfljIRphv9UWg2Agck0";
	

	public String getToken(Users users) {
		
		return Jwts.builder()
				.subject(users.getUsername())
				.issuedAt(new Date(System.currentTimeMillis()))
				.expiration(new Date(System.currentTimeMillis() + 60 * 60 * 1000))
				.signWith(getKey())
				.compact();
		
	}

	private SecretKey getKey() {
		return Keys.hmacShaKeyFor(secretKey.getBytes());
	}

	public String extractUsersname(String token) {
		
		return extraectClaims(token).getSubject();
	}

	public boolean validateToken(String username, String token) {
		
		String extractUsername = extractUsersname(token);
				
		return extractUsername.equals(username) && !isTokenExp(token);
	}
	
	public boolean isTokenExp(String token) {
		return extraectClaims(token)
				.getExpiration()
				.before(new Date(System.currentTimeMillis()));
	}
	
	public Claims extraectClaims(String token) {
		return Jwts.parser()
				   .verifyWith(getKey())
				   .build()
				   .parseSignedClaims(token)
				   .getPayload();
	}
	
	

}
