package com.example.demo.controller;

import com.example.demo.model.InventoryItem;
import com.example.demo.service.InventoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("api/items")
@CrossOrigin(origins = {
        "https://inventory-management-system-kumadun.vercel.app/"
},
        methods = {
                RequestMethod.GET,
                RequestMethod.POST,
                RequestMethod.PATCH,
                RequestMethod.DELETE
        })
public class InventoryController {
    private final InventoryService inventoryService;

    @Autowired
    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @PostMapping("/post")
    public ResponseEntity<Optional<InventoryItem>> putInventoryItem(@RequestBody InventoryItem item) {
        Optional<InventoryItem> saved = inventoryService.putInventoryItem(item);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/get")
    public ResponseEntity<InventoryItem> getInventoryItem(@RequestParam String id) {
        Optional<InventoryItem> item = inventoryService.getInventoryItem(id); // Delegate the action to the service
        return item.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @GetMapping("/all")
    public ResponseEntity<Iterable<InventoryItem>> getAllInventoryItems() {
        System.out.println("InventoryController /all");
        return ResponseEntity.ok(inventoryService.getInventoryItems());
    }

    @PatchMapping("/patch")
    public ResponseEntity<InventoryItem> updateInventoryItem(@RequestBody InventoryItem item) {
        Optional<InventoryItem> updated = inventoryService.updateInventoryItem(item.getItemId(), item);
        return updated.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @DeleteMapping("/delete")
    public ResponseEntity<Void> deleteInventoryItem(
            @RequestParam(required = false) String id,
            @RequestBody(required = false) InventoryItem item) {
        if (id != null && !id.isEmpty()) {
            inventoryService.deleteInventoryItem(id);
        } else if (item != null) {
            inventoryService.deleteInventoryItem(item);
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
        return ResponseEntity.ok().build();
    }
}
