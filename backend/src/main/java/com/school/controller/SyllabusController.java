package com.school.controller;

import com.school.entity.Syllabus;
import com.school.entity.User;
import com.school.repository.SyllabusRepository;
import com.school.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/syllabus")
public class SyllabusController {

    @Autowired private SyllabusRepository syllabusRepo;
    @Autowired private UserRepository userRepo;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER','PRINCIPAL')")
    public List<Syllabus> getAll() {
        return syllabusRepo.findAll();
    }

    @GetMapping("/class/{className}")
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER','PRINCIPAL')")
    public List<Syllabus> getByClass(@PathVariable String className) {
        return syllabusRepo.findByClassName(className);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    public ResponseEntity<?> save(@RequestBody Map<String, String> body, Authentication auth) {
        User teacher = userRepo.findByUsername(auth.getName()).orElseThrow();
        String cls = body.get("className");
        String subject = body.get("subject");
        Syllabus sy = syllabusRepo.findByClassNameAndSubject(cls, subject)
                .orElse(new Syllabus(null, cls, subject, null, null, null));
        sy.setContent(body.get("content"));
        sy.setUpdatedAt(LocalDateTime.now());
        sy.setUpdatedBy(teacher);
        return ResponseEntity.ok(syllabusRepo.save(sy));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        if (!syllabusRepo.existsById(id)) return ResponseEntity.notFound().build();
        syllabusRepo.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Deleted"));
    }
}
