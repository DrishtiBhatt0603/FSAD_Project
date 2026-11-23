package com.school.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "performance")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Performance {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    private String subject;
    private String testName;
    private Double score;
    private Double maxScore;
    private LocalDate testDate;

    @ManyToOne
    @JoinColumn(name = "recorded_by")
    private User recordedBy;
}
