package com.example.demo.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(origins = {
        "inventory-management-system-8bit.vercel.app/"
},
        methods = {
                RequestMethod.GET
        })
//@CrossOrigin(origins = "*")
public class HomeController {

    @GetMapping("/")
    public String index() {
        return "Greetings from Spring Boot!";
    }
}
