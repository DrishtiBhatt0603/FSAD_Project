package com.school.config;

import com.school.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import java.util.Map;

/**
 * Makes each seeded teacher the class teacher of exactly one class. Runs on every startup
 * and only writes when an assignment is missing/changed, so it safely backfills an existing
 * database without a reseed. Single source of truth for teacher→class mapping.
 */
@Component
@Order(2) // after DataSeeder
public class TeacherAssignmentInitializer implements CommandLineRunner {

    @Autowired private UserRepository userRepo;

    private static final Map<String, String> ASSIGNMENTS = Map.of(
        "teacher1", "8A",
        "teacher2", "8B",
        "teacher3", "9A",
        "teacher4", "9B",
        "teacher5", "10A",
        "teacher6", "10B"
    );

    @Override
    public void run(String... args) {
        ASSIGNMENTS.forEach((username, cls) ->
            userRepo.findByUsername(username).ifPresent(u -> {
                if (!cls.equals(u.getAssignedClass())) {
                    u.setAssignedClass(cls);
                    userRepo.save(u);
                }
            }));
    }
}
