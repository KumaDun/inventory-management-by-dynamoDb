package com.example.demo.dao;

import com.example.demo.model.InventoryItem;
import org.springframework.beans.factory.annotation.Value;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;

@Repository
public class ItemsRepository {
    private final DynamoDbEnhancedClient enhancedClient;
    private final DynamoDbTable<InventoryItem> itemsTable;

    @Autowired
    public ItemsRepository(DynamoDbEnhancedClient enhancedClient,
                           @Value("${dynamodb.inventory.table.itemsTable.name}") String tableName) {
        this.enhancedClient = enhancedClient;
        this.itemsTable = enhancedClient.table(tableName, TableSchema.fromBean(InventoryItem.class));
    }

    public void putItem(InventoryItem inventoryItem) {
        itemsTable.putItem(inventoryItem);
    }

    public InventoryItem getItem(String id) {
        return itemsTable.getItem(inventoryItem -> inventoryItem.key(k -> k.partitionValue(id)));
    }

    public void deleteItem(InventoryItem inventoryItem) {
        itemsTable.deleteItem(inventoryItem);
    }
}
