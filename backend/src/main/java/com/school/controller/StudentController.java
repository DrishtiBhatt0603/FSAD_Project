package com.school.controller;

import com.school.entity.Student;
import com.school.repository.StudentRepository;
import com.school.security.TeacherScope;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    @Autowired private StudentRepository repo;
    @Autowired private TeacherScope teacherScope;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','CLERK','TEACHER','PRINCIPAL')")
    public List<Student> getAll(Authentication auth) {
        String cls = teacherScope.restrictedClass(auth);
        List<Student> all = repo.findAll();
        if (cls == null) return all;
        return all.stream().filter(s -> cls.equals(s.getClassName())).toList();
    }

    @GetMapping("/classes")
    @PreAuthorize("hasAnyRole('ADMIN','CLERK','TEACHER','PRINCIPAL')")
    public List<String> getClasses(Authentication auth) {
        String cls = teacherScope.restrictedClass(auth);
        if (cls != null) return List.of(cls);
        return repo.findAll().stream()
                .map(Student::getClassName)
                .filter(c -> c != null && !c.isBlank())
                .distinct()
                .sorted()
                .toList();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','CLERK','TEACHER','PRINCIPAL')")
    public ResponseEntity<Student> getById(@PathVariable Long id) {
        return repo.findById(id).map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN','CLERK','TEACHER','PRINCIPAL')")
    public List<Student> search(@RequestParam String name) {
        return repo.findByNameContainingIgnoreCase(name);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','CLERK')")
    public Student create(@RequestBody Student student) {
        return repo.save(student);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','CLERK')")
    public ResponseEntity<Student> update(@PathVariable Long id, @RequestBody Student updated) {
        return repo.findById(id).map(s -> {
            updated.setId(id);
            return ResponseEntity.ok(repo.save(updated));
        }).orElse(ResponseEntity.notFound().build());
    }
}
