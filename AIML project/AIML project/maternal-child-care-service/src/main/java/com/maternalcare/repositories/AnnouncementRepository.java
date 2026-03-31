package com.maternalcare.repositories;

import com.maternalcare.entities.Announcement;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {
    List<Announcement> findAllByOrderByPostedAtDesc();
    List<Announcement> findByTargetInOrderByPostedAtDesc(List<String> targets);
}
