package com.hiremate.repository;

import com.hiremate.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username); // ✅ already likely present
    Optional<User> findByEmail(String email);       // ✅ add this line
}
