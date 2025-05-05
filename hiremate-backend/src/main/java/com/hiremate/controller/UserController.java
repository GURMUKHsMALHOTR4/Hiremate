package com.hiremate.controller;

import com.hiremate.dto.LoginRequest;
import com.hiremate.model.User;
import com.hiremate.repository.UserRepository;
import com.hiremate.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class UserController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    // ✅ Register a new user
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        System.out.println("📩 Incoming registration payload: " + user);

        Optional<User> existingUsername = userRepository.findByUsername(user.getUsername());
        Optional<User> existingEmail = userRepository.findByEmail(user.getEmail());

        if (existingUsername.isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Username is already taken."));
        }

        if (existingEmail.isPresent()) {
            return ResponseEntity
                    .status(409) // Conflict
                    .body(Map.of("message", "Email is already registered."));
        }

        if (user.getRole() == null || user.getRole().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "User role is required."));
        }

        // ✅ Normalize role to uppercase
        String normalizedRole = user.getRole().trim().toUpperCase();
        user.setRole(normalizedRole);

        user.setPassword(passwordEncoder.encode(user.getPassword()));

        if ("RECRUITER".equals(normalizedRole)) {
            long employerId = userRepository.count() + 1;
            user.setEmployerId(employerId);
        }

        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "User registered successfully!"));
    }

    // ✅ Authenticate & return token + user info
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    request.getUsername(),
                    request.getPassword()
                )
            );

            String token = jwtUtil.generateToken(authentication.getName());
            Optional<User> optionalUser = userRepository.findByUsername(request.getUsername());

            if (optionalUser.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("message", "User not found"));
            }

            User user = optionalUser.get();

            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("userId", user.getId());
            response.put("username", user.getUsername());
            response.put("role", user.getRole());
            response.put("employerId", user.getEmployerId());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("❌ Authentication error: " + e.getMessage());
            return ResponseEntity.status(401).body(Map.of("message", "Invalid username or password"));
        }
    }
}
