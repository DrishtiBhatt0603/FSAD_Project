package com.school.repository;

import com.school.entity.Attendance;
import com.school.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByStudentId(Long studentId);
    List<Attendance> findByDate(LocalDate date);
    List<Attendance> findByStudentIdAndDateBetween(Long studentId, LocalDate start, LocalDate end);
    void deleteByStudent(Student student);
}
