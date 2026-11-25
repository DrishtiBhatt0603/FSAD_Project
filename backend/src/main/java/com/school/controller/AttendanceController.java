package com.school.controller;

import com.school.entity.Attendance;
import com.school.entity.Student;
import com.school.entity.User;
import com.school.repository.AttendanceRepository;
import com.school.repository.StudentRepository;
import com.school.repository.UserRepository;
import com.school.security.TeacherScope;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    @Autowired private AttendanceRepository attendanceRepo;
    @Autowired private StudentRepository studentRepo;
    @Autowired private UserRepository userRepo;
    @Autowired private TeacherScope teacherScope;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER','PRINCIPAL')")
    public List<Attendance> getAll(Authentication auth) {
        return scope(attendanceRepo.findAll(), auth);
    }

    @GetMapping("/date/{date}")
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER','PRINCIPAL')")
    public List<Attendance> getByDate(@PathVariable String date, Authentication auth) {
        return scope(attendanceRepo.findByDate(LocalDate.parse(date)), auth);
    }

    // Restrict a teacher to their own class's attendance
    private List<Attendance> scope(List<Attendance> list, Authentication auth) {
        String cls = teacherScope.restrictedClass(auth);
        if (cls == null) return list;
        return list.stream()
                .filter(a -> a.getStudent() != null && cls.equals(a.getStudent().getClassName()))
                .toList();
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER','PRINCIPAL')")
    public List<Attendance> getByStudent(@PathVariable Long studentId) {
        return attendanceRepo.findByStudentId(studentId);
    }

    @PostMapping("/bulk")
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    public ResponseEntity<?> markBulk(@RequestBody Map<String, Object> body, Authentication auth) {
        String dateStr = (String) body.get("date");
        LocalDate date = LocalDate.parse(dateStr);
        List<Map<String, Object>> records = (List<Map<String, Object>>) body.get("records");
        User teacher = userRepo.findByUsername(auth.getName()).orElseThrow();
        for (Map<String, Object> rec : records) {
            Long studentId = Long.valueOf(rec.get("studentId").toString());
            boolean present = Boolean.parseBoolean(rec.get("present").toString());
            Student student = studentRepo.findById(studentId).orElseThrow();
            attendanceRepo.findByDate(date).stream()
                .filter(a -> a.getStudent().getId().equals(studentId))
                .findFirst()
                .ifPresentOrElse(
                    existing -> { existing.setPresent(present); attendanceRepo.save(existing); },
                    () -> attendanceRepo.save(new Attendance(null, student, date, present, teacher))
                );
        }
        return ResponseEntity.ok(Map.of("message", "Attendance marked successfully"));
    }
}
