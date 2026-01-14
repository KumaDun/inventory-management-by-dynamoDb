package com.example.demo;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test") // Add to specify this as test profile
class DemoApplicationTests {

	@Test
	void contextLoads() {
	}

}
