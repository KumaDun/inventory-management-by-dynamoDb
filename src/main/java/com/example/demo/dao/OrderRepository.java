package com.example.demo.dao;

import com.example.demo.model.OrderItem;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Repository;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.Key;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;
import software.amazon.awssdk.enhanced.dynamodb.model.PageIterable;
import software.amazon.awssdk.enhanced.dynamodb.model.QueryConditional;
import software.amazon.awssdk.enhanced.dynamodb.model.QueryEnhancedRequest;

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

    public void putItem(OrderItem orderItem) {
        orderTable.putItem(orderItem);
    }

    public OrderItem loadItem(String orderId) {
        return orderTable.getItem(item -> item.key(k -> k.partitionValue(orderId)));
    }

    public void deleteItem(OrderItem item) {
        orderTable.deleteItem(item);
    }

    public PageIterable<OrderItem> getOrdersByCustomerId(String customerId) {
        return orderTable.query(QueryEnhancedRequest.builder()
                .queryConditional(
                        QueryConditional.keyEqualTo(
                                Key.builder().partitionValue(customerId)
                                        .build()
                        )
                )
                .build());
    }
}
