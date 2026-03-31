package com.maternalcare.repositories;

import com.maternalcare.entities.User;
import com.maternalcare.entities.UserRole;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    List<User> findByRole(UserRole role);
    Optional<User> findByEmailAndPassword(String email, String password);
    long countByRole(UserRole role);
}
