package com.example.demo.service;

import com.example.demo.dao.ItemsRepository;
import com.example.demo.model.InventoryItem;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class InventoryService {
    private final ItemsRepository itemsRepository;

    @Autowired
    public InventoryService(ItemsRepository itemsRepository) {
        this.itemsRepository = itemsRepository;
    }

    public void putInventoryItem(InventoryItem item) {
        itemsRepository.putItem(item);
    }

    public InventoryItem getInventoryItem(String id) {
        return itemsRepository.getItem(id);
    }
}
