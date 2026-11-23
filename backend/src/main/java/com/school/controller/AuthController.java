package com.school.controller;

import com.school.entity.User;
import com.school.repository.UserRepository;
import com.school.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired private UserRepository userRepo;
    @Autowired private JwtUtil jwtUtil;
    @Autowired private PasswordEncoder encoder;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String password = body.get("password");
        return userRepo.findByUsername(username)
            .filter(u -> encoder.matches(password, u.getPassword()))
            .map(u -> ResponseEntity.ok(Map.of(
                "token", jwtUtil.generateToken(u.getUsername(), u.getRole().name()),
                "role", u.getRole().name(),
                "name", u.getName(),
                "username", u.getUsername()
            )))
            .orElse(ResponseEntity.status(401).body(Map.of("error", "Invalid credentials")));
    }
}
