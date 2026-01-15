package com.example.demo.controller;

import com.example.demo.model.InventoryItem;
import com.example.demo.service.InventoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/items")
public class InventoryController {
    private final InventoryService inventoryService;

    @Autowired
    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @PostMapping("/add")
    public void putInventoryItem(@RequestBody InventoryItem item) {
        inventoryService.putInventoryItem(item);
    }

    @GetMapping("/{id}")
    public InventoryItem getInventoryItem(@PathVariable String id) {
        return inventoryService.getInventoryItem(id);  // Delegate the action to the service
    }
}
