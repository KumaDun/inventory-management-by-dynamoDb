package com.example.demo.dao;

import com.example.demo.model.OrderItem;
import com.example.demo.model.OrderStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Repository;
import software.amazon.awssdk.core.pagination.sync.SdkIterable;
import software.amazon.awssdk.enhanced.dynamodb.*;
import software.amazon.awssdk.enhanced.dynamodb.model.*;

import java.time.Instant;

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

    public OrderItem getOrderByCustomerIdAndOrderTime(String customerId, String orderTime) {
        return orderTable.getItem(GetItemEnhancedRequest.builder()
                .key(Key.builder()
                        .partitionValue(customerId)
                        .sortValue(orderTime)
                        .build())
                .build());
    }

    public OrderItem getOrderByOrderId(String orderId) {
        SdkIterable<Page<OrderItem>> iterable = orderTable.index("orderIdIndex").query(
                QueryEnhancedRequest.builder()
                        .queryConditional(QueryConditional.keyEqualTo(
                                Key.builder().partitionValue(orderId).build()
                        ))
                        .limit(1) // optional: limit to 1 item
                        .build()
        );

        // Get first item from the first page
        for (Page<OrderItem> page : iterable) {
            if (!page.items().isEmpty()) {
                return page.items().get(0);
            }
        }
        return null;
    }

    public void updateOrderStatusByCustomerIdAndOrderTimes(
            String customerId, String orderTime, OrderStatus status) {
        OrderItem orderToUpdate = new OrderItem();
        orderToUpdate.setCustomerId(customerId);
        orderToUpdate.setOrderTime(orderTime);
        orderToUpdate.setStatus(status);
        UpdateItemEnhancedRequest<OrderItem> request =
                UpdateItemEnhancedRequest.<OrderItem>builder(OrderItem.class)
                        .item(orderToUpdate)
                        .ignoreNulls(true)
                        .build();
        orderTable.updateItem(request);
    }

    public void updateOrderStatus(String orderId, OrderStatus status) {
        OrderItem orderItem = this.getOrderByOrderId(orderId);
        if (orderItem != null) {
            OrderItem newOrder = new OrderItem();
            newOrder.setCustomerId(orderItem.getCustomerId());
            newOrder.setOrderTime(orderItem.getOrderTime());
            newOrder.setStatus(status);
            orderTable.updateItem(UpdateItemEnhancedRequest.<OrderItem>builder(OrderItem.class)
                            .item(newOrder)
                            .ignoreNulls(true)
                            .build());
        }
    }

    public boolean isOrderExpired(String orderId) {
        OrderItem orderItem = this.getOrderByOrderId(orderId);
        if (orderItem != null && orderItem.getOrderTime()!= null) {
            Instant expireTime = Instant.parse(orderItem.getHoldExpiryTime());
            return Instant.now().isAfter(expireTime);
        }
        return false;
    }
}
