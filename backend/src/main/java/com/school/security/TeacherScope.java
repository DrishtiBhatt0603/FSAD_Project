package com.school.security;

import com.school.entity.User;
import com.school.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

/**
 * Resolves the single class a class-teacher is restricted to. Controllers use this to
 * scope reads so a teacher only ever sees their own class. Returns null when the caller
 * is not a teacher (or has no class assigned), meaning "no restriction".
 */
@Component
public class TeacherScope {

    @Autowired private UserRepository userRepo;

    public String restrictedClass(Authentication auth) {
        if (auth == null) return null;
        return userRepo.findByUsername(auth.getName())
                .filter(u -> u.getRole() == User.Role.TEACHER)
                .map(User::getAssignedClass)
                .filter(c -> c != null && !c.isBlank())
                .orElse(null);
    }
}
