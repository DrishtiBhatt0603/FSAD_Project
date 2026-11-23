package com.school.controller;

import com.school.entity.*;
import com.school.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/analysis")
public class AnalysisController {

    @Autowired private StudentRepository studentRepo;
    @Autowired private AttendanceRepository attendanceRepo;
    @Autowired private PerformanceRepository performanceRepo;
    @Autowired private FeePaymentRepository feeRepo;

    @GetMapping("/overview")
    @PreAuthorize("hasAnyRole('ADMIN','PRINCIPAL')")
    public Map<String, Object> overview() {
        List<Student> students = studentRepo.findAll();
        List<Attendance> allAttendance = attendanceRepo.findAll();
        List<Performance> allPerf = performanceRepo.findAll();
        List<FeePayment> allFees = feeRepo.findAll();

        long totalPresent = allAttendance.stream().filter(Attendance::getPresent).count();
        double attendanceRate = allAttendance.isEmpty() ? 0 :
                (double) totalPresent / allAttendance.size() * 100;

        double avgScore = allPerf.isEmpty() ? 0 :
                allPerf.stream().mapToDouble(p -> p.getScore() / p.getMaxScore() * 100).average().orElse(0);

        double totalFees = allFees.stream().mapToDouble(FeePayment::getAmount).sum();

        Map<String, Long> classDist = students.stream()
                .collect(Collectors.groupingBy(Student::getClassName, Collectors.counting()));

        return Map.of(
                "totalStudents", students.size(),
                "attendanceRate", Math.round(attendanceRate * 10.0) / 10.0,
                "averageScore", Math.round(avgScore * 10.0) / 10.0,
                "totalFeesCollected", totalFees,
                "classDistribution", classDist
        );
    }

    @GetMapping("/performance-by-class")
    @PreAuthorize("hasAnyRole('ADMIN','PRINCIPAL')")
    public List<Map<String, Object>> performanceByClass() {
        return performanceRepo.findAll().stream()
                .collect(Collectors.groupingBy(p -> p.getStudent().getClassName()))
                .entrySet().stream()
                .map(e -> {
                    double avg = e.getValue().stream()
                            .mapToDouble(p -> p.getScore() / p.getMaxScore() * 100).average().orElse(0);
                    return Map.<String, Object>of("className", e.getKey(), "avgScore", Math.round(avg * 10.0) / 10.0);
                })
                .collect(Collectors.toList());
    }

    @GetMapping("/attendance-by-student")
    @PreAuthorize("hasAnyRole('ADMIN','PRINCIPAL')")
    public List<Map<String, Object>> attendanceByStudent() {
        return attendanceRepo.findAll().stream()
                .collect(Collectors.groupingBy(a -> a.getStudent().getId()))
                .entrySet().stream()
                .map(e -> {
                    var records = e.getValue();
                    long present = records.stream().filter(Attendance::getPresent).count();
                    double rate = (double) present / records.size() * 100;
                    String name = records.get(0).getStudent().getName();
                    return Map.<String, Object>of(
                            "studentId", e.getKey(),
                            "name", name,
                            "attendanceRate", Math.round(rate * 10.0) / 10.0,
                            "totalDays", records.size(),
                            "presentDays", present
                    );
                })
                .collect(Collectors.toList());
    }
}
