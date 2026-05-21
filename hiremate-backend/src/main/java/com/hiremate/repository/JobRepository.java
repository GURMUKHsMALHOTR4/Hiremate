package com.hiremate.repository;

import com.hiremate.model.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobRepository extends JpaRepository<Job, Long> {

    // ✅ Get all jobs for a given employer's ID via the employer relationship
    List<Job> findByEmployer_Id(Long employerId); // This is the correct method

    // ✅ Search jobs by title (case-insensitive)
    List<Job> findByTitleContainingIgnoreCase(String title);
}
