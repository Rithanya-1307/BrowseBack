package com.browseback.repository;

import com.browseback.entity.HistoryRecordEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HistoryRecordRepository extends JpaRepository<HistoryRecordEntity, String> {

    List<HistoryRecordEntity> findAllByOrderByTimestampAsc();

    long countByUrlIgnoreCase(String url);

    boolean existsByUrlAndTimestamp(String url, String timestamp);

    long countBySourceIgnoreCase(String source);
}

