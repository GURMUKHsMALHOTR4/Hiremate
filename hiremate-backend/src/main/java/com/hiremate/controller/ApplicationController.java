package com.hiremate.controller;

import com.hiremate.model.Application;
import com.hiremate.model.Job;
import com.hiremate.model.User;
import com.hiremate.repository.ApplicationRepository;
import com.hiremate.repository.JobRepository;
import com.hiremate.repository.UserRepository;
import com.hiremate.security.CustomUserDetails;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import java.io.File;
import java.io.IOException;
import java.net.MalformedURLException;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/applications")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class ApplicationController {

    private static final String RESUME_UPLOAD_DIR =
        System.getProperty("user.dir") + File.separator + "uploads" + File.separator + "resumes";

    @Autowired private ApplicationRepository applicationRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private JobRepository jobRepository;

    // ✅ Apply to job with resume
    @PostMapping("/apply")
    public ResponseEntity<?> applyToJob(
            @RequestParam("jobId") Long jobId,
            @RequestParam("resume") MultipartFile resume,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long userId = userDetails.getId();

        if (userRepository.findById(userId).isEmpty()) {
            return ResponseEntity.badRequest().body("❌ User not found");
        }
        if (!jobRepository.existsById(jobId)) {
            return ResponseEntity.badRequest().body("❌ Job not found");
        }

        List<Application> previousApps = applicationRepository.findByUserId(userId)
            .stream()
            .filter(app -> app.getJobId().equals(jobId))
            .toList();

        boolean hasPendingOrAccepted = previousApps.stream()
            .anyMatch(app -> !app.getStatus().equalsIgnoreCase("REJECTED"));

        if (hasPendingOrAccepted) {
            return ResponseEntity.badRequest().body("❌ You have already applied to this job.");
        }

        previousApps.stream()
            .filter(app -> app.getStatus().equalsIgnoreCase("REJECTED"))
            .forEach(applicationRepository::delete);

        String originalFilename = StringUtils.cleanPath(
            Objects.requireNonNull(resume.getOriginalFilename())
        );
        String uniqueFilename = UUID.randomUUID() + "_" + originalFilename;
        File uploadDir = new File(RESUME_UPLOAD_DIR);
        if (!uploadDir.exists() && !uploadDir.mkdirs()) {
            return ResponseEntity.status(500).body("❌ Failed to create upload directory");
        }
        File destination = new File(uploadDir, uniqueFilename);
        try {
            resume.transferTo(destination);
        } catch (IOException e) {
            return ResponseEntity.status(500).body("❌ Failed to save resume: " + e.getMessage());
        }

        Application app = new Application();
        app.setUserId(userId);
        app.setJobId(jobId);
        app.setResumeFilename(uniqueFilename);
        app.setStatus("PENDING");
        app.setViewed(false);
        applicationRepository.save(app);

        return ResponseEntity.ok("✅ Application submitted successfully");
    }

    // ✅ Resume Download
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

    // ✅ Admin: all applications
    @GetMapping("/all")
    public ResponseEntity<List<Application>> getAllApplications() {
        return ResponseEntity.ok(applicationRepository.findAll());
    }

    // ✅ Job Seeker: Applications by user
    @GetMapping("/byUser/{userId}")
    public ResponseEntity<List<Map<String, Object>>> getByUserId(@PathVariable Long userId) {
        List<Application> apps = applicationRepository.findByUserId(userId);
        List<Map<String, Object>> response = new ArrayList<>();

        for (Application app : apps) {
            Map<String, Object> data = new HashMap<>();
            data.put("applicationId", app.getId());
            data.put("status", app.getStatus());
            data.put("resumeFilename", app.getResumeFilename());
            data.put("jobId", app.getJobId());
            jobRepository.findById(app.getJobId()).ifPresent(job -> {
                data.put("jobTitle", job.getTitle());
                data.put("company", job.getCompany());
            });
            response.add(data);
        }
        return ResponseEntity.ok(response);
    }
    @GetMapping("/jobIdsByUser/{userId}")
public ResponseEntity<List<Long>> getAppliedJobIdsByUserId(@PathVariable Long userId) {
    List<Long> jobIds = applicationRepository.findByUserId(userId)
        .stream()
        .filter(app -> !app.getStatus().equalsIgnoreCase("REJECTED"))
        .map(Application::getJobId)
        .distinct()
        .collect(Collectors.toList());
    return ResponseEntity.ok(jobIds);
}


    // ✅ Job Seeker: Get applied jobIds (only non-rejected)
    @GetMapping("/jobIdsByUser")
    public ResponseEntity<List<Long>> getAppliedJobIdsByUser(@AuthenticationPrincipal CustomUserDetails userDetails) {
        Long userId = userDetails.getId();
        List<Long> jobIds = applicationRepository.findByUserId(userId)
            .stream()
            .filter(app -> !app.getStatus().equalsIgnoreCase("REJECTED"))
            .map(Application::getJobId)
            .distinct()
            .collect(Collectors.toList());
        return ResponseEntity.ok(jobIds);
    }

    // ✅ Recruiter: Get applicants per job
    @GetMapping("/byJob/{jobId}")
    public ResponseEntity<List<Map<String, Object>>> getByJobId(@PathVariable Long jobId) {
        List<Application> apps = applicationRepository.findByJobId(jobId);
        List<Map<String, Object>> results = new ArrayList<>();

        for (Application app : apps) {
            userRepository.findById(app.getUserId()).ifPresent(user -> {
                if (!app.isViewed()) {
                    app.setViewed(true);
                    applicationRepository.save(app);
                }
                Map<String, Object> data = new HashMap<>();
                data.put("applicationId", app.getId());
                data.put("userId", user.getId());
                data.put("username", user.getUsername());
                data.put("name", "@" + user.getUsername());
                data.put("email", user.getEmail());
                data.put("status", app.getStatus());
                data.put("resumeFilename", app.getResumeFilename());
                results.add(data);
            });
        }
        return ResponseEntity.ok(results);
    }

    // ✅ Recruiter: Update application status
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestParam("status") String status) {
        Optional<Application> opt = applicationRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.badRequest().body("❌ Application not found");
        }
        String up = status.toUpperCase();
        if (!up.equals("ACCEPTED") && !up.equals("REJECTED")) {
            return ResponseEntity.badRequest().body("❌ Status must be ACCEPTED or REJECTED");
        }
        Application app = opt.get();
        app.setStatus(up);
        applicationRepository.save(app);
        return ResponseEntity.ok("✅ Application status updated to " + up);
    }

    // ✅ Job Seeker: Cancel application
    @DeleteMapping("/{applicationId}")
    public ResponseEntity<?> cancelApplication(@PathVariable Long applicationId) {
        if (applicationRepository.findById(applicationId).isEmpty()) {
            return ResponseEntity.badRequest().body("❌ Application not found");
        }
        applicationRepository.deleteById(applicationId);
        return ResponseEntity.ok("✅ Application cancelled successfully");
    }

    // ✅ Job Seeker: Get accepted recruiters to chat with
    @GetMapping("/chat-eligible-recruiters/{userId}")
    public ResponseEntity<List<Map<String, Object>>> getChatEligibleRecruiters(@PathVariable Long userId) {
        List<Application> acceptedApps = applicationRepository.findByUserIdAndStatus(userId, "ACCEPTED");

        List<Map<String, Object>> recruiters = acceptedApps.stream().map(app -> {
            Job job = jobRepository.findById(app.getJobId()).orElse(null);
            if (job == null) return null;
            User recruiter = userRepository.findById(job.getEmployerId()).orElse(null);
            if (recruiter == null) return null;

            Map<String, Object> map = new HashMap<>();
            map.put("recruiterId", recruiter.getId());
            map.put("recruiterUsername", recruiter.getUsername());
            return map;
        }).filter(Objects::nonNull).collect(Collectors.toList());

        return ResponseEntity.ok(recruiters);
    }
}
