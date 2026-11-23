package com.school.controller;

import com.school.entity.ClassSchedule;
import com.school.entity.User;
import com.school.repository.ClassScheduleRepository;
import com.school.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/schedule")
public class ScheduleController {

    @Autowired private ClassScheduleRepository scheduleRepo;
    @Autowired private UserRepository userRepo;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER','PRINCIPAL')")
    public List<ClassSchedule> getAll() {
        return scheduleRepo.findAll();
    }

    @GetMapping("/class/{className}")
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER','PRINCIPAL')")
    public List<ClassSchedule> getByClass(@PathVariable String className) {
        return scheduleRepo.findByClassName(className);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','PRINCIPAL')")
    public ResponseEntity<?> create(@RequestBody Map<String, Object> body) {
        Long teacherId = Long.valueOf(body.get("teacherId").toString());
        User teacher = userRepo.findById(teacherId).orElseThrow();
        ClassSchedule sc = new ClassSchedule(null,
                (String) body.get("className"),
                (String) body.get("subject"),
                (String) body.get("dayOfWeek"),
                Integer.valueOf(body.get("period").toString()),
                teacher);
        return ResponseEntity.ok(scheduleRepo.save(sc));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','PRINCIPAL')")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        if (!scheduleRepo.existsById(id)) return ResponseEntity.notFound().build();
        scheduleRepo.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Deleted"));
    }
}
