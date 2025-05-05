package com.hiremate.repository;

import com.hiremate.model.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobRepository extends JpaRepository<Job, Long> {

    // ✅ Get all jobs for a given employerId
    List<Job> findByEmployerId(Long employerId);

    // ✅ Search jobs by title (case-insensitive)
    List<Job> findByTitleContainingIgnoreCase(String title);
}
