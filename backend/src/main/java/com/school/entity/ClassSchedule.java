package com.school.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "class_schedule")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClassSchedule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String className;
    private String subject;
    private String dayOfWeek;
    private Integer period;

    @ManyToOne
    @JoinColumn(name = "teacher_id")
    private User teacher;
}
