package com.browseback.repository;

import com.browseback.entity.ResourceEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ResourceRepository extends JpaRepository<ResourceEntity, String> {

    Optional<ResourceEntity> findByUrlIgnoreCase(String url);

    boolean existsByUrlIgnoreCase(String url);

    boolean existsByUrlIgnoreCaseAndIdNot(String url, String id);
}
