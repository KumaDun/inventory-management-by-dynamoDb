package com.example.demo.dao;

import com.example.demo.model.InventoryItem;
import org.springframework.beans.factory.annotation.Value;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;

@Repository
public class InventoryDAO {
    private final DynamoDbEnhancedClient enhancedClient;
    private final DynamoDbTable<InventoryItem> inventoryTable;

    @Autowired
    public InventoryDAO(DynamoDbEnhancedClient enhancedClient,
                        @Value("${dynamodb.inventory.table.name}") String tableName) {
        this.enhancedClient = enhancedClient;
        this.inventoryTable = enhancedClient.table(tableName, TableSchema.fromBean(InventoryItem.class));
    }

    public void saveItem(InventoryItem item) {
        inventoryTable.putItem(item);
    }

    public InventoryItem loadItem(String id) {
        return inventoryTable.getItem(item -> item.key(k -> k.partitionValue(id)));
    }

    public void deleteItem(InventoryItem item) {
        inventoryTable.deleteItem(item);
    }
}
