package com.browseback;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Main Spring Boot Application entrypoint for BrowseBack DSA Backend.
 * Connects the React web research manager to the core DSA engine (Units I, II, III).
 */
@SpringBootApplication
public class BrowseBackApplication {

    public static void main(String[] args) {
        SpringApplication.run(BrowseBackApplication.class, args);
    }
}
