package com.example.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;


@SpringBootApplication
public class DemoApplication {

	public static void main(String[] args) {
		SpringApplication.run(DemoApplication.class, args);
		System.out.println("Welcome to the inventory management system");
	}
	//TODO some key methods need to return boolean to indicate operation result
	//TODO service layer need to catch exception thrown by DAO layer if db action fails
	//TODO after creating table, need to wait some time before it's ready, use aws waiter
	//TODO write Readme including bais maven configuration, EB deployment
}
