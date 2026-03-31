package com.maternalcare.controllers;

import com.maternalcare.entities.User;
import com.maternalcare.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {
    @Autowired private UserService userService;
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        Optional<User> userOpt = userService.authenticate(credentials.get("email"), credentials.get("password"));
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            return ResponseEntity.ok(Map.of("id", user.getId(), "name", user.getName(), "email", user.getEmail(), "role", user.getRole().toString()));
        }
        return ResponseEntity.status(401).body("Invalid email or password.");
    }
}
