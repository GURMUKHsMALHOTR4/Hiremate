package com.hiremate.controller;

import com.hiremate.model.Application;
import com.hiremate.model.Job;
import com.hiremate.model.User;
import com.hiremate.repository.ApplicationRepository;
import com.hiremate.repository.JobRepository;
import com.hiremate.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/jobs")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class JobController {

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

    // ✅ Create a new job
    @Transactional
    @PostMapping("/create")
    public ResponseEntity<?> createJob(@RequestBody Job job) {
        if (job.getEmployerId() == null) {
            return ResponseEntity.badRequest().body("Employer ID is required.");
        }

        Optional<User> employerOpt = userRepository.findById(job.getEmployerId());
        if (employerOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Employer not found for ID: " + job.getEmployerId());
        }

        Job savedJob = jobRepository.saveAndFlush(job);
        System.out.println("✅ Job created with ID: " + savedJob.getId());

        return ResponseEntity.ok("Job created successfully!");
    }

    // ✅ Get all jobs with applicants
    @GetMapping("/all")
    public ResponseEntity<List<Map<String, Object>>> getAllJobsWithApplicants() {
        List<Job> jobs = jobRepository.findAll();
        List<Map<String, Object>> response = new ArrayList<>();

        for (Job job : jobs) {
            Map<String, Object> jobData = new HashMap<>();
            jobData.put("id", job.getId());
            jobData.put("title", job.getTitle());
            jobData.put("description", job.getDescription());
            jobData.put("company", job.getCompany());
            jobData.put("location", job.getLocation());
            jobData.put("salary", job.getSalary());
            jobData.put("employerId", job.getEmployerId());

            List<Application> applications = applicationRepository.findByJobId(job.getId());
            List<Map<String, String>> applicants = new ArrayList<>();

            for (Application app : applications) {
                userRepository.findById(app.getUserId()).ifPresent(user -> {
                    Map<String, String> userInfo = new HashMap<>();
                    userInfo.put("name", user.getUsername());
                    userInfo.put("email", user.getEmail());
                    applicants.add(userInfo);
                });
            }

            jobData.put("applicants", applicants);
            response.add(jobData);
        }

        return ResponseEntity.ok(response);
    }

    // ✅ Get a job by its ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getJobById(@PathVariable Long id) {
        Optional<Job> jobOpt = jobRepository.findById(id);
        return jobOpt
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(404).body("Job not found with ID: " + id));
    }

    // ✅ Update job
    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateJob(@PathVariable Long id, @RequestBody Job updatedJob) {
        Optional<Job> jobOpt = jobRepository.findById(id);
        if (jobOpt.isEmpty()) {
            return ResponseEntity.status(404).body("Job not found with ID: " + id);
        }

        Job job = jobOpt.get();
        job.setTitle(updatedJob.getTitle());
        job.setDescription(updatedJob.getDescription());
        job.setLocation(updatedJob.getLocation());
        job.setCompany(updatedJob.getCompany());
        job.setSalary(updatedJob.getSalary());

        jobRepository.save(job);
        return ResponseEntity.ok("Job updated successfully!");
    }

    // ❌ Normal Delete with Applicant Check
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteJob(@PathVariable Long id) {
        Optional<Job> jobOpt = jobRepository.findById(id);
        if (jobOpt.isEmpty()) {
            return ResponseEntity.status(404).body("Job not found with ID: " + id);
        }

        List<Application> applications = applicationRepository.findByJobId(id);
        if (!applications.isEmpty()) {
            return ResponseEntity.badRequest().body("Cannot delete job — applicants have already applied.");
        }

        jobRepository.deleteById(id);
        return ResponseEntity.ok("Job deleted successfully!");
    }

    // ✅ Force Delete Job (with applicants)
    @DeleteMapping("/delete/force/{id}")
    public ResponseEntity<?> forceDeleteJob(@PathVariable Long id) {
        Optional<Job> jobOpt = jobRepository.findById(id);
        if (jobOpt.isEmpty()) {
            return ResponseEntity.status(404).body("Job not found with ID: " + id);
        }

        List<Application> applications = applicationRepository.findByJobId(id);
        if (!applications.isEmpty()) {
            applicationRepository.deleteAll(applications);
        }

        jobRepository.deleteById(id);
        return ResponseEntity.ok("Job and its applications deleted successfully!");
    }

    // ✅ Search jobs by title
    @GetMapping("/search")
    public ResponseEntity<List<Job>> searchJobs(@RequestParam String title) {
        return ResponseEntity.ok(jobRepository.findByTitleContainingIgnoreCase(title));
    }

    // ✅ Get jobs by employerId with applicants
    @GetMapping("/employer/{employerId}")
    public ResponseEntity<List<Map<String, Object>>> getJobsByEmployer(@PathVariable Long employerId) {
        List<Job> jobs = jobRepository.findByEmployerId(employerId);
        List<Map<String, Object>> response = new ArrayList<>();

        for (Job job : jobs) {
            Map<String, Object> jobData = new HashMap<>();
            jobData.put("id", job.getId());
            jobData.put("title", job.getTitle());
            jobData.put("description", job.getDescription());
            jobData.put("company", job.getCompany());
            jobData.put("location", job.getLocation());
            jobData.put("salary", job.getSalary());

            List<Application> applications = applicationRepository.findByJobId(job.getId());
            List<Map<String, String>> applicants = new ArrayList<>();

            for (Application app : applications) {
                userRepository.findById(app.getUserId()).ifPresent(user -> {
                    Map<String, String> userInfo = new HashMap<>();
                    userInfo.put("name", user.getUsername());
                    userInfo.put("email", user.getEmail());
                    applicants.add(userInfo);
                });
            }

            jobData.put("applicants", applicants);
            response.add(jobData);
        }

        return ResponseEntity.ok(response);
    }
}
