package com.example.demo.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(origins = {
        "https://inventory-management-system-kumadun.vercel.app/"
},
        methods = {
                RequestMethod.GET
        })
public class HomeController {

    @GetMapping("/")
    public String index() {
        return "Greetings from Spring Boot!";
    }
}
