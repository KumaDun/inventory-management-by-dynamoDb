package com.example.demo.service;

import com.example.demo.dao.InventoryDAO;
import com.example.demo.model.InventoryItem;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class InventoryService {
    private final InventoryDAO inventoryDAO;

    @Autowired
    public InventoryService(InventoryDAO inventoryDAO) {
        this.inventoryDAO = inventoryDAO;
    }

    public void addInventoryItem(InventoryItem item) {
        inventoryDAO.saveItem(item);
    }

    public InventoryItem getInventoryItem(String id) {
        return inventoryDAO.loadItem(id);
    }
}
