package com.example.demo.dao;

import com.example.demo.model.OrderItem;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Repository;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;

@Repository
public class OrderRepository {
    private final DynamoDbEnhancedClient enhancedClient;
    private final DynamoDbTable<OrderItem> orderTable;

    @Autowired
    public OrderRepository(DynamoDbEnhancedClient enhancedClient,
                           @Value("${dynamodb.inventory.table.ordersTable.name}") String tableName) {
        this.enhancedClient = enhancedClient;
        this.orderTable = enhancedClient.table(tableName, TableSchema.fromBean(OrderItem.class));
    }

    public void saveItem(OrderItem item) {
        orderTable.putItem(item);
    }

    public OrderItem loadItem(String id) {
        // TODO should use orderId or customerId?
        return orderTable.getItem(item -> item.key(k -> k.partitionValue(id)));
    }

    public void deleteItem(OrderItem item) {
        orderTable.deleteItem(item);
    }
}
