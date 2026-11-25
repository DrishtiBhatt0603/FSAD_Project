package com.school;

import com.fasterxml.jackson.databind.JsonNode;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;
import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Verifies class-teacher scoping: teacher1 is the class teacher of 8A and must only ever
 * see 8A data, while admin/principal see everything.
 */
class TeacherScopeIT extends AbstractIT {

    @Test
    void teacherSeesOnlyOwnClassStudents() throws Exception {
        String res = mvc.perform(get("/api/students").header("Authorization", "Bearer " + teacherToken()))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        JsonNode arr = json.readTree(res);
        assertTrue(arr.size() > 0, "teacher should see their class's students");
        for (JsonNode s : arr) {
            assertEquals("8A", s.get("className").asText(), "teacher1 must only see 8A students");
        }
    }

    @Test
    void teacherClassesEndpointReturnsOnlyOwnClass() throws Exception {
        mvc.perform(get("/api/students/classes").header("Authorization", "Bearer " + teacherToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", org.hamcrest.Matchers.contains("8A")));
    }

    @Test
    void teacherPerformanceIsLimitedToOwnClass() throws Exception {
        String res = mvc.perform(get("/api/performance").header("Authorization", "Bearer " + teacherToken()))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        JsonNode arr = json.readTree(res);
        assertTrue(arr.size() > 0);
        for (JsonNode p : arr) {
            assertEquals("8A", p.get("student").get("className").asText());
        }
    }

    @Test
    void adminSeesAllClasses() throws Exception {
        mvc.perform(get("/api/students/classes").header("Authorization", "Bearer " + adminToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(6)));
    }
}
