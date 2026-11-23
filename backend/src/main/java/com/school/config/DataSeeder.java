package com.school.config;

import com.school.entity.*;
import com.school.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.DayOfWeek;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired private UserRepository userRepo;
    @Autowired private StudentRepository studentRepo;
    @Autowired private AdmissionRepository admissionRepo;
    @Autowired private SyllabusRepository syllabusRepo;
    @Autowired private ClassScheduleRepository scheduleRepo;
    @Autowired private AttendanceRepository attendanceRepo;
    @Autowired private PerformanceRepository performanceRepo;
    @Autowired private FeePaymentRepository feeRepo;
    @Autowired private PasswordEncoder encoder;

    @Override
    public void run(String... args) {
        // Idempotent — only seed if DB is empty
        if (userRepo.count() > 0) return;

        // ── Users ────────────────────────────────────────────────────────────
        User admin     = u("Admin User",        "admin",      "admin123",      User.Role.ADMIN);
        User principal = u("Dr. R.K. Sharma",   "principal",  "principal123",  User.Role.PRINCIPAL);
        User clerk1    = u("Meena Gupta",        "clerk1",     "clerk123",      User.Role.CLERK);
        User clerk2    = u("Ravi Kumar",         "clerk2",     "clerk123",      User.Role.CLERK);
        User t1  = u("Priya Singh",   "teacher1", "teacher123", User.Role.TEACHER);
        User t2  = u("Amit Patel",    "teacher2", "teacher123", User.Role.TEACHER);
        User t3  = u("Sunita Verma",  "teacher3", "teacher123", User.Role.TEACHER);
        User t4  = u("Rahul Sharma",  "teacher4", "teacher123", User.Role.TEACHER);
        User t5  = u("Kavya Reddy",   "teacher5", "teacher123", User.Role.TEACHER);
        User t6  = u("Deepak Nair",   "teacher6", "teacher123", User.Role.TEACHER);

        // ── Students (10 per class × 5 classes = 50) ────────────────────────
        // Previous performance = grade they completed BEFORE joining current class
        // Class 8 students → came from Class 7
        String[][] cls8A = {
            {"Aarav Sharma","Rajesh Sharma","12 MG Road, Delhi","7th - 82%"},
            {"Ananya Patel","Sunil Patel","45 Brigade Road, Mumbai","7th - 90%"},
            {"Arjun Singh","Harpal Singh","56 Civil Lines, Pune","7th - 76%"},
            {"Diya Verma","Anil Verma","23 Church Street, Chennai","7th - 88%"},
            {"Ishaan Kumar","Mahesh Kumar","78 Park Street, Bangalore","7th - 72%"},
            {"Kriti Joshi","Raman Joshi","34 Lake View, Hyderabad","7th - 94%"},
            {"Manav Gupta","Suresh Gupta","67 Rose Garden, Jaipur","7th - 68%"},
            {"Nisha Reddy","Venkat Reddy","89 MG Nagar, Coimbatore","7th - 85%"},
            {"Rohan Nair","Deepak Nair","101 Palm Beach, Kochi","7th - 79%"},
            {"Sneha Iyer","Krishnan Iyer","14 Anna Nagar, Madurai","7th - 91%"}
        };
        // Class 9 students → came from Class 8
        String[][] cls9A = {
            {"Aditya Mehra","Vikas Mehra","25 Sector 15, Noida","8th - 83%"},
            {"Bhavya Saxena","Pradeep Saxena","38 Civil Lines, Allahabad","8th - 77%"},
            {"Chetan Yadav","Ramesh Yadav","52 Gandhi Nagar, Lucknow","8th - 86%"},
            {"Divya Mishra","Suresh Mishra","71 Shyam Nagar, Kanpur","8th - 69%"},
            {"Farhan Khan","Irfan Khan","18 Park Avenue, Agra","8th - 93%"},
            {"Garima Tiwari","Pankaj Tiwari","46 Ashok Nagar, Bhopal","8th - 74%"},
            {"Harsh Pandey","Alok Pandey","59 Vikas Nagar, Varanasi","8th - 88%"},
            {"Isha Kapoor","Ajay Kapoor","33 Mall Road, Shimla","8th - 81%"},
            {"Jay Bhatt","Nilesh Bhatt","77 Navrangpura, Ahmedabad","8th - 95%"},
            {"Komal Thakur","Vinod Thakur","22 Sector 8, Chandigarh","8th - 78%"}
        };
        String[][] cls9B = {
            {"Lakshmi Pillai","Suresh Pillai","44 T. Nagar, Chennai","8th - 87%"},
            {"Mohit Sahu","Dinesh Sahu","66 Sitapur Road, Lucknow","8th - 71%"},
            {"Neha Rawat","Govind Rawat","88 Rajpur Road, Dehradun","8th - 84%"},
            {"Om Prakash","Shiv Prakash","11 Station Road, Patna","8th - 76%"},
            {"Pooja Desai","Ramesh Desai","55 Andheri West, Mumbai","8th - 92%"},
            {"Qureshi Ali","Mohd. Qureshi","29 Old City, Hyderabad","8th - 67%"},
            {"Ritika Bajaj","Sanjay Bajaj","43 Moti Nagar, Delhi","8th - 89%"},
            {"Sameer Jain","Dinesh Jain","17 Sarafa Bazaar, Indore","8th - 73%"},
            {"Tanvi Chandra","Ashish Chandra","36 Gomti Nagar, Lucknow","8th - 85%"},
            {"Uday Singh","Kuldeep Singh","62 Pahar Ganj, Delhi","8th - 80%"}
        };
        // Class 10 students → came from Class 9
        String[][] cls10A = {
            {"Varun Khanna","Amrit Khanna","14 Defence Colony, Delhi","9th - 86%"},
            {"Waris Ahmed","Salim Ahmed","30 Banjara Hills, Hyderabad","9th - 72%"},
            {"Xena Rodrigues","Peter Rodrigues","48 Panaji, Goa","9th - 90%"},
            {"Yashvi Patel","Jignesh Patel","63 C.G. Road, Ahmedabad","9th - 83%"},
            {"Zara Mirza","Farooq Mirza","21 Hazratganj, Lucknow","9th - 77%"},
            {"Abhishek Roy","Tapan Roy","57 Salt Lake, Kolkata","9th - 94%"},
            {"Bindu Nair","Suresh Nair","39 Vyttila, Kochi","9th - 68%"},
            {"Charu Lata","Rajeev Lata","75 Rajajinagar, Bangalore","9th - 88%"},
            {"Deepak Jha","Sunil Jha","16 Darbhanga Colony, Patna","9th - 79%"},
            {"Esha Malhotra","Kapil Malhotra","54 Punjabi Bagh, Delhi","9th - 91%"}
        };
        String[][] cls10B = {
            {"Faisal Siddiqui","Raza Siddiqui","28 Aminabad, Lucknow","9th - 85%"},
            {"Gauri Shankar","Mahesh Shankar","47 Jhotwara, Jaipur","9th - 73%"},
            {"Hitesh Tripathi","Arvind Tripathi","61 Allahpur, Allahabad","9th - 87%"},
            {"Indira Nambiar","Rajan Nambiar","35 Palakkad, Kerala","9th - 76%"},
            {"Jagannath Das","Bidhu Das","53 Bhubaneswar, Odisha","9th - 92%"},
            {"Kiran Bedi","Suresh Bedi","19 Rohini, Delhi","9th - 69%"},
            {"Lata Mangeshkar","Dinkar Mangeshkar","42 Versova, Mumbai","9th - 88%"},
            {"Manoj Tiwari","Ramesh Tiwari","68 Gorakhpur Road, UP","9th - 81%"},
            {"Namita Sharma","Vikram Sharma","26 Kamla Nagar, Agra","9th - 95%"},
            {"Ojas Mehta","Yash Mehta","70 Bodakdev, Ahmedabad","9th - 74%"}
        };

        List<Student> students8A  = seedStudents(cls8A,  "8A",  "A", clerk1, LocalDate.of(2026,6,1));
        List<Student> students9A  = seedStudents(cls9A,  "9A",  "A", clerk1, LocalDate.of(2026,6,1));
        List<Student> students9B  = seedStudents(cls9B,  "9B",  "B", clerk2, LocalDate.of(2026,6,2));
        List<Student> students10A = seedStudents(cls10A, "10A", "A", clerk2, LocalDate.of(2026,6,2));
        List<Student> students10B = seedStudents(cls10B, "10B", "B", clerk1, LocalDate.of(2026,6,3));

        // ── Fees ─────────────────────────────────────────────────────────────
        Random rnd = new Random(42);
        String[] feeTypes = {"Tuition Fee","Exam Fee","Library Fee","Sports Fee","Lab Fee"};
        double[] feeAmts  = {5000, 1500, 500, 800, 1200};
        List<Student> allStudents = new ArrayList<>();
        allStudents.addAll(students8A); allStudents.addAll(students9A); allStudents.addAll(students9B);
        allStudents.addAll(students10A); allStudents.addAll(students10B);

        for (Student s : allStudents) {
            // Tuition fee — everyone pays
            feeRepo.save(new FeePayment(null, s, 5000.0, LocalDate.of(2026,6,10), "Tuition Fee", "PAID", clerk1));
            // Random extra fee for ~70% students
            if (rnd.nextDouble() < 0.7) {
                int idx = 1 + rnd.nextInt(4);
                String status = rnd.nextDouble() < 0.75 ? "PAID" : "PENDING";
                feeRepo.save(new FeePayment(null, s, feeAmts[idx], LocalDate.of(2026,7,15), feeTypes[idx], status, clerk2));
            }
        }

        // ── Syllabus ─────────────────────────────────────────────────────────
        Map<String,String> mathSyl = Map.of(
            "8A","Real Numbers, Polynomials, Linear Equations, Quadrilaterals, Area, Circles, Constructions, Trigonometry, Statistics",
            "9A","Number Systems, Polynomials, Coordinate Geometry, Linear Equations, Lines and Angles, Triangles, Quadrilaterals, Circles",
            "9B","Number Systems, Polynomials, Coordinate Geometry, Linear Equations, Lines and Angles, Triangles, Quadrilaterals, Circles",
            "10A","Real Numbers, Polynomials, Pair of Linear Equations, Quadratic Equations, AP, Triangles, Coordinate Geometry, Trigonometry, Circles, Areas",
            "10B","Real Numbers, Polynomials, Pair of Linear Equations, Quadratic Equations, AP, Triangles, Coordinate Geometry, Trigonometry, Circles, Areas"
        );
        Map<String,String> sciSyl = Map.of(
            "8A","Crop Production, Microorganisms, Materials, Coal and Petroleum, Combustion, Cell, Reproduction, Force, Friction, Sound, Chemical Effects",
            "9A","Matter, Is Matter Around Us Pure, Atoms and Molecules, Cell, Tissues, Motion, Force and Laws, Gravitation, Work and Energy, Sound",
            "9B","Matter, Is Matter Around Us Pure, Atoms and Molecules, Cell, Tissues, Motion, Force and Laws, Gravitation, Work and Energy, Sound",
            "10A","Chemical Reactions, Acids Bases Salts, Metals, Carbon, Periodic Classification, Life Processes, Control and Coordination, Reproduction, Heredity, Light, Electricity, Magnetic Effects",
            "10B","Chemical Reactions, Acids Bases Salts, Metals, Carbon, Periodic Classification, Life Processes, Control and Coordination, Reproduction, Heredity, Light, Electricity, Magnetic Effects"
        );
        Map<String,String> engSyl = Map.of(
            "8A","Honeydew: The Best Christmas Present, The Tsunami, Glimpses of the Past; It So Happened; Grammar: Tenses, Voice, Reported Speech, Clauses",
            "9A","Beehive: The Fun They Had, The Sound of Music, The Little Girl; Moments; Grammar: Tenses, Modals, Subject-Verb, Determiners",
            "9B","Beehive: The Fun They Had, The Sound of Music, The Little Girl; Moments; Grammar: Tenses, Modals, Subject-Verb, Determiners",
            "10A","First Flight: A Letter to God, Nelson Mandela, Two Stories about Flying; Footprints; Grammar: Gap Filling, Editing, Reordering",
            "10B","First Flight: A Letter to God, Nelson Mandela, Two Stories about Flying; Footprints; Grammar: Gap Filling, Editing, Reordering"
        );
        Map<String,String> hinSyl = Map.of(
            "8A","वसंत: ध्वनि, लाख की चूड़ियाँ, बस की यात्रा; व्याकरण: संधि, समास, अलंकार, रस",
            "9A","क्षितिज: दो बैलों की कथा, ल्हासा की ओर, उपभोक्तावाद; व्याकरण: शब्द, पद, वाक्य, अलंकार, छंद",
            "9B","क्षितिज: दो बैलों की कथा, ल्हासा की ओर, उपभोक्तावाद; व्याकरण: शब्द, पद, वाक्य, अलंकार, छंद",
            "10A","क्षितिज-2: सूरदास, तुलसीदास, देव; व्याकरण: पद परिचय, रचना के आधार पर वाक्य रूपांतरण",
            "10B","क्षितिज-2: सूरदास, तुलसीदास, देव; व्याकरण: पद परिचय, रचना के आधार पर वाक्य रूपांतरण"
        );
        Map<String,String> sstSyl = Map.of(
            "8A","How, When and Where; From Trade to Territory; Ruling the Countryside; Geography: Resources, Land, Soil, Water, Natural Vegetation; Civics: Constitution",
            "9A","French Revolution, Socialism in Europe, Nazism, Forest Society, Pastoralists; Geography: India Size and Location, Physical Features; Civics: Democracy",
            "9B","French Revolution, Socialism in Europe, Nazism, Forest Society, Pastoralists; Geography: India Size and Location, Physical Features; Civics: Democracy",
            "10A","Nationalism in Europe, Nationalism in India, The Making of a Global World; Geography: Resources, Forest, Water, Agriculture; Civics: Power Sharing",
            "10B","Nationalism in Europe, Nationalism in India, The Making of a Global World; Geography: Resources, Forest, Water, Agriculture; Civics: Power Sharing"
        );
        String[] clss = {"8A","9A","9B","10A","10B"};
        for (String c : clss) {
            sy(c, "Mathematics",    mathSyl.get(c), t1);
            sy(c, "Science",        sciSyl.get(c),  t2);
            sy(c, "English",        engSyl.get(c),  t3);
            sy(c, "Hindi",          hinSyl.get(c),  t4);
            sy(c, "Social Studies", sstSyl.get(c),  t5);
        }

        // ── Schedule (Mon–Fri, 6 periods each class) ─────────────────────────
        String[] days = {"Monday","Tuesday","Wednesday","Thursday","Friday"};
        Object[][] slots = {
            {1,"Mathematics",t1}, {2,"Science",t2}, {3,"English",t3},
            {4,"Hindi",t4}, {5,"Social Studies",t5}, {6,"Computer Science",t6}
        };
        for (String c : clss) {
            for (String day : days) {
                for (Object[] slot : slots) {
                    scheduleRepo.save(new ClassSchedule(null, c, (String)slot[1], day, (Integer)slot[0], (User)slot[2]));
                }
            }
        }

        // ── Attendance — last 20 school days ─────────────────────────────────
        List<LocalDate> schoolDays = last20SchoolDays();
        for (Student s : allStudents) {
            for (LocalDate d : schoolDays) {
                boolean present = rnd.nextDouble() < attendanceProb(s.getPreviousClassPerformance());
                attendanceRepo.save(new Attendance(null, s, d, present, t1));
            }
        }

        // ── Performance — 3 exam rounds × 3 subjects ─────────────────────────
        String[] exams    = {"Unit Test 1", "Mid Term", "Unit Test 2"};
        String[] subjects = {"Mathematics", "Science", "English"};
        User[]   recBy    = {t1, t2, t3};
        for (Student s : allStudents) {
            double base = baseScore(s.getPreviousClassPerformance());
            for (int ei = 0; ei < exams.length; ei++) {
                for (int si = 0; si < subjects.length; si++) {
                    double score = Math.min(100, Math.max(30, base + (rnd.nextGaussian() * 10)));
                    performanceRepo.save(new Performance(null, s, subjects[si], exams[ei],
                            Math.round(score * 10.0) / 10.0, 100.0,
                            LocalDate.of(2026, 7 + ei, 10 + si), recBy[si]));
                }
            }
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private User u(String name, String username, String password, User.Role role) {
        return userRepo.save(new User(null, name, username, encoder.encode(password), role));
    }

    private List<Student> seedStudents(String[][] data, String cls, String section,
                                        User clerk, LocalDate admDate) {
        List<Student> result = new ArrayList<>();
        for (String[] row : data) {
            Student s = studentRepo.save(new Student(null, row[0], row[1], row[2], cls, section, row[3], admDate, null, null));
            admissionRepo.save(new Admission(null, s, clerk, admDate, "APPROVED"));
            result.add(s);
        }
        return result;
    }

    private void sy(String cls, String subject, String content, User teacher) {
        syllabusRepo.save(new Syllabus(null, cls, subject, content, LocalDateTime.now(), teacher));
    }

    private List<LocalDate> last20SchoolDays() {
        List<LocalDate> days = new ArrayList<>();
        LocalDate d = LocalDate.now().minusDays(1);
        while (days.size() < 20) {
            if (d.getDayOfWeek() != DayOfWeek.SATURDAY && d.getDayOfWeek() != DayOfWeek.SUNDAY) {
                days.add(d);
            }
            d = d.minusDays(1);
        }
        return days;
    }

    private double attendanceProb(String prevPerf) {
        if (prevPerf == null) return 0.85;
        try {
            Matcher m = Pattern.compile("(\\d+)%").matcher(prevPerf);
            if (m.find()) {
                int pct = Integer.parseInt(m.group(1));
                return 0.70 + (pct / 100.0) * 0.25;
            }
        } catch (Exception e) { /* fall through */ }
        return 0.85;
    }

    private double baseScore(String prevPerf) {
        if (prevPerf == null) return 70;
        try {
            Matcher m = Pattern.compile("(\\d+)%").matcher(prevPerf);
            if (m.find()) return Integer.parseInt(m.group(1));
        } catch (Exception e) { /* fall through */ }
        return 70;
    }
}
