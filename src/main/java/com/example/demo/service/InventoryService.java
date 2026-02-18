package com.example.demo.service;

import com.example.demo.dao.ItemsRepository;
import com.example.demo.exceptions.daoExceptions.DaoConflictException;
import com.example.demo.exceptions.daoExceptions.DaoPersistenceException;
import com.example.demo.exceptions.serviceExceptions.OperationFailedException;
import com.example.demo.exceptions.serviceExceptions.ItemConflictException;
import com.example.demo.model.InventoryItem;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class InventoryService {
    private final ItemsRepository itemsRepository;

    @Autowired
    public InventoryService(ItemsRepository itemsRepository) {
        this.itemsRepository = itemsRepository;
    }

    public Optional<InventoryItem> putInventoryItem(InventoryItem item) {
        try {
            return itemsRepository.putItem(item);
        } catch (DaoConflictException ex) {
            throw new ItemConflictException(
                    "PutItem with id " + item.getItemId() + " already exists or condition check failed",
                    ex);
        } catch (DaoPersistenceException ex) {
            throw new OperationFailedException("Database failure (putInventoryItem), please try later", ex);
        }
    }

    public Optional<InventoryItem> getInventoryItem(String itemId) {
        try {
            return itemsRepository.getItem(itemId);
        } catch (DaoConflictException ex) {
            throw new ItemConflictException(
                    "getInventoryItem with id " + itemId + " already exists or condition check failed",
                    ex);
        } catch (DaoPersistenceException ex) {
            throw new OperationFailedException("Database failure (getInventoryItem), please try later", ex);
        }
    }

    public void deleteInventoryItem(String itemId) {
        try {
            itemsRepository.deleteItemById(itemId);
        } catch (DaoConflictException ex) {
            throw new ItemConflictException(
                    "deleteInventoryItem with id " + itemId + " already exists or condition check failed",
                    ex);
        } catch (DaoPersistenceException ex) {
            throw new OperationFailedException("Database failure (deleteInventoryItem), please try later", ex);
        }
    }

    public void deleteInventoryItem(InventoryItem item) {
        try {
            itemsRepository.deleteItemByItem(item);
        } catch (DaoConflictException ex) {
            throw new ItemConflictException(
                    "deleteInventoryItem with id " + item.getItemId() + " already exists or condition check failed",
                    ex);
        } catch (DaoPersistenceException ex) {
            throw new OperationFailedException("Database failure (deleteInventoryItem), please try later", ex);
        }
    }

    public Optional<InventoryItem> updateInventoryItem(String itemId, InventoryItem item) {
        return itemsRepository.updateAttributeByItemId(item.getItemId(), item);
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

    public java.util.List<InventoryItem> getInventoryItems() {
        return itemsRepository.scanItems();
    }
}
