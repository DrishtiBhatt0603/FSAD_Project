package com.school.config;

import com.school.entity.*;
import com.school.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.DayOfWeek;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
@Order(1) // seed data first; TeacherAssignmentInitializer (@Order 2) assigns classes after
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

        // Class 8 students → came from Class 7
        String[][] cls8B = {
            {"Aryan Kapoor","Vijay Kapoor","12 Lajpat Nagar, Delhi","7th - 80%"},
            {"Bhoomi Shah","Nilesh Shah","34 Satellite, Ahmedabad","7th - 88%"},
            {"Chirag Rana","Mahesh Rana","56 Model Town, Jalandhar","7th - 74%"},
            {"Diya Kulkarni","Prasad Kulkarni","23 Kothrud, Pune","7th - 91%"},
            {"Eshan Ghosh","Tapas Ghosh","78 Behala, Kolkata","7th - 69%"},
            {"Falguni Rao","Srinivas Rao","34 Jubilee Hills, Hyderabad","7th - 85%"},
            {"Gautam Menon","Ravi Menon","67 Adyar, Chennai","7th - 77%"},
            {"Hina Sheikh","Aslam Sheikh","89 Charminar, Hyderabad","7th - 93%"},
            {"Ivan Dsouza","Peter Dsouza","101 Bandra, Mumbai","7th - 72%"},
            {"Jiya Agarwal","Mohan Agarwal","14 Civil Lines, Jaipur","7th - 90%"}
        };

        List<Student> students8A  = seedStudents(cls8A,  "8A",  "A", clerk1, LocalDate.of(2026,6,1));
        List<Student> students8B  = seedStudents(cls8B,  "8B",  "B", clerk2, LocalDate.of(2026,6,1));
        List<Student> students9A  = seedStudents(cls9A,  "9A",  "A", clerk1, LocalDate.of(2026,6,1));
        List<Student> students9B  = seedStudents(cls9B,  "9B",  "B", clerk2, LocalDate.of(2026,6,2));
        List<Student> students10A = seedStudents(cls10A, "10A", "A", clerk2, LocalDate.of(2026,6,2));
        List<Student> students10B = seedStudents(cls10B, "10B", "B", clerk1, LocalDate.of(2026,6,3));

        // ── Fees ─────────────────────────────────────────────────────────────
        Random rnd = new Random(42);
        String[] feeTypes = {"Tuition Fee","Exam Fee","Library Fee","Sports Fee","Lab Fee"};
        double[] feeAmts  = {5000, 1500, 500, 800, 1200};
        List<Student> allStudents = new ArrayList<>();
        allStudents.addAll(students8A); allStudents.addAll(students8B); allStudents.addAll(students9A);
        allStudents.addAll(students9B); allStudents.addAll(students10A); allStudents.addAll(students10B);

        for (Student s : allStudents) {
            // Tuition fee — everyone pays
            feeRepo.save(new FeePayment(null, s, 5000.0, LocalDate.of(2026,6,10), "Tuition Fee", "PAID", null, clerk1));
            // Random extra fee for ~70% students
            if (rnd.nextDouble() < 0.7) {
                int idx = 1 + rnd.nextInt(4);
                String status = rnd.nextDouble() < 0.75 ? "PAID" : "PENDING";
                feeRepo.save(new FeePayment(null, s, feeAmts[idx], LocalDate.of(2026,7,15), feeTypes[idx], status, null, clerk2));
            }
        }

        // ── Syllabus — 9 subjects per class, grade-appropriate content ───────
        String[] clss = {"8A","8B","9A","9B","10A","10B"};
        // Each subject carries content for grades 8, 9 and 10; the right one is
        // chosen per class from the class's grade number.
        Object[][] syllabusSubjects = {
            {"Mathematics", t1, Map.of(
                "8","Rational Numbers, Linear Equations in One Variable, Understanding Quadrilaterals, Data Handling, Squares and Square Roots, Cubes and Cube Roots, Comparing Quantities, Algebraic Expressions, Mensuration, Exponents and Powers, Direct and Inverse Proportions, Factorisation",
                "9","Number Systems, Polynomials, Coordinate Geometry, Linear Equations in Two Variables, Euclid's Geometry, Lines and Angles, Triangles, Quadrilaterals, Areas of Parallelograms, Circles, Constructions, Heron's Formula, Surface Areas and Volumes, Statistics, Probability",
                "10","Real Numbers, Polynomials, Pair of Linear Equations, Quadratic Equations, Arithmetic Progressions, Triangles, Coordinate Geometry, Introduction to Trigonometry, Applications of Trigonometry, Circles, Areas Related to Circles, Surface Areas and Volumes, Statistics, Probability")},
            {"Hindi", t4, Map.of(
                "8","वसंत भाग-3: ध्वनि, लाख की चूड़ियाँ, बस की यात्रा, दीवानों की हस्ती, चिट्ठियों की अनूठी दुनिया; व्याकरण: संधि, समास, अलंकार, वाक्य भेद",
                "9","क्षितिज भाग-1: दो बैलों की कथा, ल्हासा की ओर, उपभोक्तावाद की संस्कृति; कृतिका; व्याकरण: शब्द एवं पद, उपसर्ग-प्रत्यय, अलंकार, छंद",
                "10","क्षितिज भाग-2: सूरदास, तुलसीदास, देव, जयशंकर प्रसाद, निराला; कृतिका; व्याकरण: पद परिचय, रचना के आधार पर वाक्य रूपांतरण, समास, मुहावरे")},
            {"English", t3, Map.of(
                "8","Honeydew: The Best Christmas Present, The Tsunami, Glimpses of the Past, Bepin Choudhury's Lapse of Memory; It So Happened; Grammar: Tenses, Modals, Voice, Reported Speech; Writing: Letters, Paragraphs",
                "9","Beehive: The Fun They Had, The Sound of Music, The Little Girl, A Truly Beautiful Mind; Moments; Grammar: Tenses, Modals, Subject-Verb Concord, Determiners; Writing: Descriptive, Story",
                "10","First Flight: A Letter to God, Nelson Mandela, Two Stories about Flying, From the Diary of Anne Frank; Footprints Without Feet; Grammar: Gap Filling, Editing, Reordering; Writing: Formal Letter, Analytical Paragraph")},
            {"Geography", t5, Map.of(
                "8","Resources, Land Soil Water Natural Vegetation and Wildlife Resources, Mineral and Power Resources, Agriculture, Industries, Human Resources",
                "9","India Size and Location, Physical Features of India, Drainage, Climate, Natural Vegetation and Wildlife, Population",
                "10","Resources and Development, Forest and Wildlife Resources, Water Resources, Agriculture, Minerals and Energy Resources, Manufacturing Industries, Lifelines of National Economy")},
            {"History", t5, Map.of(
                "8","How When and Where, From Trade to Territory, Ruling the Countryside, Tribals Dikus and the Vision of a Golden Age, When People Rebel 1857, Weavers Iron Smelters and Factory Owners, Civilising the Native",
                "9","The French Revolution, Socialism in Europe and the Russian Revolution, Nazism and the Rise of Hitler, Forest Society and Colonialism, Pastoralists in the Modern World",
                "10","The Rise of Nationalism in Europe, Nationalism in India, The Making of a Global World, The Age of Industrialisation, Print Culture and the Modern World")},
            {"Civics", t5, Map.of(
                "8","The Indian Constitution, Understanding Secularism, Why Do We Need a Parliament, Understanding Laws, Judiciary, Understanding Marginalisation, Public Facilities, Law and Social Justice",
                "9","What is Democracy Why Democracy, Constitutional Design, Electoral Politics, Working of Institutions, Democratic Rights",
                "10","Power Sharing, Federalism, Gender Religion and Caste, Political Parties, Outcomes of Democracy")},
            {"Physics", t2, Map.of(
                "8","Force and Pressure, Friction, Sound, Chemical Effects of Electric Current, Some Natural Phenomena, Light, Stars and the Solar System",
                "9","Motion, Force and Laws of Motion, Gravitation, Work and Energy, Sound",
                "10","Light Reflection and Refraction, The Human Eye and the Colourful World, Electricity, Magnetic Effects of Electric Current, Sources of Energy")},
            {"Chemistry", t2, Map.of(
                "8","Synthetic Fibres and Plastics, Materials Metals and Non-Metals, Coal and Petroleum, Combustion and Flame, Pollution of Air and Water",
                "9","Matter in Our Surroundings, Is Matter Around Us Pure, Atoms and Molecules, Structure of the Atom",
                "10","Chemical Reactions and Equations, Acids Bases and Salts, Metals and Non-metals, Carbon and its Compounds, Periodic Classification of Elements")},
            {"Biology", t6, Map.of(
                "8","Crop Production and Management, Microorganisms Friend and Foe, Conservation of Plants and Animals, Cell Structure and Functions, Reproduction in Animals, Reaching the Age of Adolescence",
                "9","The Fundamental Unit of Life Cell, Tissues, Improvement in Food Resources, Natural Resources",
                "10","Life Processes, Control and Coordination, How do Organisms Reproduce, Heredity and Evolution, Our Environment, Management of Natural Resources")}
        };
        for (String c : clss) {
            String grade = c.replaceAll("[^0-9]", "");
            for (Object[] subj : syllabusSubjects) {
                @SuppressWarnings("unchecked")
                Map<String,String> byGrade = (Map<String,String>) subj[2];
                sy(c, (String) subj[0], byGrade.get(grade), (User) subj[1]);
            }
        }

        // ── Schedule (Mon–Fri, 6 periods each class) ─────────────────────────
        String[] days = {"Monday","Tuesday","Wednesday","Thursday","Friday"};
        Object[][] slots = {
            {1,"Mathematics",t1}, {2,"Physics",t2}, {3,"English",t3},
            {4,"Hindi",t4}, {5,"History",t5}, {6,"Biology",t6}
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

        // ── Performance — 3 exam rounds × 9 subjects (matches the syllabus) ──
        String[] exams    = {"Unit Test 1", "Mid Term", "Unit Test 2"};
        String[] subjects = {"Mathematics","Hindi","English","Geography","History","Civics","Physics","Chemistry","Biology"};
        User[]   recBy    = {t1, t4, t3, t5, t5, t5, t2, t2, t6};
        for (Student s : allStudents) {
            double base = baseScore(s.getPreviousClassPerformance());
            for (int ei = 0; ei < exams.length; ei++) {
                for (int si = 0; si < subjects.length; si++) {
                    double score = Math.min(100, Math.max(30, base + (rnd.nextGaussian() * 10)));
                    performanceRepo.save(new Performance(null, s, subjects[si], exams[ei],
                            Math.round(score * 10.0) / 10.0, 100.0,
                            LocalDate.of(2026, 7 + ei, 10 + (si % 18)), recBy[si]));
                }
            }
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private User u(String name, String username, String password, User.Role role) {
        return userRepo.save(new User(null, name, username, encoder.encode(password), role, null));
    }

    private List<Student> seedStudents(String[][] data, String cls, String section,
                                        User clerk, LocalDate admDate) {
        List<Student> result = new ArrayList<>();
        for (String[] row : data) {
            String email = row[0].toLowerCase().replaceAll("[^a-z ]", "").trim().replace(" ", ".") + "@example.com";
            Student s = studentRepo.save(new Student(null, row[0], row[1], row[2], cls, section, row[3], admDate, email, null));
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
