package com.example.demo.dao;

import com.example.demo.exceptions.daoExceptions.DaoConflictException;
import com.example.demo.exceptions.daoExceptions.DaoPersistenceException;
import com.example.demo.model.InventoryItem;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import software.amazon.awssdk.enhanced.dynamodb.*;
import software.amazon.awssdk.enhanced.dynamodb.model.PutItemEnhancedRequest;
import software.amazon.awssdk.enhanced.dynamodb.model.ScanEnhancedRequest;
import software.amazon.awssdk.enhanced.dynamodb.model.UpdateItemEnhancedRequest;
import software.amazon.awssdk.services.dynamodb.model.ConditionalCheckFailedException;
import software.amazon.awssdk.services.dynamodb.model.DynamoDbException;

import java.util.Optional;
import java.util.UUID;
import java.util.function.Consumer;
import java.util.List;
import java.util.ArrayList;

@Repository
public class ItemsRepository {
    private final DynamoDbTable<InventoryItem> itemsTable;

    @Autowired
    public ItemsRepository(DynamoDbEnhancedClient enhancedClient,
            @Value("${dynamodb.inventory.table.itemsTable.name}") String tableName) {
        this.itemsTable = enhancedClient.table(tableName, TableSchema.fromBean(InventoryItem.class));
    }

    public Optional<InventoryItem> putItem(InventoryItem inventoryItem) {
        try {
            if (inventoryItem.getItemId() == null || inventoryItem.getItemId().isBlank()) {
                inventoryItem.setItemId(UUID.randomUUID().toString());
            }
            // 2) Condition: don't overwrite if itemId already exists
            Expression notExists = Expression.builder()
                    .expression("attribute_not_exists(#pk)")
                    .expressionNames(java.util.Map.of("#pk", "itemId"))
                    .build();
            PutItemEnhancedRequest<InventoryItem> request =
                    PutItemEnhancedRequest.builder(InventoryItem.class)
                            .item(inventoryItem)
                            .conditionExpression(notExists)
                            .build();
            itemsTable.putItem(request);

            return Optional.ofNullable(inventoryItem);
        } catch (ConditionalCheckFailedException ex) {
            throw new DaoConflictException(
                    "Inventory item already exists or condition check failed",
                    ex);
        } catch (DynamoDbException ex) {
            throw new DaoPersistenceException(
                    "DynamoDB putItem operation failed",
                    ex);
        }
    }

    public Optional<InventoryItem> getItem(String itemId) {
        try {
            InventoryItem item = itemsTable.getItem(inventoryItem -> inventoryItem.key(k -> k.partitionValue(itemId)));
            return Optional.ofNullable(item);
        } catch (ConditionalCheckFailedException ex) {
            throw new DaoConflictException(
                    "Inventory getItem condition check failed",
                    ex);
        } catch (DynamoDbException ex) {
            throw new DaoPersistenceException(
                    "DynamoDB getItem operation failed",
                    ex);
        }
    }

    public void deleteItemById(String itemId) {
        try {
            itemsTable.deleteItem(Key.builder().partitionValue(itemId).build());
        } catch (ConditionalCheckFailedException ex) {
            throw new DaoConflictException(
                    "Inventory deleteItem condition check failed",
                    ex);
        } catch (DynamoDbException ex) {
            throw new DaoPersistenceException(
                    "DynamoDB deleteItem operation failed",
                    ex);
        }
    }

    public void deleteItemByItem(InventoryItem inventoryItem) {
        try {
            itemsTable.deleteItem(inventoryItem);
        } catch (ConditionalCheckFailedException ex) {
            throw new DaoConflictException(
                    "Inventory deleteItem condition check failed",
                    ex);
        } catch (DynamoDbException ex) {
            throw new DaoPersistenceException(
                    "DynamoDB deleteItem operation failed",
                    ex);
        }
    }

    private void updateAttributeByItemId(String itemId, Consumer<InventoryItem> setter) {
        InventoryItem inventoryItem = new InventoryItem();
        inventoryItem.setItemId(itemId);
        setter.accept(inventoryItem);
        itemsTable.updateItem(UpdateItemEnhancedRequest.builder(InventoryItem.class)
                .item(inventoryItem)
                .ignoreNulls(true)
                .build());
    }

    public void updateItemStockLevelByItemId(String itemId, int stockLevel) {
        this.updateAttributeByItemId(itemId, item -> item.setStockLevel(stockLevel));
    }

    public void updateItemPriceByItemId(String itemId, float price) {
        this.updateAttributeByItemId(itemId, item -> item.setPrice(price));
    }

    public void updateItemNameByItemId(String itemId, String name) {
        this.updateAttributeByItemId(itemId, item -> item.setName(name));
    }

    public void updateThresholdByItemId(String itemId, int threshold) {
        this.updateAttributeByItemId(itemId, item -> item.setThreshold(threshold));
    }

    public void updateDescriptionByItemId(String itemId, String description) {
        this.updateAttributeByItemId(itemId, item -> item.setDescription(description));
    }

    public void updateAvailableByItemId(String itemId, boolean available) {
        this.updateAttributeByItemId(itemId, item -> item.setAvailable(available));
    }

    public List<InventoryItem> scanItems() {
        try {
            List<InventoryItem> result = new ArrayList<>();
            itemsTable.scan(ScanEnhancedRequest.builder().consistentRead(true).build()).items().forEach(result::add);
            return result;
        } catch (DynamoDbException ex) {
            throw new DaoPersistenceException(
                    "DynamoDB scan operation failed",
                    ex);
        }
    }
}
