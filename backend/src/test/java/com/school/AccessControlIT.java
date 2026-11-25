package com.school;

import org.junit.jupiter.api.Test;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Authorization / access-control tests — verifies the JWT + @PreAuthorize rules that gate
 * every endpoint by role. (This is the "policy" layer of the app.)
 */
class AccessControlIT extends AbstractIT {

    @Test
    void protectedEndpointWithoutTokenIs401() throws Exception {
        mvc.perform(get("/api/students"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void invalidTokenIs401() throws Exception {
        mvc.perform(get("/api/students").header("Authorization", "Bearer garbage.token.here"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void adminCanListStudents() throws Exception {
        mvc.perform(get("/api/students").header("Authorization", "Bearer " + adminToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(60))));
    }

    @Test
    void distinctClassesEndpointReturnsSixClasses() throws Exception {
        mvc.perform(get("/api/students/classes").header("Authorization", "Bearer " + adminToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasItems("8A", "8B", "9A", "9B", "10A", "10B")));
    }

    @Test
    void teacherCannotCreateUsers() throws Exception {
        String body = "{\"name\":\"X\",\"username\":\"x1\",\"password\":\"secret1\",\"role\":\"TEACHER\"}";
        mvc.perform(post("/api/users").header("Authorization", "Bearer " + teacherToken())
                        .contentType("application/json").content(body))
                .andExpect(status().isForbidden());
    }

    @Test
    void clerkCannotDeleteAdmission() throws Exception {
        mvc.perform(delete("/api/admissions/1").header("Authorization", "Bearer " + clerkToken()))
                .andExpect(status().isForbidden());
    }

    @Test
    void adminCanAccessUserManagement() throws Exception {
        mvc.perform(get("/api/users").header("Authorization", "Bearer " + adminToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(10))));
    }

    @Test
    void teacherCannotReachUserManagement() throws Exception {
        mvc.perform(get("/api/users").header("Authorization", "Bearer " + teacherToken()))
                .andExpect(status().isForbidden());
    }
}
