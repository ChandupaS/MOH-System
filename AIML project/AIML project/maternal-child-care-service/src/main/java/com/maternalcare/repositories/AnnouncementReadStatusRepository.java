package com.maternalcare.repositories;

import com.maternalcare.entities.AnnouncementReadStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface AnnouncementReadStatusRepository extends JpaRepository<AnnouncementReadStatus, Long> {
    Optional<AnnouncementReadStatus> findByMidwifeIdAndAnnouncementId(Long midwifeId, Long announcementId);
    List<AnnouncementReadStatus> findByMidwifeId(Long midwifeId);
}
