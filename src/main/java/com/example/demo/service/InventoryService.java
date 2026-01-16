package com.example.demo.service;

import com.example.demo.dao.ItemsRepository;
import com.example.demo.exceptions.daoExceptions.InventoryDaoConflictException;
import com.example.demo.exceptions.daoExceptions.InventoryDaoPersistenceException;
import com.example.demo.exceptions.serviceExceptions.InventoryOperationFailedException;
import com.example.demo.exceptions.serviceExceptions.ItemAlreadyExistsException;
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

    public void putInventoryItem(InventoryItem item) {
        try {
            itemsRepository.putItem(item);
        } catch (InventoryDaoConflictException ex) {
            throw new ItemAlreadyExistsException("PutItem with id " + item.getItemId() + " already exists or condition check failed",
                    ex);
        } catch (InventoryDaoPersistenceException ex) {
            throw new InventoryOperationFailedException("Database failure (putInventoryItem), please try later", ex);
        }
    }

    public Optional<InventoryItem> getInventoryItem(String itemId) {
        try {
            return itemsRepository.getItem(itemId);
        } catch (InventoryDaoConflictException ex) {
            throw new ItemAlreadyExistsException("getInventoryItem with id " + itemId + " already exists or condition check failed",
                    ex);
        } catch (InventoryDaoPersistenceException ex) {
            throw new InventoryOperationFailedException("Database failure (getInventoryItem), please try later", ex);
        }
    }

    public void deleteInventoryItem(String itemId) {
        try {
            itemsRepository.deleteItemById(itemId);
        } catch (InventoryDaoConflictException ex) {
            throw new ItemAlreadyExistsException("deleteInventoryItem with id " + itemId + " already exists or condition check failed",
                    ex);
        } catch (InventoryDaoPersistenceException ex) {
            throw new InventoryOperationFailedException("Database failure (deleteInventoryItem), please try later", ex);
        }
    }

    public void deleteInventoryItem(InventoryItem item) {
        try {
            itemsRepository.deleteItemByItem(item);
        } catch (InventoryDaoConflictException ex) {
            throw new ItemAlreadyExistsException("deleteInventoryItem with id " + item.getItemId() + " already exists or condition check failed",
                    ex);
        } catch (InventoryDaoPersistenceException ex) {
            throw new InventoryOperationFailedException("Database failure (deleteInventoryItem), please try later", ex);
        }
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
