package com.maternalcare.services;

import com.maternalcare.entities.User;
import com.maternalcare.entities.UserRole;
import com.maternalcare.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public User saveUser(User user) {
        // In a real app, password should be hashed here
        return userRepository.save(user);
    }

    public Optional<User> authenticate(String email, String password) {
        return userRepository.findByEmail(email)
                .filter(user -> user.getPassword().equals(password));
    }

    public long getCountByRole(UserRole role) {
        return userRepository.countByRole(role);
    }
}
