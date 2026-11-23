package com.school.controller;

import com.school.entity.Performance;
import com.school.entity.Student;
import com.school.entity.User;
import com.school.repository.PerformanceRepository;
import com.school.repository.StudentRepository;
import com.school.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/performance")
public class PerformanceController {

    @Autowired private PerformanceRepository performanceRepo;
    @Autowired private StudentRepository studentRepo;
    @Autowired private UserRepository userRepo;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER','PRINCIPAL')")
    public List<Performance> getAll() {
        return performanceRepo.findAll();
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER','PRINCIPAL')")
    public List<Performance> getByStudent(@PathVariable Long studentId) {
        return performanceRepo.findByStudentId(studentId);
    }

    @GetMapping("/class/{className}")
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER','PRINCIPAL')")
    public List<Performance> getByClass(@PathVariable String className) {
        return performanceRepo.findByStudentClassName(className);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    public ResponseEntity<?> record(@RequestBody Map<String, Object> body, Authentication auth) {
        Long studentId = Long.valueOf(body.get("studentId").toString());
        Student student = studentRepo.findById(studentId).orElseThrow();
        User teacher = userRepo.findByUsername(auth.getName()).orElseThrow();
        Performance p = new Performance(null, student,
                (String) body.get("subject"),
                (String) body.get("testName"),
                Double.valueOf(body.get("score").toString()),
                Double.valueOf(body.get("maxScore").toString()),
                LocalDate.now(), teacher);
        return ResponseEntity.ok(performanceRepo.save(p));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        if (!performanceRepo.existsById(id)) return ResponseEntity.notFound().build();
        performanceRepo.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Deleted"));
    }
}
