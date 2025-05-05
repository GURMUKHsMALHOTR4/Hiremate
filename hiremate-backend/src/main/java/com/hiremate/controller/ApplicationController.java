package com.hiremate.controller;

import com.hiremate.model.Application;
import com.hiremate.model.User;
import com.hiremate.repository.ApplicationRepository;
import com.hiremate.repository.JobRepository;
import com.hiremate.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.net.MalformedURLException;
import java.util.*;

@RestController
@RequestMapping("/api/applications")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class ApplicationController {

    private static final String RESUME_UPLOAD_DIR =
            System.getProperty("user.dir") + File.separator + "uploads" + File.separator + "resumes";

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JobRepository jobRepository;

    // ✅ Apply to job with resume
    @PostMapping("/apply")
    public ResponseEntity<?> applyToJob(
            @RequestParam("userId") Long userId,
            @RequestParam("jobId") Long jobId,
            @RequestParam("resume") MultipartFile resume,
            HttpServletRequest request
    ) {
        System.out.println("🔁 Applying to job " + jobId + " by user " + userId);

        if (!userRepository.existsById(userId)) {
            return ResponseEntity.badRequest().body("❌ User not found");
        }

        if (!jobRepository.existsById(jobId)) {
            return ResponseEntity.badRequest().body("❌ Job not found");
        }

        boolean alreadyApplied = applicationRepository.findByUserId(userId)
                .stream()
                .anyMatch(app -> app.getJobId().equals(jobId));

        if (alreadyApplied) {
            return ResponseEntity.badRequest().body("❌ You have already applied to this job.");
        }

        String originalFilename = StringUtils.cleanPath(Objects.requireNonNull(resume.getOriginalFilename()));
        String uniqueFilename = UUID.randomUUID() + "_" + originalFilename;

        File uploadDir = new File(RESUME_UPLOAD_DIR);
        if (!uploadDir.exists() && !uploadDir.mkdirs()) {
            return ResponseEntity.status(500).body("❌ Failed to create upload directory");
        }

        File destination = new File(uploadDir, uniqueFilename);
        try {
            resume.transferTo(destination);
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("❌ Failed to save resume: " + e.getMessage());
        }

        Application app = new Application();
        app.setUserId(userId);
        app.setJobId(jobId);
        app.setResumeFilename(uniqueFilename);
        app.setStatus("PENDING");

        applicationRepository.save(app);

        return ResponseEntity.ok("✅ Application submitted successfully");
    }

    // ✅ Serve uploaded resume
    @GetMapping("/resume/{filename:.+}")
    public ResponseEntity<?> getResume(@PathVariable String filename) {
        File file = new File(RESUME_UPLOAD_DIR + File.separator + filename);
        if (!file.exists()) {
            return ResponseEntity.notFound().build();
        }

        try {
            Resource resource = new UrlResource(file.toURI());
            return ResponseEntity.ok()
                    .header("Content-Disposition", "attachment; filename=\"" + file.getName() + "\"")
                    .body(resource);
        } catch (MalformedURLException e) {
            return ResponseEntity.status(500).body("❌ Error loading file: " + e.getMessage());
        }
    }

    // ✅ Get all applications
    @GetMapping("/all")
    public ResponseEntity<List<Application>> getAllApplications() {
        return ResponseEntity.ok(applicationRepository.findAll());
    }

    // ✅ Get applications by user ID
    @GetMapping("/byUser/{userId}")
    public ResponseEntity<List<Application>> getByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(applicationRepository.findByUserId(userId));
    }

    // ✅ Get applicants by job ID (for recruiters)
    @GetMapping("/byJob/{jobId}")
    public ResponseEntity<List<Map<String, Object>>> getByJobId(@PathVariable Long jobId) {
        List<Application> apps = applicationRepository.findByJobId(jobId);
        List<Map<String, Object>> results = new ArrayList<>();

        for (Application app : apps) {
            Optional<User> userOpt = userRepository.findById(app.getUserId());
            userOpt.ifPresent(user -> {
                Map<String, Object> data = new HashMap<>();
                data.put("applicationId", app.getId());
                data.put("name", user.getUsername());
                data.put("email", user.getEmail());
                data.put("status", app.getStatus());
                data.put("resumeFilename", app.getResumeFilename());
                results.add(data);
            });
        }

        return ResponseEntity.ok(results);
    }

    // ✅ Accept or Reject application
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestParam("status") String status) {
        Optional<Application> appOpt = applicationRepository.findById(id);
        if (appOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("❌ Application not found");
        }

        String normalizedStatus = status.toUpperCase();
        if (!normalizedStatus.equals("ACCEPTED") && !normalizedStatus.equals("REJECTED")) {
            return ResponseEntity.badRequest().body("❌ Status must be ACCEPTED or REJECTED");
        }

        Application app = appOpt.get();
        app.setStatus(normalizedStatus);
        applicationRepository.save(app);

        return ResponseEntity.ok("✅ Application status updated to " + normalizedStatus);
    }

    // ✅ Cancel application by ID (Job Seeker)
    @DeleteMapping("/{applicationId}")
    public ResponseEntity<?> cancelApplication(@PathVariable Long applicationId) {
        Optional<Application> applicationOpt = applicationRepository.findById(applicationId);
        if (applicationOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("❌ Application not found");
        }

        applicationRepository.deleteById(applicationId);
        return ResponseEntity.ok("✅ Application cancelled successfully");
    }
}
