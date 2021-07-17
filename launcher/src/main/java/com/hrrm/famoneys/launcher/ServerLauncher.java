package com.hrrm.famoneys.launcher;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = { "com.hrrm.famoneys" })
public class ServerLauncher {

    public static void main(String[] args) {
        SpringApplication.run(ServerLauncher.class, args);
    }

}
