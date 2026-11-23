package com.school.controller;

import com.school.entity.User;
import com.school.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired private UserRepository userRepo;
    @Autowired private PasswordEncoder encoder;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','PRINCIPAL')")
    public List<User> getAll() {
        return userRepo.findAll();
    }

    @GetMapping("/teachers")
    @PreAuthorize("hasAnyRole('ADMIN','PRINCIPAL')")
    public List<User> getTeachers() {
        return userRepo.findByRole(User.Role.TEACHER);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> create(@RequestBody Map<String, String> body) {
        if (userRepo.findByUsername(body.get("username")).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username already exists"));
        }
        User u = new User(null,
                body.get("name"),
                body.get("username"),
                encoder.encode(body.get("password")),
                User.Role.valueOf(body.get("role")));
        return ResponseEntity.ok(userRepo.save(u));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        userRepo.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "User deleted"));
    }
}
