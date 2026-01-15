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

    public InventoryItem getInventoryItem(String itemId) {
        return itemsRepository.getItem(itemId);
    }

    public void deleteInventoryItem(String itemId) {
        itemsRepository.deleteItemById(itemId);
    }

    public void deleteInventoryItem(InventoryItem item) {
        itemsRepository.deleteItemByItem(item);
    }

    public void updateStockLevelByItemId(String itemId, int stockLevel) {
        itemsRepository.updateItemStockLevelByItemId(itemId, stockLevel);
    }

    public void updatePriceByItemId(String itemId, float price) {
        itemsRepository.updateItemPriceByItemId(itemId, price);
    }

    public void updateNameByItemId(String itemId, String name) {
        itemsRepository.updateItemNameByItemId(itemId, name);
    }

    public void updateThresholdByItemId(String itemId, int threshold) {
        itemsRepository.updateThresholdByItemId(itemId, threshold);
    }

    public void updateDescriptionByItemId(String itemId, String description) {
        itemsRepository.updateDescriptionByItemId(itemId, description);
    }

    public void updateAvailableByItemId(String itemId, boolean available) {
        itemsRepository.updateAvailableByItemId(itemId, available);
    }
}
